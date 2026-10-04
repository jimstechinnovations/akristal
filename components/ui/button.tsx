import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'outline' | 'ghost' | 'destructive' | 'inverse' | 'link'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Shows a spinner, sets aria-busy and blocks clicks. */
  loading?: boolean
}

/** Shared classes so links (<Link className={buttonClasses()}>) match buttons exactly. */
export function buttonClasses({
  variant = 'default',
  size = 'md',
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    {
      'bg-primary text-on-primary hover:bg-primary-hover': variant === 'default',
      'border border-line-strong bg-transparent text-ink hover:border-ink hover:bg-page-alt': variant === 'outline',
      'text-ink hover:bg-page-alt': variant === 'ghost',
      'bg-error text-white hover:opacity-90 dark:text-[#1f1b19]': variant === 'destructive',
      // For use on photography and the Oxblood band.
      'border border-white/70 bg-transparent text-white hover:border-white hover:bg-white hover:text-[#1f1b19]':
        variant === 'inverse',
      'h-auto px-0 text-ink underline decoration-line-strong underline-offset-4 hover:decoration-current':
        variant === 'link',
    },
    variant !== 'link' && {
      'h-9 px-3.5 text-sm': size === 'sm',
      'h-11 px-5 text-[0.9375rem]': size === 'md',
      'h-13 px-7 text-base': size === 'lg',
    },
    className
  )
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading = false, disabled, children, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export { Button }
