'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import type { LeadState } from '@/lib/leads'

// Service client: brokers may change only the fields below, and only on their own company,
// so the update runs on the server after those checks rather than through a broad RLS policy.
function service() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } }) as unknown as {
    from: (t: string) => any // eslint-disable-line @typescript-eslint/no-explicit-any
    storage: { from: (b: string) => { upload: (p: string, f: File, o: object) => Promise<{ error: { message: string } | null }>; getPublicUrl: (p: string) => { data: { publicUrl: string } } } }
  }
}

const optional = (max: number) => z.string().trim().max(max).optional().default('')
const schema = z.object({
  name: z.string().trim().min(2, 'Enter the company name').max(160),
  about: optional(3000),
  contact_name: optional(120),
  phone: z.string().trim().max(40).refine((v) => v === '' || /^[+\d][\d\s()-]{6,}$/.test(v), 'Enter a phone number with country code').optional().default(''),
  whatsapp: optional(40),
  email: z.string().trim().max(200).refine((v) => v === '' || /^\S+@\S+\.\S+$/.test(v), 'Enter a valid email').optional().default(''),
  website_url: z.string().trim().max(500).refine((v) => v === '' || /^https?:\/\//.test(v), 'Start the link with https://').optional().default(''),
  address: optional(200),
  city: optional(80),
  country: optional(80),
  registration_number: optional(80),
  areas: optional(500),
})

/** A broker updates their own company page. Publishing and "Verified" stay with Akristal admins. */
export async function updateMyBroker(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const user = await requireRole(['broker'])
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message
    return { status: 'error', message: 'Check the highlighted fields.', fieldErrors }
  }
  const db = service()
  const { data: broker } = await db.from('brokers').select('id, slug').eq('owner_id', user.id).maybeSingle()
  if (!broker) return { status: 'error', message: 'No company is linked to this account. Contact Akristal.' }

  const d = parsed.data
  const update: Record<string, unknown> = {
    name: d.name,
    about: d.about || null,
    contact_name: d.contact_name || null,
    phone: d.phone || null,
    whatsapp: d.whatsapp.replace(/\D/g, '') || null,
    email: d.email || null,
    website_url: d.website_url || null,
    address: d.address || null,
    city: d.city || null,
    country: d.country || null,
    registration_number: d.registration_number || null,
    areas: d.areas.split(',').map((a) => a.trim()).filter(Boolean).slice(0, 30),
    updated_at: new Date().toISOString(),
  }

  const logo = formData.get('logo')
  if (logo instanceof File && logo.size > 0) {
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(logo.type)) return { status: 'error', message: 'The logo must be a PNG, JPG, WebP or SVG image.', fieldErrors: { logo: 'Use a PNG, JPG, WebP or SVG image' } }
    if (logo.size > 2 * 1024 * 1024) return { status: 'error', message: 'The logo must be 2 MB or smaller.', fieldErrors: { logo: 'Choose an image of 2 MB or less' } }
    const ext = logo.type === 'image/svg+xml' ? 'svg' : logo.type.split('/')[1].replace('jpeg', 'jpg')
    const path = `brokers/${broker.id}/logo-${Date.now()}.${ext}`
    const { error } = await db.storage.from('site-media').upload(path, logo, { contentType: logo.type, upsert: false })
    if (error) return { status: 'error', message: 'The logo could not be uploaded. Please try again.' }
    update.logo_url = db.storage.from('site-media').getPublicUrl(path).data.publicUrl
  }

  const { error } = await db.from('brokers').update(update).eq('id', broker.id)
  if (error) {
    console.error('Broker update failed', error)
    return { status: 'error', message: 'Your changes could not be saved. Please try again.' }
  }
  revalidatePath('/brokers')
  revalidatePath(`/brokers/${broker.slug ?? broker.id}`)
  revalidatePath('/')
  return { status: 'success' }
}
