'use client'

import { createContext, useActionState, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { submitLead } from '@/app/actions/leads'
import type { LeadContext, LeadState, LeadType } from '@/lib/leads'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { fieldClasses } from '@/components/ui/input'

const ErrorsContext = createContext<Record<string, string> | undefined>(undefined)

/** Wraps any set of <Field>s; handles submitting, errors and the success message. */
export function LeadForm({
  type,
  context = {},
  submitLabel,
  successTitle = 'Thank you, we have your request',
  successText = 'Someone from the Akristal team will contact you shortly.',
  className,
  children,
}: {
  type: LeadType
  context?: LeadContext
  submitLabel: string
  successTitle?: string
  successText?: string
  className?: string
  children: React.ReactNode
}) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead.bind(null, type, context), { status: 'idle' })
  // Recorded once on first render: lets the server spot instant bot submissions.
  const [startedAt] = useState(() => String(Date.now()))

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.status === 'success' ? (
        <motion.div
          key="done"
          role="status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('rounded-md border border-line bg-page-alt p-6', className)}
        >
          <CheckCircle2 aria-hidden className="size-6 text-success" />
          <p className="mt-3 font-semibold">{successTitle}</p>
          <p className="mt-1 text-sm text-muted">{successText}</p>
        </motion.div>
      ) : (
        <motion.form key="form" action={action} noValidate className={cn('grid gap-4', className)}>
          <ErrorsContext.Provider value={state.status === 'error' ? state.fieldErrors : undefined}>
            {children}
          </ErrorsContext.Provider>
          {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Leave this empty
              <input name="company_website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <input type="hidden" name="started_at" value={startedAt} />
          {state.status === 'error' && (
            <p role="alert" className="flex items-start gap-2 rounded-sm bg-error/10 px-3 py-2 text-sm text-error">
              <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
              {state.message}
            </p>
          )}
          <Button type="submit" loading={pending} className="w-full sm:w-auto sm:justify-self-start">
            {pending ? 'Sending…' : submitLabel}
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  )
}

type FieldProps = {
  name: string
  label: string
  hint?: string
  required?: boolean
  className?: string
} & (
  | ({ as?: 'input' } & React.InputHTMLAttributes<HTMLInputElement>)
  | ({ as: 'textarea' } & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
  | ({ as: 'select'; options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>)
)

export function Field(props: FieldProps) {
  const errors = useContext(ErrorsContext)
  const { name, label, hint, required, className } = props
  const error = errors?.[name]
  const id = `f-${name}`
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  const common = { id, name, required, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy }

  let control: React.ReactNode
  if (props.as === 'textarea') {
    const { as: _as, label: _l, hint: _h, className: _c, ...rest } = props
    control = <textarea {...rest} {...common} rows={rest.rows ?? 4} className={cn(fieldClasses, 'h-auto py-2.5')} />
  } else if (props.as === 'select') {
    const { as: _as, label: _l, hint: _h, className: _c, options, ...rest } = props
    control = (
      <select {...rest} {...common} className={fieldClasses}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  } else {
    const { as: _as, label: _l, hint: _h, className: _c, ...rest } = props
    control = <input {...rest} {...common} className={fieldClasses} />
  }

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-sm">
        {label}
        {!required && <span className="text-muted"> (optional)</span>}
      </label>
      {control}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
}

/** Name + phone + email, used by most forms. */
export function ContactFields({ compact }: { compact?: boolean }) {
  return (
    <>
      <Field name="name" label="Full name" required autoComplete="name" />
      <div className={cn('grid gap-4', !compact && 'sm:grid-cols-2')}>
        <Field name="phone" label="Phone or WhatsApp" type="tel" autoComplete="tel" placeholder="+250 788 000 000" hint="Phone or email: one is enough." required />
        <Field name="email" label="Email" type="email" autoComplete="email" />
      </div>
    </>
  )
}
