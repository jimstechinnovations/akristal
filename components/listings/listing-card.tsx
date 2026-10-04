import Image from 'next/image'
import Link from 'next/link'
import { Bath, BedDouble, Home, Ruler, Video } from 'lucide-react'
import type { Listing } from '@/lib/data/listings'
import { formatArea, formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SaveButton } from './save-button'

export function ListingCard({
  listing,
  className,
  priority,
  sizes = '(min-width: 1280px) 400px, (min-width: 768px) 50vw, 85vw',
}: {
  listing: Listing
  className?: string
  priority?: boolean
  sizes?: string
}) {
  const place = [listing.area, listing.market?.name].filter((v, i, a) => v && a.indexOf(v) === i).join(', ')
  const facts = [
    listing.bedrooms != null && { icon: BedDouble, label: `${listing.bedrooms} bed` },
    listing.bathrooms != null && { icon: Bath, label: `${listing.bathrooms} bath` },
    listing.sizeSqm != null && { icon: Ruler, label: formatArea(listing.sizeSqm) },
  ].filter(Boolean) as { icon: typeof Bath; label: string }[]

  return (
    <article className={cn('group relative', className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-page-alt">
        {listing.images[0] ? (
          <Image
            src={listing.images[0]}
            alt=""
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <Home aria-hidden className="size-8" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-sm bg-white/95 px-2 py-1 text-xs font-medium text-[#1f1b19]">
            {listing.listingType === 'rent' ? 'For rent' : 'For sale'}
          </span>
          {listing.hasVideo && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-black/60 px-2 py-1 text-xs font-medium text-white">
              <Video aria-hidden className="size-3.5" /> Video
            </span>
          )}
        </div>
        <SaveButton id={listing.id} title={listing.title} className="absolute right-3 top-3 z-10" />
      </div>

      <div className="pt-4">
        <p className="tabular text-[1.1875rem] font-semibold tracking-tight text-ink">
          {formatMoney(listing.price, listing.currency)}
          {listing.listingType === 'rent' && <span className="text-sm font-normal text-muted"> / month</span>}
        </p>
        <h3 className="mt-1 line-clamp-1 text-[0.9375rem] text-ink">
          {/* Stretched link: the whole card is clickable, the save button stays separate. */}
          <Link
            href={`/properties/${listing.id}`}
            className="decoration-line-strong underline-offset-4 after:absolute after:inset-0 group-hover:underline"
          >
            {listing.title}
          </Link>
        </h3>
        {place && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{place}</p>}
        {facts.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-sm text-muted">
            {facts.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <Icon aria-hidden className="size-4" />
                {label}
              </li>
            ))}
            {listing.propertyType && <li className="ml-auto">{listing.propertyType}</li>}
          </ul>
        )}
      </div>
    </article>
  )
}
