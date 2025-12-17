'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database'

export async function deleteUser(userId: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteProperty(propertyId: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/properties')
  revalidatePath('/properties')
  return { success: true }
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  await requireAdmin()
  const supabase = await createClient()

  const update: Database['public']['Tables']['profiles']['Update'] = { is_active: isActive }

  type ProfilesUpdateQuery = {
    update: (values: Database['public']['Tables']['profiles']['Update']) => {
      eq: (column: 'id', value: string) => Promise<{ error: { message: string } | null }>
    }
  }
  type ProfilesUpdateClient = { from: (table: 'profiles') => ProfilesUpdateQuery }

  const { error } = await (supabase as unknown as ProfilesUpdateClient)
    .from('profiles')
    .update(update)
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateUser(userId: string, formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()

  const update: Database['public']['Tables']['profiles']['Update'] = {
    full_name: formData.get('full_name')?.toString() || null,
    phone: formData.get('phone')?.toString() || null,
    role: formData.get('role')?.toString() as Database['public']['Tables']['profiles']['Row']['role'] | undefined,
    bio: formData.get('bio')?.toString() || null,
    company_name: formData.get('company_name')?.toString() || null,
    license_number: formData.get('license_number')?.toString() || null,
    is_verified: formData.get('is_verified') === 'true',
    is_active: formData.get('is_active') === 'true',
  }

  // Remove undefined values
  Object.keys(update).forEach((key) => {
    if (update[key as keyof typeof update] === undefined) {
      delete update[key as keyof typeof update]
    }
  })

  type ProfilesUpdateQuery = {
    update: (values: Database['public']['Tables']['profiles']['Update']) => {
      eq: (column: 'id', value: string) => Promise<{ error: { message: string } | null }>
    }
  }
  type ProfilesUpdateClient = { from: (table: 'profiles') => ProfilesUpdateQuery }

  const { error } = await (supabase as unknown as ProfilesUpdateClient)
    .from('profiles')
    .update(update)
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}/edit`)
  return { success: true }
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()

  const update: Database['public']['Tables']['categories']['Update'] = {
    name: formData.get('name')?.toString(),
    slug: formData.get('slug')?.toString(),
    description: formData.get('description')?.toString() || null,
    icon: formData.get('icon')?.toString() || null,
    color: formData.get('color')?.toString() || null,
    display_order: formData.get('display_order') ? parseInt(formData.get('display_order')!.toString()) : undefined,
    is_active: formData.get('is_active') === 'true',
  }

  // Remove undefined values
  const cleanUpdate: Database['public']['Tables']['categories']['Update'] = {}
  if (update.name !== undefined) cleanUpdate.name = update.name
  if (update.slug !== undefined) cleanUpdate.slug = update.slug
  if (update.description !== undefined) cleanUpdate.description = update.description
  if (update.icon !== undefined) cleanUpdate.icon = update.icon
  if (update.color !== undefined) cleanUpdate.color = update.color
  if (update.display_order !== undefined) cleanUpdate.display_order = update.display_order
  if (update.is_active !== undefined) cleanUpdate.is_active = update.is_active

  type CategoriesUpdateQuery = {
    update: (values: Database['public']['Tables']['categories']['Update']) => {
      eq: (column: 'id', value: string) => Promise<{ error: { message: string } | null }>
    }
  }
  type CategoriesUpdateClient = { from: (table: 'categories') => CategoriesUpdateQuery }

  const { error } = await (supabase as unknown as CategoriesUpdateClient)
    .from('categories')
    .update(cleanUpdate)
    .eq('id', categoryId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath(`/admin/categories/${categoryId}/edit`)
  return { success: true }
}

