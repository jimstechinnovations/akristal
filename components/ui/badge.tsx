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
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
          {
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200':
              variant === 'default',
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200':
              variant === 'secondary',
            'border border-gray-300 bg-transparent text-gray-800 dark:border-gray-600 dark:text-gray-200':
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

