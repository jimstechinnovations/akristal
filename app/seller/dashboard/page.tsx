import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PropertyCard } from '@/components/property-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, FileText, MessageSquare, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Database } from '@/types/database'

type PropertyRow = Database['public']['Tables']['properties']['Row']
type InquiryRow = Database['public']['Tables']['inquiries']['Row']
type ConversationRow = Database['public']['Tables']['conversations']['Row']
type InquiryWithProperty = InquiryRow & { properties: Pick<PropertyRow, 'title' | 'id'> | null }
type ConversationWithProperty = ConversationRow & { properties: Pick<PropertyRow, 'title' | 'id'> | null }

export default async function SellerDashboard() {
  const user = await requireRole(['seller', 'admin'])
  const supabase = await createClient()

  // Get user's properties
  const { data: propertiesData } = await supabase
    .from('properties')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
  const properties = propertiesData as PropertyRow[] | null

  // Get inquiries
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*, properties(title, id)')
    .eq('seller_id', user.id)
    .eq('status', 'new')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, properties(title, id)')
    .eq('seller_id', user.id)
    .order('last_message_at', { ascending: false })
    .limit(5)

  const stats = {
    total: properties?.length || 0,
    approved: properties?.filter((p) => p.listing_status === 'approved').length || 0,
    pending: properties?.filter((p) => p.listing_status === 'pending_approval').length || 0,
    sold: properties?.filter((p) => p.status === 'sold').length || 0,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Seller Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your property listings and inquiries
          </p>
        </div>
        <Link href="/seller/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Sold/Rented
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
          </CardContent>
        </Card>
      </div>

      {/* Properties */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Properties</h2>
          <Link href="/seller/properties">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                You haven't created any listings yet.
              </p>
              <Link href="/seller/properties/new" className="mt-4 inline-block">
                <Button>Create Your First Listing</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Inquiries */}
      {inquiries && inquiries.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">New Inquiries</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {(inquiries as InquiryWithProperty[]).map((inquiry) => (
                  <div key={inquiry.id} className="p-4">
                    <div className="font-semibold">
                      {inquiry.properties?.title || 'Property Inquiry'}
                    </div>
                    {inquiry.message && (
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {inquiry.message}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(inquiry.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversations */}
      {conversations && conversations.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Recent Conversations</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {(conversations as ConversationWithProperty[]).map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="font-semibold">
                      {conv.properties?.title || 'Property Conversation'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Last message: {new Date(conv.last_message_at).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


