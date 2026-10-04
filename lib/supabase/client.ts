import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined

/**
 * One shared browser client. Creating several makes their auth helpers compete for the
 * same session lock, which can leave requests (e.g. storage uploads) waiting forever.
 */
export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  browserClient ??= createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  return browserClient
}
