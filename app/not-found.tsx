import Link from 'next/link'
import { buttonClasses } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="page-x flex min-h-[70svh] flex-col justify-center py-20">
      <p className="tabular text-sm text-muted">Error 404</p>
      <h1 className="mt-2 max-w-2xl font-display text-display-l font-medium">This page has moved or no longer exists</h1>
      <p className="mt-4 max-w-xl text-base text-muted">
        The home may have been sold or let, or the link may be out of date. Try one of these instead.
      </p>
      <form action="/properties" method="get" role="search" className="mt-8 flex max-w-lg gap-2">
        <label htmlFor="nf-search" className="sr-only">
          Search homes
        </label>
        <input
          id="nf-search"
          name="search"
          placeholder="Area, address or keyword"
          className="h-11 flex-1 rounded-sm border border-line-strong bg-surface px-3.5 text-[0.9375rem] text-ink placeholder:text-muted"
        />
        <button type="submit" className={buttonClasses()}>
          Search
        </button>
      </form>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[0.9375rem]">
        <Link href="/properties?listing_type=sale" className="underline underline-offset-4">
          Homes for sale
        </Link>
        <Link href="/properties?listing_type=rent" className="underline underline-offset-4">
          Homes for rent
        </Link>
        <Link href="/projects" className="underline underline-offset-4">
          Our developments
        </Link>
        <Link href="/" className="underline underline-offset-4">
          Home page
        </Link>
      </div>
    </section>
  )
}
