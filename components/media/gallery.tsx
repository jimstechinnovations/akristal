'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Grid2x2, Home, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Lightbox, type MediaItem } from './lightbox'

/** Desktop: one large photo + four. Phones: a swipeable strip. Everything opens the lightbox. */
export function Gallery({ images, videos = [], title }: { images: string[]; videos?: string[]; title: string }) {
  const items: MediaItem[] = [...images.map((src) => ({ type: 'image' as const, src })), ...videos.map((src) => ({ type: 'video' as const, src }))]
  const [open, setOpen] = useState<number | null>(null)

  if (!images.length) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-md bg-page-alt text-muted">
        <Home aria-hidden className="size-10" />
        <span className="sr-only">No photos yet</span>
      </div>
    )
  }

  const thumbs = images.slice(1, 5)
  const firstVideo = images.length

  return (
    <>
      {/* Phones */}
      <div className="relative -mx-4 sm:mx-0 lg:hidden">
        <ul className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto sm:gap-2 sm:rounded-md">
          {images.map((src, i) => (
            <li key={src} className="relative aspect-[4/3] w-full shrink-0 snap-center sm:w-[85%]">
              <button type="button" onClick={() => setOpen(i)} className="absolute inset-0" aria-label={`Open photo ${i + 1} of ${images.length}`}>
                {/* Hidden on desktop: the tiny `sizes` there keeps desktops from downloading this full-size copy. */}
                <Image src={src} alt={i === 0 ? title : ''} fill priority={i === 0} sizes="(min-width: 1024px) 16px, 100vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
        {videos.length > 0 && (
          <button type="button" onClick={() => setOpen(firstVideo)} className="absolute bottom-3 left-3 inline-flex h-9 items-center gap-1.5 rounded-sm bg-white px-3 text-xs font-medium text-[#1f1b19]">
            <Play aria-hidden className="size-3.5" /> Watch video
          </button>
        )}
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-sm bg-black/60 px-2 py-1 text-xs text-white">
          {images.length} photos{videos.length ? `, ${videos.length} video${videos.length > 1 ? 's' : ''}` : ''}
        </span>
      </div>

      {/* Desktop */}
      <div className={cn('relative hidden gap-2 lg:grid', thumbs.length ? 'h-[min(62vh,600px)] grid-cols-4 grid-rows-2' : 'aspect-[21/9]')}>
        <button
          type="button"
          onClick={() => setOpen(0)}
          className={cn('group relative overflow-hidden rounded-l-md', thumbs.length ? 'col-span-2 row-span-2' : 'rounded-md')}
          aria-label="Open photo 1"
        >
          <Image src={images[0]} alt={title} fill priority sizes="(min-width: 1024px) 50vw, 16px" className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        </button>
        {thumbs.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpen(i + 1)}
            className={cn('group relative overflow-hidden', i === 1 && 'rounded-tr-md', i === 3 && 'rounded-br-md', thumbs.length < 4 && i === thumbs.length - 1 && 'rounded-r-md')}
            aria-label={`Open photo ${i + 2}`}
          >
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 25vw, 16px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          </button>
        ))}
        <div className="absolute bottom-4 right-4 flex gap-2">
          {videos.length > 0 && (
            <button type="button" onClick={() => setOpen(firstVideo)} className="inline-flex h-10 items-center gap-2 rounded-sm bg-white px-4 text-sm font-medium text-[#1f1b19] shadow-pop hover:bg-[#edefec]">
              <Play aria-hidden className="size-4" /> Watch video
            </button>
          )}
          <button type="button" onClick={() => setOpen(0)} className="inline-flex h-10 items-center gap-2 rounded-sm bg-white px-4 text-sm font-medium text-[#1f1b19] shadow-pop hover:bg-[#edefec]">
            <Grid2x2 aria-hidden className="size-4" /> Show all {images.length} photos
          </button>
        </div>
      </div>

      <Lightbox items={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} title={title} />
    </>
  )
}
