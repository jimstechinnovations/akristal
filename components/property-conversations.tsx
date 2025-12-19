'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Clock } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { Database } from '@/types/database'

type ConversationRow = Database['public']['Tables']['conversations']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']
type MessageRow = Database['public']['Tables']['messages']['Row']

type ConversationWithParticipants = ConversationRow & {
  profiles_buyer_id: Pick<ProfileRow, 'full_name' | 'id'> | null
  profiles_seller_id: Pick<ProfileRow, 'full_name' | 'id'> | null
  last_message?: Pick<MessageRow, 'content' | 'created_at' | 'sender_id'> | null
}

interface PropertyConversationsProps {
  conversations: ConversationWithParticipants[]
  currentUserId: string
  propertyId: string
}

export function PropertyConversations({
  conversations,
  currentUserId,
  propertyId,
}: PropertyConversationsProps) {
  if (conversations.length === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Active Conversations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {conversations.map((conversation) => {
            // Determine the other participant
            const otherParticipant =
              currentUserId === conversation.buyer_id
                ? conversation.profiles_seller_id
                : conversation.profiles_buyer_id

            const otherParticipantName =
              otherParticipant?.full_name ||
              (currentUserId === conversation.buyer_id ? 'Seller' : 'Buyer')

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {otherParticipantName}
                      </span>
                    </div>
                    {conversation.last_message?.content && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {conversation.last_message.content}
                      </p>
                    )}
                    <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-500">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatRelativeTime(
                        conversation.last_message_at || conversation.created_at
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
