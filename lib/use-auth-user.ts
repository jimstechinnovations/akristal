'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export type AuthUser = {
  id: string
  email?: string
  profile: Pick<Profile, 'full_name' | 'role' | 'avatar_url'> | null
}

/** Signed-in user + profile, kept in sync with Supabase auth events. `undefined` = still loading. */
export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function load() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!active) return
      if (!authUser) return setUser(null)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .eq('id', authUser.id)
        .single()
      if (active) setUser({ id: authUser.id, email: authUser.email ?? undefined, profile: profile ?? null })
    }

    load()
    const { data } = supabase.auth.onAuthStateChange(() => load())
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    await createClient().auth.signOut()
    // Full reload on purpose: clears every client cache tied to the old session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/'
  }

  return { user, signOut }
}

export function initials(user: AuthUser) {
  const name = user.profile?.full_name?.trim()
  if (name) {
    const parts = name.split(/\s+/)
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
  }
  return (user.email?.[0] ?? 'A').toUpperCase()
}
