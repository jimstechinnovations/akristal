import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database'

type CookieOptions = {
  name: string
  value: string
  options?: {
    domain?: string
    expires?: Date
    httpOnly?: boolean
    maxAge?: number
    path?: string
    sameSite?: 'strict' | 'lax' | 'none'
    secure?: boolean
  }
}

/**
 * Minimal middleware - only refreshes session cookies
 * All redirect logic is handled in page components to avoid loops
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieOptions[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Only refresh the session here
  // Do NOT add redirect logic - let pages handle their own redirects
  // This prevents redirect loops
  await supabase.auth.getUser()

  return supabaseResponse
}


