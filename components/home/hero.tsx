'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, type Variants } from 'framer-motion'
import { Building2, Home, Map, MapPin, Search } from 'lucide-react'
import { luxuryFrom, priceBands } from '@/config/site'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { LinkMenu, type LinkMenuGroup } from '@/components/ui/link-menu'

type Props = {
  title: string
  tagline: string
  image: { src: string; alt: string }
  markets: { slug: string; name: string; count: number }[]
  areaSuggestions: string[]
  propertyTypes: { id: string; name: string }[]
}

const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.12 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] } }),
}

export function Hero({ title, tagline, image, markets, areaSuggestions, propertyTypes }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<'sale' | 'rent'>('sale')
  const [query, setQuery] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ listing_type: mode })
    const q = query.trim()
    const market = markets.find((m) => m.name.toLowerCase() === q.toLowerCase())
    if (market) params.set('market', market.slug)
    else if (q) params.set('search', q)
    router.push(`/properties?${params}`)
  }

  const menus: { label: string; groups: LinkMenuGroup[] }[] = [
    {
      label: 'By area',
      groups: [{ links: markets.map((m) => ({ href: `/properties?market=${m.slug}`, label: m.name, meta: String(m.count) })) }],
    },
    {
      label: 'Luxury',
      groups: [
        {
          links: (['RWF', 'USD', 'NGN'] as const).map((c) => ({
            href: `/properties?currency=${c}&minPrice=${luxuryFrom[c]}`,
            label: `Over ${formatMoney(luxuryFrom[c], c, { compact: true })}`,
          })),
        },
      ],
    },
    {
      label: 'Property type',
      groups: [{ links: propertyTypes.map((t) => ({ href: `/properties?type=${t.id}`, label: t.name })) }],
    },
    {
      label: 'Price',
      groups: priceBands.map((g) => ({
        heading: g.currency,
        links: g.bands.map((b) => {
          const p = new URLSearchParams({ currency: g.currency })
          if (b.min) p.set('minPrice', String(b.min))
          if (b.max) p.set('maxPrice', String(b.max))
          return { href: `/properties?${p}`, label: b.label }
        }),
      })),
    },
  ]

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden bg-[#2b1a14]">
        <Image src={image.src} alt={image.alt} fill priority quality={75} sizes="100vw" className="object-cover" />
        {/* Even scrim for the headline, deeper at the bottom for the filter rail. */}
        <div className="absolute inset-0 bg-[rgb(20_12_10/0.38)]" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[rgb(20_12_10/0.7)] to-transparent" />
      </div>

      <div className="page-x-wide flex flex-1 flex-col items-center justify-center pb-10 pt-28 text-center sm:pt-32">
        <motion.h1
          id="hero-title"
          variants={rise}
          initial="hidden"
          animate="show"
          custom={0}
          className="font-display text-display-xl font-medium uppercase tracking-[0.06em] [text-shadow:0_2px_24px_rgb(0_0_0/0.25)]"
        >
          {title}
        </motion.h1>
        <motion.p
          variants={rise}
          initial="hidden"
          animate="show"
          custom={1}
          className="mt-4 max-w-xs text-balance text-xs font-medium uppercase leading-relaxed tracking-[0.24em] text-white/90 sm:max-w-none sm:text-sm sm:tracking-[0.32em]"
        >
          {tagline}
        </motion.p>

        <motion.div variants={rise} initial="hidden" animate="show" custom={2} className="mt-10 w-full max-w-2xl">
          <form onSubmit={submit} role="search" aria-label="Search homes" className="rounded-sm bg-white p-2 text-[#1f1b19] shadow-pop">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div role="radiogroup" aria-label="Buy or rent" className="flex shrink-0 rounded-sm bg-[#edefec] p-1">
                {(['sale', 'rent'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    onClick={() => setMode(m)}
                    className={cn(
                      'h-9 flex-1 rounded-[3px] px-4 text-sm font-medium transition-colors sm:flex-none',
                      mode === m ? 'bg-[#3f1712] text-white' : 'text-[#1f1b19] hover:bg-white'
                    )}
                  >
                    {m === 'sale' ? 'Buy' : 'Rent'}
                  </button>
                ))}
              </div>
              <label className="flex min-w-0 flex-1 items-center gap-2 px-2">
                <MapPin aria-hidden className="size-5 shrink-0 text-[#66605b]" />
                <span className="sr-only">Area, address or city</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  list="hero-areas"
                  placeholder="Area, address or city"
                  className="h-11 w-full min-w-0 bg-transparent text-base text-[#1f1b19] outline-none placeholder:text-[#66605b]"
                />
                <datalist id="hero-areas">
                  {areaSuggestions.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </label>
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-sm bg-[#3f1712] px-6 text-sm font-medium text-white transition-colors hover:bg-[#5c231b]"
              >
                <Search aria-hidden className="size-4" />
                Search
              </button>
            </div>
          </form>
          <div className="grid grid-cols-2 border-t border-[#d9dad5] bg-[#f6f7f5] text-sm text-[#1f1b19]">
            <Link href="/properties?view=map" className="inline-flex h-11 items-center justify-center gap-2 border-r border-[#d9dad5] hover:bg-white">
              <Map aria-hidden className="size-4 text-[#5c231b]" />
              Map search
            </Link>
            <Link href="/projects" className="inline-flex h-11 items-center justify-center gap-2 hover:bg-white">
              <Building2 aria-hidden className="size-4 text-[#5c231b]" />
              Developments
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Quick filters: a rail on desktop, a swipeable row on phones. */}
      <motion.div variants={rise} initial="hidden" animate="show" custom={3} className="page-x-wide pb-24 sm:pb-10">
        <div className="hidden items-end gap-8 lg:flex lg:pr-20">
          {menus.map((m) => (
            <LinkMenu
              key={m.label}
              label={m.label}
              caption="Browse"
              groups={m.groups}
              placement="top"
              tone="light"
              className="w-48"
              triggerClassName="border-b border-white/60 pb-2 hover:border-white"
            />
          ))}
          <Link
            href="/sell"
            className="ml-auto flex w-60 items-end justify-between border-b border-white/60 pb-2 hover:border-white"
          >
            <span className="flex flex-col text-left">
              <span className="font-display text-sm italic text-white/75">Selling?</span>
              <span className="text-[0.9375rem] font-medium">What&apos;s my home worth?</span>
            </span>
            <Home aria-hidden className="mb-0.5 size-4" />
          </Link>
        </div>
        <ul className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
          {[...markets].sort((a, b) => Number(b.slug === 'kigali') - Number(a.slug === 'kigali')).slice(0, 4).map((m) => (
            <li key={m.slug} className="shrink-0">
              <Link href={`/properties?market=${m.slug}`} className="inline-flex h-10 items-center rounded-sm border border-white/50 bg-black/20 px-4 text-sm backdrop-blur-sm">
                {m.name}
              </Link>
            </li>
          ))}
          <li className="shrink-0">
            <Link href={`/properties?currency=RWF&minPrice=${luxuryFrom.RWF}`} className="inline-flex h-10 items-center rounded-sm border border-white/50 bg-black/20 px-4 text-sm backdrop-blur-sm">
              Luxury
            </Link>
          </li>
          <li className="shrink-0">
            <Link href="/sell" className="inline-flex h-10 items-center rounded-sm border border-white/50 bg-black/20 px-4 text-sm backdrop-blur-sm">
              Value my home
            </Link>
          </li>
        </ul>
      </motion.div>
    </section>
  )
}
