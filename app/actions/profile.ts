'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Database, UserRole } from '@/types/database'

// Create admin client using service role key (bypasses RLS)
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set in environment variables. ' +
      'Please add it to your .env.local file. ' +
      'You can find it in Supabase Dashboard → Project Settings → API → service_role key (secret)'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function createProfile(
  userId: string,
  email: string,
  fullName: string | null,
  phone: string | null,
  role: Exclude<UserRole, 'admin'>
) {
  try {
    const adminClient = createAdminClient()

    const profileData = {
      id: userId,
      email: email.trim(),
      full_name: fullName?.trim() || null,
      phone: phone?.trim() || null,
      role,
    }

    const { data, error } = await adminClient
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Profile creation exception:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create profile'
    
    // Provide helpful message if service role key is missing
    if (errorMessage.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      return {
        error: 'Server configuration error: Service role key is missing. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file. You can find it in Supabase Dashboard → Project Settings → API → service_role key (secret)'
      }
    }
    
    return { error: errorMessage }
  }
}

export async function completeProfile(
  fullName: string,
  phone: string | null,
  role: Exclude<UserRole, 'admin'>
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (!user || userError) {
      return { error: 'Not authenticated' }
    }

    // Use authenticated client (RLS policy "Users can insert own profile" allows this)
    const profileData = {
      id: user.id,
      email: user.email || '',
      full_name: fullName.trim(),
      phone: phone?.trim() || null,
      role,
    }

    const { data, error } = await (supabase as any)
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Profile completion error:', error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Profile completion exception:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to complete profile',
    }
  }
}
