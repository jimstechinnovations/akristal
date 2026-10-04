'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, CheckCircle2, Star } from 'lucide-react'
import { submitReview } from '@/app/actions/reviews'
import type { LeadState } from '@/lib/leads'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { fieldClasses } from '@/components/ui/input'

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

export function ReviewForm({ agentId, agentName }: { agentId: string; agentName: string }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitReview.bind(null, agentId, agentName), { status: 'idle' })
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const errors = state.status === 'error' ? state.fieldErrors ?? {} : {}
  const shown = hover || rating

  if (state.status === 'success') {
    return (
      <div role="status" className="rounded-md border border-line bg-page-alt p-6">
        <CheckCircle2 aria-hidden className="size-6 text-success" />
        <p className="mt-3 font-semibold">Thank you. Your review is pending moderation.</p>
        <p className="mt-1 text-sm text-muted">We check every review before it appears on {agentName}&apos;s profile.</p>
      </div>
    )
  }

  const field = (name: string) => ({ id: `r-${name}`, name, 'aria-invalid': errors[name] ? true : undefined, 'aria-describedby': errors[name] ? `r-${name}-error` : undefined })
  const error = (name: string) => errors[name] && <p id={`r-${name}-error`} className="text-xs text-error">{errors[name]}</p>

  return (
    <form action={action} noValidate className="grid gap-4">
      <fieldset className="grid gap-1.5">
        <legend className="text-sm">Your rating</legend>
        <div className="flex items-center gap-3">
          <div role="radiogroup" aria-label="Rating" className="flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(n)}>
                <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" />
                <Star aria-hidden className={cn('size-7 transition-colors peer-focus-visible:outline-2', n <= shown ? 'fill-accent text-accent' : 'text-line-strong')} />
                <span className="sr-only">
                  {n} star{n > 1 ? 's' : ''}, {LABELS[n]}
                </span>
              </label>
            ))}
          </div>
          <span className="text-sm text-muted" aria-live="polite">
            {LABELS[shown]}
          </span>
        </div>
        {error('rating')}
      </fieldset>
      <div className="grid gap-1.5">
        <label htmlFor="r-body" className="text-sm">
          Your experience
        </label>
        <textarea {...field('body')} rows={4} className={cn(fieldClasses, 'h-auto py-2.5')} placeholder={`What was it like working with ${agentName}?`} />
        {error('body')}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="r-author_name" className="text-sm">
            Your name
          </label>
          <input {...field('author_name')} autoComplete="name" className={fieldClasses} />
          {error('author_name')}
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="r-context" className="text-sm">
            What did they help with? <span className="text-muted">(optional)</span>
          </label>
          <input {...field('context')} className={fieldClasses} placeholder="e.g. Bought in Kibagabaga, 2026" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="r-author_contact" className="text-sm">
          Phone or email <span className="text-muted">(optional, never shown)</span>
        </label>
        <input {...field('author_contact')} className={fieldClasses} />
      </div>
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <input name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === 'error' && (
        <p role="alert" className="flex items-start gap-2 rounded-sm bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          {pending ? 'Sending…' : 'Submit review'}
        </Button>
        <p className="text-xs text-muted">Reviews are checked before they are published.</p>
      </div>
    </form>
  )
}
