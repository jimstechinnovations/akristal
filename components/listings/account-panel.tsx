import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import type { Database } from '@/types/database'
import { PropertySellerActions } from '@/components/property-seller-actions'
import { PropertyConversations } from '@/components/property-conversations'
import { PropertyContact } from '@/components/property-contact'

type PropertyRow = Database['public']['Tables']['properties']['Row']
type ConversationRow = Database['public']['Tables']['conversations']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']
type MessageRow = Database['public']['Tables']['messages']['Row']
type Participant = Pick<ProfileRow, 'full_name' | 'id'> | null

/**
 * Account features carried over from the previous property page:
 * owners manage the listing and its conversations; signed-in buyers message through their inbox.
 * Renders nothing for visitors who are not signed in.
 */
export async function AccountPanel({ propertyId }: { propertyId: string }) {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  // The cookie-aware client from @supabase/ssr 0.5 doesn't infer row types; state them.
  const { data } = await supabase.from('properties').select('*').eq('id', propertyId).single()
  const property = data as PropertyRow | null
  if (!property) return null

  if (user.id === property.seller_id) {
    const { data: convs } = await supabase
      .from('conversations')
      .select('*, profiles_buyer_id:buyer_id(full_name, id)')
      .eq('property_id', propertyId)
      .order('last_message_at', { ascending: false })
    const conversations = (convs ?? []) as (ConversationRow & { profiles_buyer_id: Participant })[]
    return (
      <section aria-label="Manage your listing" className="mt-8">
        <PropertySellerActions property={property} conversations={conversations} />
      </section>
    )
  }

  const { data: convData } = await supabase
    .from('conversations')
    .select('*, profiles_buyer_id:buyer_id(full_name, id), profiles_seller_id:seller_id(full_name, id)')
    .eq('property_id', propertyId)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false })
  const conversations = (convData ?? []) as (ConversationRow & {
    profiles_buyer_id: Participant
    profiles_seller_id: Participant
    last_message?: Pick<MessageRow, 'content' | 'created_at' | 'sender_id'> | null
  })[]
  await Promise.all(
    conversations.map(async (conv) => {
      const { data: last } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (last) conv.last_message = last as Pick<MessageRow, 'content' | 'created_at' | 'sender_id'>
    })
  )

  return (
    <section aria-label="Your messages about this home" className="mt-8 grid gap-6">
      {conversations.length > 0 && <PropertyConversations conversations={conversations} currentUserId={user.id} propertyId={propertyId} />}
      <details className="rounded-md border border-line">
        <summary className="cursor-pointer px-5 py-4 text-[0.9375rem] font-medium">Message the seller through your account</summary>
        <div className="border-t border-line p-5">
          <PropertyContact property={property} seller={null} />
        </div>
      </details>
    </section>
  )
}
