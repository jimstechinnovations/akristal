'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export type AuthUser = {
  id: string
  email?: string
  profile: Pick<Profile, 'full_name' | 'role' | 'avatar_url'> | null
}

/** Supabase keeps the session in a readable `sb-<project>-auth-token` cookie (split into .0, .1 when large). */
function hasSessionCookie() {
  return document.cookie.split(';').some((c) => /^\s*sb-[^=]+-auth-token(\.\d+)?=/.test(c))
}

// The Supabase client is large, and most visitors are not signed in. It is only downloaded
// when a session cookie exists, so public pages stay light.
const loadClient = () => import('@/lib/supabase/client').then((m) => m.createClient())

/** Signed-in user + profile, kept in sync with Supabase auth events. `undefined` = still loading. */
export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined)
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const pathname = usePathname()

  // Signing in moves to another page without remounting the header, so look again on each navigation.
  useEffect(() => {
    const id = setTimeout(() => setHasSession(hasSessionCookie()), 0)
    return () => clearTimeout(id)
  }, [pathname])

  useEffect(() => {
    if (hasSession === null) return
    if (!hasSession) {
      const id = setTimeout(() => setUser(null), 0)
      return () => clearTimeout(id)
    }

    let active = true
    let unsubscribe: (() => void) | undefined
    loadClient().then((supabase) => {
      if (!active) return
      async function load() {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        if (!active) return
        if (!authUser) return setUser(null)
        const { data: profile } = await supabase.from('profiles').select('full_name, role, avatar_url').eq('id', authUser.id).single()
        if (active) setUser({ id: authUser.id, email: authUser.email ?? undefined, profile: profile ?? null })
      }
      load()
      // Never await Supabase calls inside this callback: it runs while the auth lock is held, and a nested
      // call deadlocks every later request in the tab (uploads included). Defer to the next tick instead.
      const { data } = supabase.auth.onAuthStateChange(() => {
        setTimeout(load, 0)
      })
      unsubscribe = () => data.subscription.unsubscribe()
    })
    return () => {
      active = false
      unsubscribe?.()
    }
  }, [hasSession])

  async function signOut() {
    await (await loadClient()).auth.signOut()
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
