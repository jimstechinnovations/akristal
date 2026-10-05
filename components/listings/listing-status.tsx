import type { Listing } from '@/lib/data/listings'
import { cn } from '@/lib/utils'

const BUILD = { off_plan: 'Off-plan', under_construction: 'Under construction', completed: 'Completed' } as const

/** Sales status for a home, from its availability: selling, under offer, sold out, or let. */
export function salesLabel(listing: Pick<Listing, 'status' | 'listingType'>) {
  if (listing.status === 'sold') return { label: 'Sold out', live: false }
  if (listing.status === 'rented') return { label: 'Let', live: false }
  if (listing.status === 'pending') return { label: 'Under offer', live: true }
  return { label: listing.listingType === 'rent' ? 'Available' : 'Selling', live: true }
}

/** Build stage (when the admin has set one) and sales status, as two small labels. */
export function ListingStatus({ listing, className }: { listing: Pick<Listing, 'status' | 'listingType' | 'buildStage'>; className?: string }) {
  const sales = salesLabel(listing)
  return (
    <ul aria-label="Status" className={cn('flex flex-wrap gap-1.5 text-xs', className)}>
      {listing.buildStage && <li className="rounded-sm border border-line-strong px-2 py-0.5 text-ink">{BUILD[listing.buildStage]}</li>}
      <li
        className={cn(
          'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5',
          sales.live ? 'bg-success/12 text-success' : 'bg-ink/8 text-muted'
        )}
      >
        <span aria-hidden className={cn('size-1.5 rounded-full', sales.live ? 'bg-success' : 'bg-muted')} />
        {sales.label}
      </li>
    </ul>
  )
}
