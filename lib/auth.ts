import { createClient } from '@/lib/supabase/server'
import type { Database, UserRole } from '@/types/database'
import { redirect } from 'next/navigation'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export interface CurrentUser {
  id: string
  email?: string
  profile: ProfileRow
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist, return null (caller should redirect to complete-profile)
  if (!profile) {
    // Check if it's a "not found" error
    const isNotFound = profileError?.code === 'PGRST116' || 
                       (profileError?.message && (
                         profileError.message.includes('No rows') ||
                         profileError.message.includes('not found') ||
                         profileError.message.includes('0 rows')
                       )) ||
                       (!profileError && !profile)
    
    if (isNotFound) {
      // Profile doesn't exist - return null so caller can redirect to complete-profile
      return null
    } else {
      // Actual error (not just "not found") - log full details
      console.error('Profile fetch error:', {
        code: profileError?.code,
        message: profileError?.message,
        details: profileError?.details,
        hint: profileError?.hint,
        fullError: profileError,
      })
      return null
    }
  }

  return {
    id: user.id,
    email: user.email ?? undefined,
    profile,
  }
}

export async function requireAuth(): Promise<CurrentUser> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()
  if (!currentUser) {
    // User is authenticated but profile is missing - redirect to complete profile
    redirect('/complete-profile')
  }
  return currentUser
}

export async function requireRole(allowedRoles: UserRole[]): Promise<CurrentUser> {
  const user = await requireAuth()
  if (!user.profile || !allowedRoles.includes(user.profile.role)) {
    redirect('/unauthorized')
  }
  return user
}

export async function requireAdmin() {
  return requireRole(['admin'])
}


