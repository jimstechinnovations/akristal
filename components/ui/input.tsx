import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const fieldClasses =
  'flex h-11 w-full rounded-sm border border-line-strong bg-surface px-3.5 text-[0.9375rem] text-ink transition-colors placeholder:text-muted hover:border-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-error file:border-0 file:bg-transparent file:text-sm file:font-medium'

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input type={type} className={cn(fieldClasses, className)} ref={ref} {...props} />
))
Input.displayName = 'Input'

export { Input }
