import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { PropertyDetails } from '@/components/property-details'
import { PropertyContact } from '@/components/property-contact'
import { PropertySellerActions } from '@/components/property-seller-actions'
import { PropertyConversations } from '@/components/property-conversations'
import { getCurrentUser } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'
import { Building2, MapPin, Bed, Bath, Car, Calendar } from 'lucide-react'
import type { Database } from '@/types/database'

type PropertyRow = Database['public']['Tables']['properties']['Row']
type SellerProfile = Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'email' | 'phone'>
type PropertyWithSeller = PropertyRow & { profiles: SellerProfile | SellerProfile[] | null }
type ConversationRow = Database['public']['Tables']['conversations']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']
type MessageRow = Database['public']['Tables']['messages']['Row']
type ConversationWithBuyer = ConversationRow & {
  profiles_buyer_id: Pick<ProfileRow, 'full_name' | 'id'> | null
}
type ConversationWithParticipants = ConversationRow & {
  profiles_buyer_id: Pick<ProfileRow, 'full_name' | 'id'> | null
  profiles_seller_id: Pick<ProfileRow, 'full_name' | 'id'> | null
  last_message?: Pick<MessageRow, 'content' | 'created_at' | 'sender_id'> | null
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = resolvedParams.id
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select('*, profiles:seller_id(full_name, email, phone)')
    .eq('id', id)
    .single()
  const property = data as PropertyWithSeller | null

  if (error || !property) {
    notFound()
  }

  // Increment view count
  await (supabase as any)
    .from('properties')
    .update({ views_count: (property.views_count || 0) + 1 })
    .eq('id', id)

  const seller = Array.isArray(property.profiles) ? property.profiles[0] : property.profiles

  // Check if current user is the seller
  const currentUser = await getCurrentUser()
  const isSeller = currentUser?.id === property.seller_id

  // Fetch conversations for seller (all conversations on this property)
  let sellerConversations: ConversationWithBuyer[] = []
  if (isSeller) {
    const { data: conversationsData } = await supabase
      .from('conversations')
      .select('*, profiles_buyer_id:buyer_id(full_name, id)')
      .eq('property_id', id)
      .order('last_message_at', { ascending: false })

    sellerConversations = (conversationsData as ConversationWithBuyer[] | null) ?? []
  }

  // Fetch conversations for current user (if logged in) - shows their conversations on this property
  let userConversations: ConversationWithParticipants[] = []
  if (currentUser) {
    const { data: userConvData } = await supabase
      .from('conversations')
      .select(
        '*, profiles_buyer_id:buyer_id(full_name, id), profiles_seller_id:seller_id(full_name, id)'
      )
      .eq('property_id', id)
      .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
      .order('last_message_at', { ascending: false })

    const conversations = (userConvData as ConversationWithParticipants[] | null) ?? []

    // Fetch last message for each conversation
    for (const conv of conversations) {
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (lastMsg) {
        conv.last_message = lastMsg as Pick<MessageRow, 'content' | 'created_at' | 'sender_id'>
      }
    }

    userConversations = conversations
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {property.title}
        </h1>
        <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400">
          <MapPin className="mr-1 h-5 w-5" />
          <span>
            {property.address}, {property.city}, {property.country}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {formatCurrency(property.price, property.currency)}
        </p>
      </div>

      {/* Image Gallery */}
      {property.image_urls && property.image_urls.length > 0 ? (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {property.image_urls.slice(0, 6).map((url, index) => (
            <div key={index} className="relative h-64 w-full overflow-hidden rounded-lg">
              <Image
                src={url}
                alt={`${property.title} - Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : property.cover_image_url ? (
        <div className="relative mb-8 h-96 w-full overflow-hidden rounded-lg">
          <Image
            src={property.cover_image_url}
            alt={property.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="mb-8 flex h-96 w-full items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
          <Building2 className="h-24 w-24 text-gray-400" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {property.description || 'No description provided.'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {property.bedrooms && (
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <Bed className="mb-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
                <div className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{property.bedrooms}</div>
              </div>
            )}
            {property.bathrooms && (
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <Bath className="mb-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
                <div className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{property.bathrooms}</div>
              </div>
            )}
            {property.parking_spaces && (
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <Car className="mb-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
                <div className="text-sm text-gray-600 dark:text-gray-400">Parking</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{property.parking_spaces}</div>
              </div>
            )}
            {property.size_sqm && (
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {property.size_sqm}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Square Meters</div>
              </div>
            )}
          </div>

          {property.year_built && (
            <div className="mb-6 flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="mr-2 h-5 w-5" />
              <span>Year Built: {property.year_built}</span>
            </div>
          )}

          <PropertyDetails property={property} />

          {/* Show conversations for current user if they have any */}
          {currentUser && userConversations.length > 0 && (
            <PropertyConversations
              conversations={userConversations}
              currentUserId={currentUser.id}
              propertyId={id}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          {isSeller ? (
            <PropertySellerActions property={property} conversations={sellerConversations} />
          ) : (
            <PropertyContact property={property} seller={seller} />
          )}
        </div>
      </div>
    </div>
  )
}


