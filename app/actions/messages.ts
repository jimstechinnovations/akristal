'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database'
import { getErrorMessage } from '@/lib/utils'

type ConversationRow = Database['public']['Tables']['conversations']['Row']
type MessageRow = Database['public']['Tables']['messages']['Row']
type PropertyRow = Database['public']['Tables']['properties']['Row']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type ConversationInsert = Database['public']['Tables']['conversations']['Insert']

export async function sendMessage(conversationId: string, content: string) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Verify user is part of conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single()

    const participants =
      (conversation as unknown as Pick<ConversationRow, 'buyer_id' | 'seller_id'> | null) ?? null

    if (!participants) {
      return { success: false, error: 'Conversation not found' }
    }

    if (participants.buyer_id !== user.id && participants.seller_id !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    type MessagesInsertClient = {
      from: (table: 'messages') => {
        insert: (values: MessageInsert) => {
          select: () => {
            single: () => Promise<{ data: MessageRow | null; error: { message: string } | null }>
          }
        }
      }
    }

    const { data: message, error } = await (supabase as unknown as MessagesInsertClient)
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/messages/${conversationId}`)
    revalidatePath('/messages')

    return { success: true, message: message as MessageRow }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function createConversation(propertyId: string, message: string) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Get property to find seller
    const { data: property } = await supabase
      .from('properties')
      .select('seller_id')
      .eq('id', propertyId)
      .single()

    if (!property) {
      return { success: false, error: 'Property not found' }
    }

    const sellerId = (property as Pick<PropertyRow, 'seller_id'>).seller_id

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('property_id', propertyId)
      .eq('buyer_id', user.id)
      .eq('seller_id', sellerId)
      .single()

    let conversationId: string

    const existingConvRow =
      (existingConv as unknown as Pick<ConversationRow, 'id'> | null) ?? null

    if (existingConvRow?.id) {
      conversationId = existingConvRow.id
    } else {
      // Create new conversation
      type ConversationsInsertClient = {
        from: (table: 'conversations') => {
          insert: (values: ConversationInsert) => {
            select: () => {
              single: () => Promise<{ data: ConversationRow | null; error: { message: string } | null }>
            }
          }
        }
      }

      const { data: newConv, error: convError } = await (supabase as unknown as ConversationsInsertClient)
        .from('conversations')
        .insert({
          property_id: propertyId,
          buyer_id: user.id,
          seller_id: sellerId,
        })
        .select()
        .single()

      if (convError) throw convError
      conversationId = (newConv as ConversationRow).id
    }

    // Send initial message
    type MessagesInsertClient = {
      from: (table: 'messages') => {
        insert: (values: MessageInsert) => {
          select: () => {
            single: () => Promise<{ data: MessageRow | null; error: { message: string } | null }>
          }
        }
      }
    }

    const { data: msg, error: msgError } = await (supabase as unknown as MessagesInsertClient)
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: message,
      })
      .select()
      .single()

    if (msgError) throw msgError

    revalidatePath('/messages')
    revalidatePath(`/messages/${conversationId}`)

    return { success: true, conversationId, message: msg as MessageRow }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

