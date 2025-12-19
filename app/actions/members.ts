'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getErrorMessage } from '@/lib/utils'

type MemberInsert = {
  name: string
  role: string
  image_url?: string | null
  details: string
  display_order?: number
  is_active?: boolean
  created_by: string
}

type MemberUpdate = {
  name?: string
  role?: string
  image_url?: string | null
  details?: string
  display_order?: number
  is_active?: boolean
}

export async function createMember(formData: FormData) {
  try {
    const user = await requireAdmin()
    const supabase = await createClient()

    const memberData: MemberInsert = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      image_url: formData.get('image_url') ? (formData.get('image_url') as string) : null,
      details: formData.get('details') as string,
      display_order: formData.get('display_order') ? parseInt(formData.get('display_order') as string) : 0,
      is_active: formData.get('is_active') === 'true',
      created_by: user.id,
    }

    type MembersInsertClient = {
      from: (table: 'members') => {
        insert: (values: MemberInsert) => Promise<{ error: { message: string } | null }>
      }
    }

    const { error } = await (supabase as unknown as MembersInsertClient)
      .from('members')
      .insert(memberData)

    if (error) throw error

    revalidatePath('/admin/members')
    revalidatePath('/members')

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateMember(id: string, formData: FormData) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const updateData: MemberUpdate = {}
    const name = formData.get('name')
    if (name) updateData.name = name as string
    const role = formData.get('role')
    if (role) updateData.role = role as string
    const imageUrl = formData.get('image_url')
    if (imageUrl !== null) updateData.image_url = imageUrl ? (imageUrl as string) : null
    const details = formData.get('details')
    if (details) updateData.details = details as string
    const displayOrder = formData.get('display_order')
    if (displayOrder) updateData.display_order = parseInt(displayOrder as string)
    const isActive = formData.get('is_active')
    if (isActive !== null) updateData.is_active = isActive === 'true'

    type MembersUpdateClient = {
      from: (table: 'members') => {
        update: (values: MemberUpdate) => {
          eq: (column: 'id', value: string) => Promise<{ error: { message: string } | null }>
        }
      }
    }

    const { error } = await (supabase as unknown as MembersUpdateClient)
      .from('members')
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/members')
    revalidatePath(`/admin/members/${id}/edit`)
    revalidatePath('/members')

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteMember(id: string) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    type MembersDeleteClient = {
      from: (table: 'members') => {
        delete: () => {
          eq: (column: 'id', value: string) => Promise<{ error: { message: string } | null }>
        }
      }
    }

    const { error } = await (supabase as unknown as MembersDeleteClient)
      .from('members')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/members')
    revalidatePath('/members')

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}
