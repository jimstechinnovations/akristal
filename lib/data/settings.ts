import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import { defaultSettings, type SiteSettings } from '@/content/defaults'

/**
 * Website settings edited in Admin → Site settings. Each key falls back to the
 * built-in default, so a missing or half-filled row never breaks a page.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const { data } = await createPublicClient().from('site_settings').select('key, value')
  const byKey = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
  return {
    home: { ...defaultSettings.home, ...((byKey.home as object) ?? {}) },
    agent_programme: { ...defaultSettings.agent_programme, ...((byKey.agent_programme as object) ?? {}) },
  }
})
