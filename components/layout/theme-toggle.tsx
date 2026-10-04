'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-sm px-2.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10',
        className
      )}
    >
      {/* Both icons render; CSS picks one so server and client markup match. */}
      <Sun aria-hidden className="hidden size-[18px] dark:block" />
      <Moon aria-hidden className="size-[18px] dark:hidden" />
      {/* Label chosen by CSS (like the icon) so server and client HTML always match. */}
      <span className={withLabel ? '' : 'sr-only'}>
        <span className="dark:hidden">{withLabel ? 'Dark theme' : 'Switch to dark theme'}</span>
        <span className="hidden dark:inline">{withLabel ? 'Light theme' : 'Switch to light theme'}</span>
      </span>
    </button>
  )
}
