import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { MessageThread } from '@/components/message-thread'
import type { Database } from '@/types/database'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireAuth()
  const supabase = await createClient()
  const isAdmin = user.profile?.role === 'admin'

  const { id } = await params

  type ConversationRow = Database['public']['Tables']['conversations']['Row']
  type MessageRow = Database['public']['Tables']['messages']['Row']
  type ProfileRow = Database['public']['Tables']['profiles']['Row']
  type PropertyRow = Database['public']['Tables']['properties']['Row']
  type ConversationWithProperty = ConversationRow & {
    properties: Pick<PropertyRow, 'title' | 'id'> | null
  }
  type MessageWithProfile = MessageRow & {
    profiles: Pick<ProfileRow, 'full_name' | 'avatar_url'> | null
  }
  // Get conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, properties(title, id)')
    .eq('id', id)
    .single()

  const conv = (conversation as unknown as ConversationWithProperty | null) ?? null

  if (!conv) {
    notFound()
  }

  // Check if user is part of this conversation
  if (!isAdmin && conv.buyer_id !== user.id && conv.seller_id !== user.id) {
    notFound()
  }

  // Get messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*, profiles!messages_sender_id_fkey(full_name, avatar_url)')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  // Mark messages as read
  // Use RLS-safe RPC: recipients are not the sender, so a direct UPDATE would fail under default policies.
  type MarkReadRpcClient = {
    rpc: (
      fn: 'mark_conversation_read',
      args: { p_conversation_id: string }
    ) => Promise<unknown>
  }

  await (supabase as unknown as MarkReadRpcClient).rpc('mark_conversation_read', {
    p_conversation_id: id,
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <MessageThread
        conversation={conv}
        messages={((messages as unknown as MessageWithProfile[] | null) ?? [])}
        currentUserId={user.id}
      />
    </div>
  )
}


