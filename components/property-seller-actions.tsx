'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteProperty } from '@/app/actions/properties'
import toast from 'react-hot-toast'
import { Edit, Trash2, MessageSquare } from 'lucide-react'
import { getErrorMessage } from '@/lib/utils'
import Link from 'next/link'
import type { Database } from '@/types/database'

type Property = Database['public']['Tables']['properties']['Row']
type ConversationRow = Database['public']['Tables']['conversations']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

type ConversationWithBuyer = ConversationRow & {
  profiles_buyer_id: Pick<ProfileRow, 'full_name' | 'id'> | null
}

interface PropertySellerActionsProps {
  property: Property
  conversations: ConversationWithBuyer[]
}

export function PropertySellerActions({ property, conversations }: PropertySellerActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const result = await deleteProperty(property.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Property deleted successfully')
        router.push('/seller/dashboard')
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to delete property')
    } finally {
      setDeleting(false)
    }
  }

  const getEditLink = () => {
    // Check if user is admin to determine edit route
    // For now, we'll use seller route - can be enhanced later
    return `/seller/properties/${property.id}/edit`
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Manage Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href={getEditLink()} className="block">
            <Button className="w-full" variant="default">
              <Edit className="mr-2 h-4 w-4" />
              Edit Property
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete Property'}
          </Button>
        </CardContent>
      </Card>

      {conversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="block rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {conversation.profiles_buyer_id?.full_name || 'Buyer'}
                      </span>
                    </div>
                    {conversation.last_message_at && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(conversation.last_message_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
