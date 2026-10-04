import type { Listing } from '@/lib/data/listings'
import { SectionHeading } from '@/components/ui/section-heading'
import { ListingCard } from '@/components/listings/listing-card'

export function FeaturedHomes({ listings }: { listings: Listing[] }) {
  if (!listings.length) return null
  return (
    <section aria-labelledby="featured-title" className="section-y">
      <div className="page-x-wide">
        <SectionHeading
          id="featured-title"
          title="Homes listed with our agents"
          intro="Houses, apartments and land for sale and rent. Every listing is checked by our team before it goes live."
          action={{ href: '/properties', label: 'See all homes' }}
        />
      </div>
      {/* Phones: a swipeable row that shows part of the next card. Larger screens: a grid. */}
      <ul className="scrollbar-hide page-x-wide mt-10 flex snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-12 md:overflow-visible lg:grid-cols-3">
        {listings.map((l) => (
          <li key={l.id} className="w-[82%] shrink-0 snap-start sm:w-[60%] md:w-auto">
            <ListingCard listing={l} />
          </li>
        ))}
      </ul>
    </section>
  )
}
