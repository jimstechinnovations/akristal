import { z } from 'zod'

export const LEAD_TYPES = [
  'viewing',
  'property_enquiry',
  'valuation',
  'prequalification',
  'pay_small_small',
  'consultation',
  'furniture',
  'project_enquiry',
  'agent_contact',
  'contact',
] as const
export type LeadType = (typeof LEAD_TYPES)[number]

export const LEAD_LABELS: Record<LeadType, string> = {
  viewing: 'Viewing request',
  property_enquiry: 'Property enquiry',
  valuation: 'Valuation request',
  prequalification: 'Mortgage pre-qualification',
  pay_small_small: 'Pay Small Small application',
  consultation: 'Interior design consultation',
  furniture: 'Furniture enquiry',
  project_enquiry: 'Development enquiry',
  agent_contact: 'Message to an agent',
  contact: 'General enquiry',
}

const phone = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === '' || /^[+\d][\d\s()-]{6,}$/.test(v), 'Enter a phone number with country code, e.g. +250 788 000 000')

export const leadSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your name').max(120),
    email: z.string().trim().max(200).email('Enter a valid email address').or(z.literal('')),
    phone,
    message: z.string().trim().max(5000).optional().default(''),
  })
  .refine((v) => v.email || v.phone, { message: 'Add a phone number or an email so we can reply', path: ['phone'] })

export type LeadContext = { propertyId?: string; projectId?: string; agentId?: string; sourcePath?: string }

export type LeadState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> }

/** Field names reserved for the contact block; everything else goes into `payload`. */
export const CORE_FIELDS = new Set(['name', 'email', 'phone', 'message', 'company_website', 'started_at'])
