'use server'

import { headers } from 'next/headers'
import { forms } from '@/config/site'
import { sendEmail } from '@/lib/email'
import { CORE_FIELDS, LEAD_LABELS, LEAD_TYPES, leadSchema, type LeadContext, type LeadState, type LeadType } from '@/lib/leads'
import { createPublicClient } from '@/lib/supabase/public'

// Humans can't complete a form this fast; bots usually do. Checked after validation so people always get feedback.
const MIN_FILL_MS = 1500
const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

/**
 * Saves a lead from any public form. Bound per form: submitLead.bind(null, type, context).
 * Stores the row first (source of truth), then notifies by email and optional webhook.
 */
export async function submitLead(type: LeadType, context: LeadContext, _prev: LeadState, formData: FormData): Promise<LeadState> {
  if (!LEAD_TYPES.includes(type)) return { status: 'error', message: 'This form is not set up correctly.' }

  // Hidden honeypot field: only bots fill it. Pretend success so they don't retry.
  if (formData.get('company_website')) return { status: 'success' }

  const parsed = leadSchema.safeParse({
    name: formData.get('name') ?? '',
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    message: formData.get('message') ?? '',
  })
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message
    return { status: 'error', message: 'Check the highlighted fields.', fieldErrors }
  }

  const startedAt = Number(formData.get('started_at'))
  if (startedAt && Date.now() - startedAt < MIN_FILL_MS) return { status: 'success' }

  const payload: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (CORE_FIELDS.has(key) || key.startsWith('$ACTION') || typeof value !== 'string' || !value.trim()) continue
    payload[key] = value.trim().slice(0, 1000)
  }

  const referer = (await headers()).get('referer')
  const sourcePath = context.sourcePath ?? (referer ? new URL(referer).pathname : null)

  const supabase = createPublicClient()
  const { error } = await supabase.from('leads').insert({
    type,
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    message: parsed.data.message || null,
    property_id: context.propertyId ?? null,
    project_id: context.projectId ?? null,
    agent_id: context.agentId ?? null,
    payload,
    source_path: sourcePath,
  })
  if (error) {
    console.error('Lead insert failed', error)
    return { status: 'error', message: 'We could not send your request. Please try again, or message us on WhatsApp.' }
  }

  // Notifications are best-effort: the lead is already saved.
  const label = LEAD_LABELS[type]
  const rows = [
    ['Name', parsed.data.name],
    ['Phone', parsed.data.phone],
    ['Email', parsed.data.email],
    ['Message', parsed.data.message],
    ...Object.entries(payload),
    ['Page', sourcePath ?? ''],
  ].filter(([, v]) => v)
  await Promise.allSettled([
    sendEmail({
      to: forms.notifyEmail,
      subject: `${label}: ${parsed.data.name}`,
      html: `<h2>${escape(label)}</h2><table>${rows
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${escape(k)}</td><td>${escape(v)}</td></tr>`)
        .join('')}</table>`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    }),
    forms.webhookUrl
      ? fetch(forms.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, ...parsed.data, ...context, payload, sourcePath }),
        })
      : Promise.resolve(),
  ])

  return { status: 'success' }
}
