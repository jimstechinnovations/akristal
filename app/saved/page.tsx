import type { Metadata } from 'next'
import { getAllListings } from '@/lib/data/listings'
import { SavedHomes } from '@/components/listings/saved-homes'

export const metadata: Metadata = {
  title: 'Saved homes',
  robots: { index: false },
}

export const revalidate = 600

export default async function SavedPage() {
  const listings = await getAllListings()
  return (
    <div className="page-x-wide py-10 sm:py-14">
      <h1 className="font-display text-display-l font-medium">Saved homes</h1>
      <p className="mt-2 text-[0.9375rem] text-muted">Homes you saved with the heart. They are kept on this device.</p>
      <SavedHomes listings={listings} />
    </div>
  )
}
