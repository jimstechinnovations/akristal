'use server'

import { z } from 'zod'
import { forms } from '@/config/site'
import { sendEmail } from '@/lib/email'
import type { LeadState } from '@/lib/leads'
import { createPublicClient } from '@/lib/supabase/public'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

const schema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name').max(120),
  email: z.string().trim().email('Enter a valid email address').max(200),
  phone: z.string().trim().regex(/^[+\d][\d\s()-]{6,}$/, 'Enter a phone number with country code').max(40),
  city: z.string().trim().min(2, 'Tell us where you are based').max(80),
  areas: z.string().trim().max(300).optional().default(''),
  years_experience: z.coerce.number({ message: 'Choose your experience' }).int().min(0).max(60),
  licence_number: z.string().trim().max(80).optional().default(''),
  cv_url: z.string().trim().url('Enter a full link, starting with https://').max(500).or(z.literal('')).optional().default(''),
  message: z.string().trim().max(3000).optional().default(''),
  consent: z.literal('yes', { message: 'Please agree so we can contact you about your application' }),
})

export async function submitApplication(_prev: LeadState, formData: FormData): Promise<LeadState> {
  if (formData.get('company_website')) return { status: 'success' }
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message
    return { status: 'error', message: 'Check the highlighted fields.', fieldErrors }
  }
  const d = parsed.data
  const specialties = formData.getAll('specialties').map(String).filter(Boolean).slice(0, 10)
  const languages = formData.getAll('languages').map(String).filter(Boolean).slice(0, 10)

  const { error } = await createPublicClient().from('agent_applications').insert({
    full_name: d.full_name,
    email: d.email,
    phone: d.phone,
    city: d.city,
    areas: d.areas || null,
    years_experience: d.years_experience,
    specialties,
    languages,
    licence_number: d.licence_number || null,
    cv_url: d.cv_url || null,
    message: d.message || null,
  })
  if (error) {
    console.error('Application insert failed', error)
    return { status: 'error', message: 'We could not send your application. Please try again or email us.' }
  }

  await sendEmail({
    to: forms.notifyEmail,
    subject: `Agent application: ${d.full_name.slice(0, 80)} (${d.city.slice(0, 40)})`,
    html: `<p><strong>${esc(d.full_name)}</strong>, ${esc(d.city)}, ${d.years_experience} years</p><p>${esc(d.phone)} · ${esc(d.email)}</p><p>Specialities: ${esc(specialties.join(', ') || '-')}</p><p>${esc(d.message)}</p>`,
  }).catch(() => undefined)

  return { status: 'success' }
}
