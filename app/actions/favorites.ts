'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getErrorMessage } from '@/lib/utils'
import type { Database } from '@/types/database'

type FavoriteRow = Database['public']['Tables']['property_favorites']['Row']
type FavoriteIdRow = Pick<FavoriteRow, 'id'>
type FavoriteInsert = Database['public']['Tables']['property_favorites']['Insert']

export async function toggleFavorite(propertyId: string) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check if favorite exists
    const { data: existing } = await supabase
      .from('property_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single()

    const existingFavorite = (existing as unknown as FavoriteIdRow | null) ?? null

    if (existingFavorite?.id) {
      // Remove favorite
      const { error } = await supabase
        .from('property_favorites')
        .delete()
        .eq('id', existingFavorite.id)

      if (error) throw error
      revalidatePath('/properties')
      revalidatePath(`/properties/${propertyId}`)
      return { success: true, isFavorite: false }
    } else {
      // Add favorite
      type FavoriteInsertClient = {
        from: (table: 'property_favorites') => {
          insert: (values: FavoriteInsert) => Promise<{ error: { message: string } | null }>
        }
      }

      const { error } = await (supabase as unknown as FavoriteInsertClient).from('property_favorites').insert({
        user_id: user.id,
        property_id: propertyId,
      })

      if (error) throw error
      revalidatePath('/properties')
      revalidatePath(`/properties/${propertyId}`)
      return { success: true, isFavorite: true }
    }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getFavorites() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: favorites, error } = await supabase
      .from('property_favorites')
      .select('property_id, properties(*)')
      .eq('user_id', user.id)

    if (error) throw error

    return { success: true, favorites: favorites || [] }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

