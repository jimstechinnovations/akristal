'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import type { Listing } from '@/lib/data/listings'
import { useSavedHomes } from '@/lib/saved-homes'
import { buttonClasses } from '@/components/ui/button'
import { ListingCard } from './listing-card'

export function SavedHomes({ listings }: { listings: Listing[] }) {
  const { ids } = useSavedHomes()
  const saved = ids.map((id) => listings.find((l) => l.id === id)).filter((l): l is Listing => !!l)

  if (!saved.length) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <Heart aria-hidden className="mx-auto size-10 text-muted" />
        <h2 className="mt-4 text-lg font-semibold">No saved homes yet</h2>
        <p className="mt-2 text-[0.9375rem] text-muted">Tap the heart on any home to keep it here and compare later.</p>
        <Link href="/properties" className={buttonClasses({ className: 'mt-6' })}>
          Browse homes
        </Link>
      </div>
    )
  }

  return (
    <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {saved.map((l) => (
        <li key={l.id}>
          <ListingCard listing={l} />
          {l.status !== 'available' && <p className="mt-2 text-sm text-error">No longer available</p>}
        </li>
      ))}
    </ul>
  )
}
