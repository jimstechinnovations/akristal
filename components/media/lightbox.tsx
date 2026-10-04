'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useFocusTrap } from '@/lib/use-focus-trap'

export type MediaItem = { type: 'image' | 'video'; src: string }

export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
  title,
}: {
  items: MediaItem[]
  index: number | null
  onIndex: (i: number) => void
  onClose: () => void
  title: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const open = index !== null
  useFocusTrap(ref, open, onClose)

  const step = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return
      onIndex((index + dir + items.length) % items.length)
    },
    [index, items.length, onIndex]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, step])

  const item = index !== null ? items[index] : null

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={`${title}: photo ${index! + 1} of ${items.length}`}
          className="fixed inset-0 z-[80] flex flex-col bg-[#120d0b] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex h-14 shrink-0 items-center justify-between px-4">
            <p className="tabular text-sm text-white/75">
              {index! + 1} / {items.length}
            </p>
            <button type="button" onClick={onClose} className="inline-flex h-10 items-center gap-2 rounded-sm px-3 text-sm hover:bg-white/10">
              Close <X aria-hidden className="size-5" />
            </button>
          </div>

          <div className="relative flex-1">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={item.src}
                className="absolute inset-0 flex items-center justify-center px-2 sm:px-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                drag={items.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) step(1)
                  else if (info.offset.x > 60) step(-1)
                }}
              >
                {item.type === 'video' ? (
                  <video src={item.src} controls playsInline className="max-h-full max-w-full" />
                ) : (
                  <div className="relative size-full">
                    <Image src={item.src} alt={`${title}, photo ${index! + 1}`} fill sizes="100vw" quality={85} className="select-none object-contain" draggable={false} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:inline-flex"
                >
                  <ChevronLeft aria-hidden className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:inline-flex"
                >
                  <ChevronRight aria-hidden className="size-6" />
                </button>
              </>
            )}
          </div>

          {items.length > 1 && (
            <ul className="scrollbar-hide flex shrink-0 gap-2 overflow-x-auto px-4 py-3">
              {items.map((m, i) => (
                <li key={m.src} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onIndex(i)}
                    aria-label={`Show ${m.type} ${i + 1}`}
                    aria-current={i === index ? 'true' : undefined}
                    className="relative block h-14 w-20 overflow-hidden rounded-sm opacity-50 transition-opacity aria-[current=true]:opacity-100 aria-[current=true]:ring-2 aria-[current=true]:ring-accent hover:opacity-90"
                  >
                    {m.type === 'video' ? (
                      <span className="flex size-full items-center justify-center bg-white/10 text-xs">Video</span>
                    ) : (
                      <Image src={m.src} alt="" fill sizes="80px" className="object-cover" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
