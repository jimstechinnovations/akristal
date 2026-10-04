import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium',
          {
            'bg-brand text-on-brand':
              variant === 'default',
            'bg-page-alt text-ink':
              variant === 'secondary',
            'border border-line-strong bg-transparent text-ink':
              variant === 'outline',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }

