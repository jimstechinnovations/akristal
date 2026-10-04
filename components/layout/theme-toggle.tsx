'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-sm px-2.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/10',
        className
      )}
    >
      {/* Both icons render; CSS picks one so server and client markup match. */}
      <Sun aria-hidden className="hidden size-[18px] dark:block" />
      <Moon aria-hidden className="size-[18px] dark:hidden" />
      {withLabel && (
        <span>
          <span className="dark:hidden">Dark theme</span>
          <span className="hidden dark:inline">Light theme</span>
        </span>
      )}
    </button>
  )
}
