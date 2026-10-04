'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useSavedHomes } from '@/lib/saved-homes'
import { cn } from '@/lib/utils'

export function SaveButton({ id, title, className }: { id: string; title: string; className?: string }) {
  const { isSaved, toggle } = useSavedHomes()
  const saved = isSaved(id)
  return (
    <button
      type="button"
      onClick={(e) => {
        // Cards are links; saving must not navigate.
        e.preventDefault()
        e.stopPropagation()
        toggle(id)
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved homes` : `Save ${title}`}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-[#1f1b19] backdrop-blur-sm transition-colors hover:bg-white',
        className
      )}
    >
      <motion.span key={String(saved)} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
        <Heart aria-hidden className={cn('size-[18px]', saved && 'fill-[#9b2c20] text-[#9b2c20]')} />
      </motion.span>
    </button>
  )
}
