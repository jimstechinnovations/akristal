'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { InteriorProject } from '@/lib/data/interiors-shared'
import { cn } from '@/lib/utils'
import { Lightbox } from '@/components/media/lightbox'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'residential', label: 'Homes' },
  { value: 'hospitality', label: 'Short-let and hospitality' },
  { value: 'commercial', label: 'Offices and shops' },
] as const

export function Portfolio({ projects }: { projects: InteriorProject[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['value']>('all')
  const [open, setOpen] = useState<{ project: InteriorProject; index: number } | null>(null)
  const available = FILTERS.filter((f) => f.value === 'all' || projects.some((p) => p.spaceType === f.value))
  const shown = filter === 'all' ? projects : projects.filter((p) => p.spaceType === filter)

  return (
    <>
      {available.length > 2 && (
        <div role="radiogroup" aria-label="Filter projects" className="mb-8 flex flex-wrap gap-2">
          {available.map((f) => (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn('h-10 rounded-sm border px-4 text-sm transition-colors', filter === f.value ? 'border-primary bg-primary text-on-primary' : 'border-line-strong hover:border-ink')}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {shown.map((p, i) => (
            <motion.li key={p.slug} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn(i === 0 && filter === 'all' && 'sm:col-span-2 lg:row-span-2')}>
              <button type="button" onClick={() => setOpen({ project: p, index: 0 })} className="group relative block size-full min-h-[280px] overflow-hidden rounded-md text-left" aria-label={`Open ${p.title}`}>
                <Image src={p.cover.src} alt="" fill sizes={i === 0 ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, 50vw'} className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]" />
                <span className="absolute inset-0 bg-gradient-to-t from-[rgb(20_12_10/0.75)] via-transparent to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="block font-display text-2xl">{p.title}</span>
                  <span className="mt-1 block text-sm text-white/80">{[p.location, p.services.join(', ')].filter(Boolean).join(': ')}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      <Lightbox
        items={open ? open.project.gallery.map((g) => ({ type: 'image' as const, src: g.src })) : []}
        index={open ? open.index : null}
        onIndex={(i) => open && setOpen({ ...open, index: i })}
        onClose={() => setOpen(null)}
        title={open?.project.title ?? ''}
      />
    </>
  )
}
