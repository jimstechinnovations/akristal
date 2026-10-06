'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { updateMyBroker } from '@/app/actions/broker'
import type { LeadState } from '@/lib/leads'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { fieldClasses } from '@/components/ui/input'

export type BrokerFormValues = {
  name: string
  about: string | null
  contact_name: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  website_url: string | null
  address: string | null
  city: string | null
  country: string | null
  registration_number: string | null
  areas: string[]
  logo_url: string | null
}

export function BrokerCompanyForm({ broker }: { broker: BrokerFormValues }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(updateMyBroker, { status: 'idle' })
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}

  const field = (name: keyof BrokerFormValues, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="grid gap-1.5">
      <label htmlFor={`b-${name}`} className="text-sm">
        {label}
      </label>
      <input
        id={`b-${name}`}
        name={name}
        defaultValue={Array.isArray(broker[name]) ? (broker[name] as string[]).join(', ') : ((broker[name] as string | null) ?? '')}
        aria-invalid={errors[name] ? true : undefined}
        className={fieldClasses}
        {...props}
      />
      {errors[name] && <p className="text-xs text-error">{errors[name]}</p>}
    </div>
  )

  return (
    <form action={action} className="grid gap-5">
      {field('name', 'Company name', { required: true, autoComplete: 'organization' })}
      <div className="grid gap-1.5">
        <label htmlFor="b-logo" className="text-sm">
          Logo <span className="text-muted">(PNG, JPG, WebP or SVG, up to 2 MB)</span>
        </label>
        <div className="flex items-center gap-4">
          {broker.logo_url && (
            <span className="relative size-16 shrink-0 overflow-hidden rounded-md border border-line bg-white">
              <Image src={broker.logo_url} alt="Current logo" fill sizes="64px" className="object-contain p-1.5" />
            </span>
          )}
          <input id="b-logo" name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="text-sm" />
        </div>
        {errors.logo && <p className="text-xs text-error">{errors.logo}</p>}
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="b-about" className="text-sm">
          About the company
        </label>
        <textarea id="b-about" name="about" rows={5} defaultValue={broker.about ?? ''} className={cn(fieldClasses, 'h-auto py-2.5')} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field('contact_name', 'Contact person', { autoComplete: 'name' })}
        {field('registration_number', 'Registration number')}
        {field('phone', 'Phone', { type: 'tel', placeholder: '+234 800 000 0000' })}
        {field('whatsapp', 'WhatsApp number', { type: 'tel', placeholder: '2348000000000' })}
        {field('email', 'Email', { type: 'email' })}
        {field('website_url', 'Website', { type: 'url', placeholder: 'https://' })}
      </div>
      {field('address', 'Office address', { autoComplete: 'street-address' })}
      <div className="grid gap-5 sm:grid-cols-2">
        {field('city', 'City')}
        {field('country', 'Country')}
      </div>
      {field('areas', 'Areas you cover, separated by commas', { placeholder: 'e.g. Maitama, Wuse 2, Lekki' })}

      {state.status === 'error' && (
        <p role="alert" className="flex items-start gap-2 rounded-sm bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}
      {state.status === 'success' && (
        <p role="status" className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 aria-hidden className="size-4" /> Saved
        </p>
      )}
      <Button type="submit" loading={pending} className="sm:justify-self-start">
        {pending ? 'Saving…' : 'Save company page'}
      </Button>
    </form>
  )
}
