import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'
import type { Database } from '@/types/database'

type ConversationRow = Database['public']['Tables']['conversations']['Row']
type PropertyRow = Database['public']['Tables']['properties']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']
type MessageRow = Database['public']['Tables']['messages']['Row']
type ConversationWithJoins = ConversationRow & {
  properties: Pick<PropertyRow, 'title' | 'id' | 'cover_image_url'> | null
  profiles_buyer_id: Pick<ProfileRow, 'full_name'> | null
  profiles_seller_id: Pick<ProfileRow, 'full_name'> | null
}
type UnreadMessage = Pick<MessageRow, 'conversation_id'>

export default async function MessagesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const isAdmin = user.profile?.role === 'admin'

  // Get conversations for the user; admins can view all
  const baseQuery = supabase
    .from('conversations')
    .select(
      '*, properties(title, id, cover_image_url), profiles!conversations_buyer_id_fkey(full_name), profiles!conversations_seller_id_fkey(full_name)'
    )
    .order('last_message_at', { ascending: false })

  const conversationsResult = isAdmin
    ? await baseQuery
    : await baseQuery.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
  const conversations = (conversationsResult.data as unknown as ConversationWithJoins[] | null) ?? []

  // Get unread message counts
  const conversationIds = conversations.map((c) => c.id)
  const unreadCountsResult = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', conversationIds)
    .eq('is_read', false)
  const unreadCounts = (unreadCountsResult.data as unknown as UnreadMessage[] | null) ?? []

  const unreadMap = new Map<string, number>()
  unreadCounts.forEach((msg) => {
    unreadMap.set(msg.conversation_id, (unreadMap.get(msg.conversation_id) || 0) + 1)
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your conversations with buyers and sellers
        </p>
      </div>

      {conversations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {conversations.map((conv) => {
                const otherUser = isAdmin
                  ? null
                  : user.id === conv.buyer_id
                    ? conv.profiles_seller_id
                    : conv.profiles_buyer_id
                const unreadCount = unreadMap.get(conv.id) || 0

                return (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-start gap-4">
                      {conv.properties?.cover_image_url ? (
                        <img
                          src={conv.properties.cover_image_url}
                          alt={conv.properties.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
                          <MessageSquare className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">
                            {conv.properties?.title || 'Property Conversation'}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {formatRelativeTime(conv.last_message_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {isAdmin
                            ? `Buyer: ${conv.profiles_buyer_id?.full_name || 'User'} • Seller: ${conv.profiles_seller_id?.full_name || 'User'}`
                            : otherUser?.full_name || 'User'}
                        </p>
                        {unreadCount > 0 && (
                          <span className="mt-2 inline-block rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              No conversations yet. Start browsing properties to connect with sellers!
            </p>
            <Link href="/properties" className="mt-4 inline-block">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Browse Properties
              </button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


