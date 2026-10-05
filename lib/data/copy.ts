import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import { copyPage, fill } from '@/content/copy'

type Vars = Record<string, string | number>
export type Copy = {
  /** One piece of text, with {placeholders} filled from vars */
  t: (name: string, vars?: Vars) => string
  /** A list (steps, questions, points), each text filled from vars */
  list: (name: string, vars?: Vars) => Record<string, string>[]
}

/**
 * Website text for one page (Admin → Website text). A saved, non-empty value wins;
 * otherwise the default from content/copy.ts, so pages never show a blank.
 */
export const getCopy = cache(async (pageKey: string): Promise<Copy> => {
  const page = copyPage(pageKey)
  if (!page) throw new Error(`Unknown copy page "${pageKey}"`)
  const { data } = await createPublicClient().from('site_settings').select('value').eq('key', `copy_${pageKey}`).maybeSingle()
  const saved = ((data?.value as Record<string, unknown> | null) ?? {}) as Record<string, unknown>

  const value = (name: string): unknown => {
    const v = saved[name]
    if (typeof v === 'string' && v.trim()) return v
    if (Array.isArray(v) && v.length) return v
    const field = page.fields.find((f) => f.name === name)
    if (!field) throw new Error(`Unknown text "${pageKey}.${name}"`)
    return field.default
  }

  return {
    t: (name, vars) => fill(String(value(name) ?? ''), vars),
    list: (name, vars) =>
      ((value(name) as Record<string, unknown>[]) ?? []).map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, fill(String(v ?? ''), vars)]))),
  }
})
