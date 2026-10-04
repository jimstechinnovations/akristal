'use client'

import dynamic from 'next/dynamic'
import type { MapListing } from './leaflet-map'

// Leaflet touches `window`, so it loads only in the browser, and only when the map view is open.
const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-page-alt" aria-label="Loading map" />,
})

export function MapView({ listings }: { listings: MapListing[] }) {
  const approximate = listings.filter((l) => l.approximate).length
  return (
    <div className="relative size-full">
      <LeafletMap listings={listings} />
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex flex-wrap gap-2 text-xs">
        <span className="rounded-sm bg-surface/95 px-2 py-1 text-ink shadow-pop">
          <span className="mr-1.5 inline-block size-2.5 rounded-full bg-primary align-middle" />
          Exact location
        </span>
        {approximate > 0 && (
          <span className="rounded-sm bg-surface/95 px-2 py-1 text-ink shadow-pop">
            <span className="mr-1.5 inline-block size-2.5 rounded-full border border-dashed border-primary align-middle" />
            Approximate area ({approximate})
          </span>
        )}
      </div>
    </div>
  )
}
