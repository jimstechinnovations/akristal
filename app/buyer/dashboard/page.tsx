import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PropertyCard } from '@/components/property-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart, MessageSquare, Search } from 'lucide-react'
import { RemoveFavoriteButton } from '@/components/remove-favorite-button'
import type { Database } from '@/types/database'

type PropertyRow = Database['public']['Tables']['properties']['Row']
type FavoriteWithProperty = {
  property_id: string
  properties: PropertyRow | null
}
type ConversationRow = Database['public']['Tables']['conversations']['Row']
type ConversationWithProperty = ConversationRow & { properties: Pick<PropertyRow, 'title' | 'id'> | null }

export default async function BuyerDashboard() {
  const user = await requireRole(['buyer', 'admin'])
  const supabase = await createClient()

  // Get favorites
  const { data: favorites } = await supabase
    .from('property_favorites')
    .select('property_id, properties(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6)

  // Get recent messages
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, properties(title, id)')
    .eq('buyer_id', user.id)
    .order('last_message_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0d233e] dark:text-white">
            Welcome back, {user.profile.full_name || 'Buyer'}!
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your property searches and inquiries
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#0d233e] dark:text-white text-base sm:text-lg">
                <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Browse Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Discover your perfect property
              </p>
              <Link href="/properties">
                <Button className="w-full sm:w-auto bg-[#0d233e] hover:bg-[#0a1a2e] text-white">View Properties</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#1e293b]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#0d233e] dark:text-white text-base sm:text-lg">
                <Heart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {favorites?.length || 0} saved properties
              </p>
              <Link href="/buyer/favorites">
                <Button variant="outline" className="w-full sm:w-auto">View Favorites</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#1e293b]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#0d233e] dark:text-white text-base sm:text-lg">
                <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {conversations?.length || 0} active conversations
              </p>
              <Link href="/messages">
                <Button variant="outline" className="w-full sm:w-auto">View Messages</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {favorites && favorites.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#0d233e] dark:text-white">Your Favorites</h2>
            <Link href="/buyer/favorites">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                Manage All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(favorites as FavoriteWithProperty[]).map((fav) => (
              <div
                key={fav.property_id}
                className="bg-white dark:bg-[#1e293b] rounded-lg overflow-hidden shadow-sm"
              >
                {fav.properties ? <PropertyCard property={fav.properties} /> : null}
                <div className="p-3 sm:p-4 pt-0">
                  <RemoveFavoriteButton propertyId={fav.property_id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conversations && conversations.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#0d233e] dark:text-white">Recent Conversations</h2>
            <Link href="/messages">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                View All
              </Button>
            </Link>
          </div>
          <Card className="bg-white dark:bg-[#1e293b]">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {(conversations as ConversationWithProperty[]).map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="block p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="font-semibold text-[#0d233e] dark:text-white text-sm sm:text-base">
                      {conv.properties?.title || 'Property Conversation'}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
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
    </div>
  )
}


