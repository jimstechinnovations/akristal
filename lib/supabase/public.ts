import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Cookie-free anon client for public, cacheable reads (sitemap, listings, projects).
 * Row Level Security still applies: it only sees what an anonymous visitor may see.
 */
export function createPublicClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
