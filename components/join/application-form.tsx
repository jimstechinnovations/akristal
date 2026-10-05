'use client'

import { useActionState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { submitApplication } from '@/app/actions/applications'
import type { LeadState } from '@/lib/leads'
import { site } from '@/config/site'
import { whatsappLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { fieldClasses } from '@/components/ui/input'

const SPECIALTIES = ['Sales', 'Rentals', 'Luxury homes', 'Off-plan', 'Commercial', 'Land']
const LANGUAGES = ['English', 'Kinyarwanda', 'French', 'Swahili', 'Yoruba', 'Igbo', 'Hausa', 'Arabic']

/** Agent application, or (kind="broker") registration of a broker company. Both land in Admin → Applications. */
export function ApplicationForm({ kind = 'agent' }: { kind?: 'agent' | 'broker' }) {
  const broker = kind === 'broker'
  const [state, action, pending] = useActionState<LeadState, FormData>(submitApplication, { status: 'idle' })
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}

  if (state.status === 'success') {
    return (
      <div role="status" className="rounded-md border border-line bg-page-alt p-8">
        <CheckCircle2 aria-hidden className="size-7 text-success" />
        <h3 className="mt-4 text-xl font-semibold">{broker ? 'Registration received' : 'Application received'}</h3>
        <p className="mt-2 max-w-md text-[0.9375rem] text-muted">
          Thank you. The Akristal team will review it and contact you about next steps. To speed things up, you can send a copy of{' '}
          {broker ? 'your company registration' : 'your ID or licence'} on WhatsApp now.
        </p>
        <a href={whatsappLink(broker ? 'Hello Akristal, I have just registered our broker company. Here are our documents.' : 'Hello Akristal, I have just applied to become an agent. Here is my ID.')} className="mt-6 inline-flex h-11 items-center rounded-sm bg-[#1f6f4a] px-5 text-sm font-medium text-white">
          {broker ? 'Send documents on WhatsApp' : 'Send my ID on WhatsApp'}
        </a>
      </div>
    )
  }

  const input = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> & { optional?: boolean } = {}) => {
    const { optional, ...rest } = props
    return (
      <div className="grid gap-1.5">
        <label htmlFor={`a-${name}`} className="text-sm">
          {label}
          {optional && <span className="text-muted"> (optional)</span>}
        </label>
        <input id={`a-${name}`} name={name} aria-invalid={errors[name] ? true : undefined} aria-describedby={errors[name] ? `a-${name}-e` : undefined} className={fieldClasses} {...rest} />
        {errors[name] && (
          <p id={`a-${name}-e`} className="text-xs text-error">
            {errors[name]}
          </p>
        )}
      </div>
    )
  }

  const chips = (name: string, legend: string, options: string[]) => (
    <fieldset className="grid gap-2">
      <legend className="text-sm">
        {legend} <span className="text-muted">(choose any)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="checkbox" name={name} value={o} className="peer sr-only" />
            <span className="inline-flex h-9 items-center rounded-sm border border-line-strong px-3 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 hover:border-ink">
              {o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )

  return (
    <form action={action} noValidate className="grid gap-5">
      <input type="hidden" name="applicant_type" value={kind} />
      {broker && input('company_name', 'Company name', { autoComplete: 'organization', required: true })}
      {input('full_name', broker ? 'Contact person' : 'Full name', { autoComplete: 'name', required: true })}
      <div className="grid gap-5 sm:grid-cols-2">
        {input('phone', 'Phone or WhatsApp', { type: 'tel', autoComplete: 'tel', placeholder: '+250 788 000 000', required: true })}
        {input('email', 'Email', { type: 'email', autoComplete: 'email', required: true })}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {input('city', broker ? 'City where the company is based' : 'City you work in', { placeholder: broker ? 'e.g. Abuja' : 'e.g. Kigali', required: true })}
        <div className="grid gap-1.5">
          <label htmlFor="a-years" className="text-sm">
            {broker ? 'Years in business' : 'Years selling property'}
          </label>
          <select id="a-years" name="years_experience" defaultValue="" aria-invalid={errors.years_experience ? true : undefined} className={fieldClasses}>
            <option value="" disabled>
              Choose one
            </option>
            <option value="0">New to real estate</option>
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3 to 5 years</option>
            <option value="6">6 to 10 years</option>
            <option value="11">More than 10 years</option>
          </select>
          {errors.years_experience && <p className="text-xs text-error">{errors.years_experience}</p>}
        </div>
      </div>
      {broker && (
        <div className="grid gap-5 sm:grid-cols-2">
          {input('team_size', 'Number of agents in the company', { optional: true, type: 'number', min: 0, inputMode: 'numeric' })}
          {input('website_url', 'Company website', { optional: true, type: 'url', placeholder: 'https://' })}
        </div>
      )}
      {input('areas', broker ? 'Areas the company covers' : 'Neighbourhoods you know best', {
        optional: true,
        placeholder: broker ? 'e.g. Maitama, Wuse 2, Lekki' : 'e.g. Kibagabaga, Kimihurura, Nyarutarama',
      })}
      {chips('specialties', broker ? 'What the company sells' : 'What you sell', SPECIALTIES)}
      {chips('languages', 'Languages you work in', LANGUAGES)}
      <div className="grid gap-5 sm:grid-cols-2">
        {broker
          ? input('registration_number', 'Company registration number', { optional: true })
          : input('licence_number', 'Licence or registration number', { optional: true })}
        {input('cv_url', broker ? 'Link to a company profile or LinkedIn' : 'Link to your CV or LinkedIn', { optional: true, type: 'url', placeholder: 'https://' })}
      </div>
      <div className="grid gap-1.5">
        <span className="text-sm">
          {broker ? 'Company documents' : 'ID or licence document'} <span className="text-muted">(after you apply)</span>
        </span>
        <p className="rounded-sm border border-dashed border-line-strong px-4 py-3 text-sm text-muted">
          For your security we don&apos;t collect documents through this form. After applying, send them on WhatsApp to {site.phone.label}, or bring
          them to your meeting with the Akristal team.
        </p>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="a-message" className="text-sm">
          Anything else we should know? <span className="text-muted">(optional)</span>
        </label>
        <textarea id="a-message" name="message" rows={4} className={cn(fieldClasses, 'h-auto py-2.5')} />
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" value="yes" aria-invalid={errors.consent ? true : undefined} className="mt-0.5 size-4 accent-[var(--c-primary)]" />
        <span>
          I agree that Akristal may store these details and contact me about my application.
          {errors.consent && <span className="mt-1 block text-xs text-error">{errors.consent}</span>}
        </span>
      </label>
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === 'error' && (
        <p role="alert" className="flex items-start gap-2 rounded-sm bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}
      <Button type="submit" size="lg" loading={pending} className="sm:justify-self-start">
        {pending ? 'Sending…' : broker ? 'Register the company' : 'Send my application'}
      </Button>
    </form>
  )
}
