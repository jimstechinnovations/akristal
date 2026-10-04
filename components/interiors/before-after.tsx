'use client'

import { useId, useState } from 'react'
import Image from 'next/image'
import { ChevronsLeftRight } from 'lucide-react'

/** Drag (or use arrow keys on) the handle to compare a room before and after. */
export function BeforeAfter({ before, after, caption }: { before: string; after: string; caption?: string }) {
  const [pos, setPos] = useState(50)
  const id = useId()
  return (
    <figure>
      <div className="relative aspect-[4/3] select-none overflow-hidden rounded-md">
        <Image src={after} alt={caption ? `${caption}, after` : 'After'} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={before} alt={caption ? `${caption}, before` : 'Before'} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-pop" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#1f1b19] shadow-pop">
            <ChevronsLeftRight className="size-5" />
          </span>
        </div>
        <span className="absolute left-3 top-3 rounded-sm bg-black/60 px-2 py-1 text-xs text-white">Before</span>
        <span className="absolute right-3 top-3 rounded-sm bg-black/60 px-2 py-1 text-xs text-white">After</span>
        <label htmlFor={id} className="sr-only">
          Compare before and after
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>
      {caption && <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>}
    </figure>
  )
}
