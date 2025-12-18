'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'
import { MessageSquare, Phone, Mail, Heart } from 'lucide-react'
import type { Database } from '@/types/database'
import { getErrorMessage } from '@/lib/utils'

type Property = Database['public']['Tables']['properties']['Row']
type SellerContact = Pick<Database['public']['Tables']['profiles']['Row'], 'email' | 'phone'>

interface PropertyContactProps {
  property: Property
  seller: SellerContact | null
}

export function PropertyContact({ property, seller }: PropertyContactProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleInquiry = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please sign in to contact the seller')
      return
    }

    if (user.id === property.seller_id) {
      toast.error('You cannot contact yourself')
      return
    }

    setLoading(true)

    try {
      // Create or get conversation
      const { data: conversation, error: convError } = await (supabase as any)
        .from('conversations')
        .select('id')
        .eq('property_id', property.id)
        .eq('buyer_id', user.id)
        .eq('seller_id', property.seller_id)
        .single()

      let conversationId = (conversation as { id: string } | null)?.id

      if (!conversationId) {
        const { data: newConv, error: newConvError } = await (supabase as any)
          .from('conversations')
          .insert({
            property_id: property.id,
            buyer_id: user.id,
            seller_id: property.seller_id,
          })
          .select('id')
          .single()

        if (newConvError) throw newConvError
        conversationId = (newConv as { id: string }).id
      }

      // Create inquiry
      const { error: inquiryError } = await (supabase as any).from('inquiries').insert({
        property_id: property.id,
        buyer_id: user.id,
        seller_id: property.seller_id,
        message: message || 'Interested in this property',
      })

      if (inquiryError) throw inquiryError

      // Send message if provided
      if (message) {
        const { error: messageError } = await (supabase as any).from('messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: message,
        })

        if (messageError) throw messageError
      }

      toast.success('Message sent successfully!')
      setMessage('')

      // Navigate to the conversation (chat room) for this property
      router.push(`/messages/${conversationId}`)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please sign in to save favorites')
      return
    }

    try {
      if (isFavorite) {
        const { error } = await (supabase as any)
          .from('property_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id)

        if (error) throw error
        setIsFavorite(false)
        toast.success('Removed from favorites')
      } else {
        const { error } = await (supabase as any).from('property_favorites').insert({
          user_id: user.id,
          property_id: property.id,
        })

        if (error) throw error
        setIsFavorite(true)
        toast.success('Added to favorites')
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || 'Failed to update favorite')
    }
  }

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Contact Seller</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {seller && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Mail className="mr-2 h-4 w-4" />
              <span>{seller.email}</span>
            </div>
            {seller.phone && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Phone className="mr-2 h-4 w-4" />
                <span>{seller.phone}</span>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Message</label>
          <textarea
            className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
            placeholder="I'm interested in this property..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <Button
          onClick={handleInquiry}
          className="w-full"
          disabled={loading}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          {loading ? 'Sending...' : 'Send Message'}
        </Button>

        <Button
          variant="outline"
          onClick={toggleFavorite}
          className="w-full"
        >
          <Heart
            className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
          />
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </Button>
      </CardContent>
    </Card>
  )
}


