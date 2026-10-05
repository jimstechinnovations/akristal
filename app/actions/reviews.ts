'use server'

import { z } from 'zod'
import { forms } from '@/config/site'
import { sendEmail } from '@/lib/email'
import type { LeadState } from '@/lib/leads'
import { createPublicClient } from '@/lib/supabase/public'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

const reviewSchema = z.object({
  author_name: z.string().trim().min(2, 'Enter your name').max(80),
  author_contact: z.string().trim().max(120).optional().default(''),
  rating: z.coerce.number().int().min(1, 'Choose a star rating').max(5),
  body: z.string().trim().min(10, 'Write at least a sentence about your experience').max(2000),
  context: z.string().trim().max(120).optional().default(''),
})

/** Saves a review as `pending`; it appears on the profile only after an admin approves it. */
export async function submitReview(agentId: string, agentName: string, _prev: LeadState, formData: FormData): Promise<LeadState> {
  if (formData.get('company_website')) return { status: 'success' }

  const parsed = reviewSchema.safeParse({
    author_name: formData.get('author_name') ?? '',
    author_contact: formData.get('author_contact') ?? '',
    rating: formData.get('rating') ?? 0,
    body: formData.get('body') ?? '',
    context: formData.get('context') ?? '',
  })
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message
    return { status: 'error', message: 'Check the highlighted fields.', fieldErrors }
  }

  const supabase = createPublicClient()
  const { error } = await supabase.from('agent_reviews').insert({
    agent_id: agentId,
    author_name: parsed.data.author_name,
    author_contact: parsed.data.author_contact || null,
    rating: parsed.data.rating,
    body: parsed.data.body,
    context: parsed.data.context || null,
  })
  if (error) {
    console.error('Review insert failed', error)
    return { status: 'error', message: 'We could not save your review. Please try again.' }
  }

  await sendEmail({
    to: forms.notifyEmail,
    subject: `New review for ${agentName.slice(0, 80)} (${parsed.data.rating}/5) waiting for approval`,
    html: `<p><strong>${parsed.data.rating}/5</strong> from ${esc(parsed.data.author_name)}</p><p>${esc(parsed.data.body)}</p><p>Approve or reject it in Admin → Reviews.</p>`,
  }).catch(() => undefined)

  return { status: 'success' }
}

/** A review of Akristal itself, saved unpublished as a testimonial; an admin publishes it. */
export async function submitCompanyReview(_prev: LeadState, formData: FormData): Promise<LeadState> {
  if (formData.get('company_website')) return { status: 'success' }

  const parsed = reviewSchema.safeParse({
    author_name: formData.get('author_name') ?? '',
    author_contact: formData.get('author_contact') ?? '',
    rating: formData.get('rating') ?? 0,
    body: formData.get('body') ?? '',
    context: formData.get('context') ?? '',
  })
  const fieldErrors: Record<string, string> = {}
  if (!parsed.success) for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message
  if (formData.get('consent') !== 'yes') fieldErrors.consent = 'Tick the box so we can publish your review'
  if (!parsed.success || fieldErrors.consent) return { status: 'error', message: 'Check the highlighted fields.', fieldErrors }

  const { error } = await createPublicClient().from('testimonials').insert({
    name: parsed.data.author_name,
    context: parsed.data.context || null,
    quote: parsed.data.body.slice(0, 600),
    rating: parsed.data.rating,
    source: 'site',
    consent_given: true,
    is_published: false,
  })
  if (error) {
    console.error('Testimonial insert failed', error)
    return { status: 'error', message: 'We could not save your review. Please try again.' }
  }

  await sendEmail({
    to: forms.notifyEmail,
    subject: `New client review (${parsed.data.rating}/5) waiting to be published`,
    html: `<p><strong>${parsed.data.rating}/5</strong> from ${esc(parsed.data.author_name)}${parsed.data.author_contact ? ` (${esc(parsed.data.author_contact)})` : ''}</p><p>${esc(parsed.data.body)}</p><p>Publish it in Admin → Testimonials.</p>`,
  }).catch(() => undefined)

  return { status: 'success' }
}
