'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { Database, PropertyType } from '@/types/database'
import { getErrorMessage } from '@/lib/utils'

type PropertyInsert = Database['public']['Tables']['properties']['Insert']
type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export async function createProperty(formData: FormData) {
  try {
    const user = await requireRole(['seller', 'agent', 'admin'])
    const supabase = await createClient()

    const isAdmin = user.profile.role === 'admin'

    const propertyData: PropertyInsert = {
      seller_id: user.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      property_type: formData.get('property_type') as PropertyType,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      district: formData.get('district') as string,
      province: formData.get('province') as string,
      price: parseFloat(formData.get('price') as string),
      size_sqm: formData.get('size_sqm')
        ? parseFloat(formData.get('size_sqm') as string)
        : null,
      bedrooms: formData.get('bedrooms')
        ? parseInt(formData.get('bedrooms') as string)
        : null,
      bathrooms: formData.get('bathrooms')
        ? parseInt(formData.get('bathrooms') as string)
        : null,
      parking_spaces: formData.get('parking_spaces')
        ? parseInt(formData.get('parking_spaces') as string)
        : null,
      year_built: formData.get('year_built')
        ? parseInt(formData.get('year_built') as string)
        : null,
      status: 'available',
      listing_status: isAdmin ? 'approved' : 'pending_approval',
      approved_at: isAdmin ? new Date().toISOString() : null,
      approved_by: isAdmin ? user.id : null,
    }

    type PropertiesInsertClient = {
      from: (table: 'properties') => {
        insert: (values: PropertyInsert) => {
          select: () => {
            single: () => Promise<{
              data: Database['public']['Tables']['properties']['Row'] | null
              error: { message: string } | null
            }>
          }
        }
      }
    }

    const { data: property, error } = await (supabase as unknown as PropertiesInsertClient)
      .from('properties')
      .insert(propertyData)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/properties')
    revalidatePath('/seller/dashboard')
    revalidatePath('/admin/properties')

    return { success: true, property }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateProperty(id: string, formData: FormData) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check if user owns the property or is admin
    const { data: existingProperty } = await supabase
      .from('properties')
      .select('seller_id')
      .eq('id', id)
      .single()

    const existingSeller =
      (existingProperty as unknown as Pick<Database['public']['Tables']['properties']['Row'], 'seller_id'> | null) ??
      null

    if (!existingSeller) {
      return { success: false, error: 'Property not found' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profileRole =
      (profile as unknown as Pick<Database['public']['Tables']['profiles']['Row'], 'role'> | null) ?? null

    if (existingSeller.seller_id !== user.id && profileRole?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const updateData: PropertyUpdate = {}

    const title = formData.get('title')
    if (typeof title === 'string') updateData.title = title

    const description = formData.get('description')
    if (typeof description === 'string') updateData.description = description

    const propertyType = formData.get('property_type')
    if (typeof propertyType === 'string') updateData.property_type = propertyType as PropertyType

    const address = formData.get('address')
    if (typeof address === 'string') updateData.address = address

    const city = formData.get('city')
    if (typeof city === 'string') updateData.city = city

    const district = formData.get('district')
    if (typeof district === 'string') updateData.district = district

    const province = formData.get('province')
    if (typeof province === 'string') updateData.province = province

    const price = formData.get('price')
    if (typeof price === 'string') {
      const parsed = parseFloat(price)
      updateData.price = Number.isFinite(parsed) ? parsed : undefined
    }

    const sizeSqm = formData.get('size_sqm')
    if (typeof sizeSqm === 'string') {
      const parsed = parseFloat(sizeSqm)
      updateData.size_sqm = Number.isFinite(parsed) ? parsed : undefined
    }

    const bedrooms = formData.get('bedrooms')
    if (typeof bedrooms === 'string') {
      const parsed = parseInt(bedrooms)
      updateData.bedrooms = Number.isFinite(parsed) ? parsed : undefined
    }

    const bathrooms = formData.get('bathrooms')
    if (typeof bathrooms === 'string') {
      const parsed = parseInt(bathrooms)
      updateData.bathrooms = Number.isFinite(parsed) ? parsed : undefined
    }

    const parkingSpaces = formData.get('parking_spaces')
    if (typeof parkingSpaces === 'string') {
      const parsed = parseInt(parkingSpaces)
      updateData.parking_spaces = Number.isFinite(parsed) ? parsed : undefined
    }

    const yearBuilt = formData.get('year_built')
    if (typeof yearBuilt === 'string') {
      const parsed = parseInt(yearBuilt)
      updateData.year_built = Number.isFinite(parsed) ? parsed : undefined
    }

    type PropertiesUpdateClient = {
      from: (table: 'properties') => {
        update: (values: PropertyUpdate) => {
          eq: (column: 'id', value: string) => {
            select: () => {
              single: () => Promise<{
                data: Database['public']['Tables']['properties']['Row'] | null
                error: { message: string } | null
              }>
            }
          }
        }
      }
    }

    const { data: property, error } = await (supabase as unknown as PropertiesUpdateClient)
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/properties/${id}`)
    revalidatePath('/seller/dashboard')
    revalidatePath('/admin/properties')

    return { success: true, property }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteProperty(id: string) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Check if user owns the property or is admin
    const { data: existingProperty } = await supabase
      .from('properties')
      .select('seller_id')
      .eq('id', id)
      .single()

    const existingSeller =
      (existingProperty as unknown as Pick<Database['public']['Tables']['properties']['Row'], 'seller_id'> | null) ??
      null

    if (!existingSeller) {
      return { success: false, error: 'Property not found' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const profileRole =
      (profile as unknown as Pick<Database['public']['Tables']['profiles']['Row'], 'role'> | null) ?? null

    if (existingSeller.seller_id !== user.id && profileRole?.role !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    const { error } = await supabase.from('properties').delete().eq('id', id)

    if (error) throw error

    revalidatePath('/properties')
    revalidatePath('/seller/dashboard')
    revalidatePath('/admin/properties')

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function approveProperty(id: string) {
  try {
    const user = await requireRole(['admin'])
    const supabase = await createClient()

    const update: PropertyUpdate = {
      listing_status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    }

    type PropertiesUpdateClient = {
      from: (table: 'properties') => {
        update: (values: PropertyUpdate) => {
          eq: (column: 'id', value: string) => {
            select: () => {
              single: () => Promise<{
                data: Database['public']['Tables']['properties']['Row'] | null
                error: { message: string } | null
              }>
            }
          }
        }
      }
    }

    const { data: property, error } = await (supabase as unknown as PropertiesUpdateClient)
      .from('properties')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Send email notification (would need email service)
    // await sendListingApprovalEmail(...)

    revalidatePath('/admin/properties')
    revalidatePath(`/properties/${id}`)

    return { success: true, property }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function rejectProperty(id: string, reason: string) {
  try {
    const user = await requireRole(['admin'])
    const supabase = await createClient()

    const update: PropertyUpdate = {
      listing_status: 'rejected',
      rejection_reason: reason,
    }

    type PropertiesUpdateClient = {
      from: (table: 'properties') => {
        update: (values: PropertyUpdate) => {
          eq: (column: 'id', value: string) => {
            select: () => {
              single: () => Promise<{
                data: Database['public']['Tables']['properties']['Row'] | null
                error: { message: string } | null
              }>
            }
          }
        }
      }
    }

    const { data: property, error } = await (supabase as unknown as PropertiesUpdateClient)
      .from('properties')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Send email notification
    // await sendListingApprovalEmail(...)

    revalidatePath('/admin/properties')

    return { success: true, property }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

