'use client'

import { useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutGrid, Loader2, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react'
import { currencies } from '@/config/site'
import { SORTS, searchHref, type SearchParams } from '@/lib/listing-search'
import { cn } from '@/lib/utils'
import { fieldClasses } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'

type Option = { value: string; label: string }

type Props = {
  params: SearchParams
  raw: Record<string, string | undefined>
  markets: Option[]
  propertyTypes: Option[]
  activeCount: number
}

const ROOMS: Option[] = [
  { value: '', label: 'Any' },
  ...[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}+` })),
]

const selectClass = cn(fieldClasses, 'h-10 appearance-none bg-[length:16px] bg-[right_10px_center] bg-no-repeat pr-9 text-sm')
// Chevron drawn with an inline SVG so native selects keep their accessibility.
const chevron = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2366605b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
}

function Select({ label, value, options, onChange, className }: { label: string; value: string; options: Option[]; onChange: (v: string) => void; className?: string }) {
  // Explicit label/id pairing: wrapping the <select> in its <label> would fold the selected option into the accessible name.
  const id = useId()
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-xs text-muted">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass} style={chevron}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function FilterBar({ params, raw, markets, propertyTypes, activeCount }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState(params.search)
  const [price, setPrice] = useState({
    currency: params.currency ?? '',
    min: params.minPrice?.toString() ?? '',
    max: params.maxPrice?.toString() ?? '',
  })

  function go(changes: Record<string, string | number | null>) {
    startTransition(() => router.push(searchHref(raw, changes), { scroll: false }))
  }

  const priceInvalid = !!price.min && !!price.max && Number(price.min) > Number(price.max)

  function applyPrice() {
    if (priceInvalid) return
    go({
      currency: price.currency || null,
      minPrice: price.currency ? price.min || null : null,
      maxPrice: price.currency ? price.max || null : null,
    })
  }

  const listingOptions: Option[] = [
    { value: '', label: 'Buy or rent' },
    { value: 'sale', label: 'For sale' },
    { value: 'rent', label: 'For rent' },
  ]
  const marketOptions = [{ value: '', label: 'All areas' }, ...markets]
  const typeOptions = [{ value: '', label: 'All types' }, ...propertyTypes]
  const sortOptions = SORTS.map((s) => ({ value: s.value, label: s.label }))

  const priceFields = (
    <fieldset className="grid gap-1.5">
      <legend className="text-xs text-muted">Price</legend>
      <div className="grid grid-cols-[96px_1fr_1fr] gap-2">
        <select
          aria-label="Currency"
          value={price.currency}
          onChange={(e) => setPrice((p) => ({ ...p, currency: e.target.value }))}
          className={selectClass}
          style={chevron}
        >
          <option value="">Any</option>
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          aria-label="Minimum price"
          inputMode="numeric"
          placeholder="Min"
          disabled={!price.currency}
          value={price.min}
          onChange={(e) => setPrice((p) => ({ ...p, min: e.target.value.replace(/[^\d]/g, '') }))}
          className={cn(fieldClasses, 'h-10 text-sm')}
        />
        <input
          aria-label="Maximum price"
          inputMode="numeric"
          placeholder="Max"
          disabled={!price.currency}
          aria-invalid={priceInvalid || undefined}
          value={price.max}
          onChange={(e) => setPrice((p) => ({ ...p, max: e.target.value.replace(/[^\d]/g, '') }))}
          className={cn(fieldClasses, 'h-10 text-sm')}
        />
      </div>
      <p className={cn('text-xs', priceInvalid ? 'text-error' : 'text-muted')}>
        {priceInvalid ? 'Minimum is higher than maximum.' : 'Choose a currency to set a price range.'}
      </p>
    </fieldset>
  )

  return (
    <div className="sticky top-16 z-30 border-b border-line bg-page/95 backdrop-blur-sm sm:top-20">
      <div className="page-x-wide py-3">
        {/* Phones: search + Filters + view toggle. */}
        <div className="flex items-center gap-2 lg:hidden">
          <form
            role="search"
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault()
              go({ search: search.trim() || null })
            }}
          >
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              aria-label="Search homes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Area, address or keyword"
              className={cn(fieldClasses, 'h-10 pl-9')}
            />
          </form>
          <Button variant="outline" size="sm" className="h-10" onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
            <SlidersHorizontal aria-hidden className="size-4" />
            Filters{activeCount > 0 && ` (${activeCount})`}
          </Button>
          <ViewToggle view={params.view} onChange={(v) => go({ view: v === 'map' ? 'map' : null })} compact />
        </div>

        {/* Desktop: every filter inline. */}
        <div className="hidden items-end gap-3 lg:flex">
          <form
            role="search"
            className="relative w-64 shrink-0"
            onSubmit={(e) => {
              e.preventDefault()
              go({ search: search.trim() || null })
            }}
          >
            <span className="mb-1.5 block text-xs text-muted">Search</span>
            <Search aria-hidden className="pointer-events-none absolute bottom-3 left-3 size-4 text-muted" />
            <input
              aria-label="Search homes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Area, address or keyword"
              className={cn(fieldClasses, 'h-10 pl-9 text-sm')}
            />
          </form>
          <Select label="Buy or rent" value={params.listingType ?? ''} options={listingOptions} onChange={(v) => go({ listing_type: v || null })} className="w-36" />
          <Select label="Area" value={params.market ?? ''} options={marketOptions} onChange={(v) => go({ market: v || null })} className="w-40" />
          <Select label="Type" value={params.type ?? ''} options={typeOptions} onChange={(v) => go({ type: v || null })} className="w-44" />
          <Select label="Beds" value={params.bedrooms?.toString() ?? ''} options={ROOMS} onChange={(v) => go({ bedrooms: v || null })} className="w-24" />
          <Select label="Baths" value={params.bathrooms?.toString() ?? ''} options={ROOMS} onChange={(v) => go({ bathrooms: v || null })} className="w-24" />
          <PricePopover fields={priceFields} onApply={applyPrice} active={!!params.currency} invalid={priceInvalid} />
          <div className="ml-auto flex items-end gap-3">
            {pending && <Loader2 aria-label="Updating results" className="mb-3 size-4 animate-spin text-muted" />}
            <Select label="Sort" value={params.sort} options={sortOptions} onChange={(v) => go({ sort: v === 'newest' ? null : v })} className="w-44" />
            <ViewToggle view={params.view} onChange={(v) => go({ view: v === 'map' ? 'map' : null })} />
          </div>
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setSheetOpen(false)
                startTransition(() => router.push(params.view === 'map' ? '/properties?view=map' : '/properties', { scroll: false }))
              }}
            >
              Clear all
            </Button>
            <Button
              disabled={priceInvalid}
              onClick={() => {
                applyPrice()
                setSheetOpen(false)
              }}
            >
              Show homes
            </Button>
          </div>
        }
      >
        <div className="grid gap-5">
          <Select label="Buy or rent" value={params.listingType ?? ''} options={listingOptions} onChange={(v) => go({ listing_type: v || null })} />
          <Select label="Area" value={params.market ?? ''} options={marketOptions} onChange={(v) => go({ market: v || null })} />
          <Select label="Type" value={params.type ?? ''} options={typeOptions} onChange={(v) => go({ type: v || null })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Beds" value={params.bedrooms?.toString() ?? ''} options={ROOMS} onChange={(v) => go({ bedrooms: v || null })} />
            <Select label="Baths" value={params.bathrooms?.toString() ?? ''} options={ROOMS} onChange={(v) => go({ bathrooms: v || null })} />
          </div>
          {priceFields}
          <Select label="Sort" value={params.sort} options={sortOptions} onChange={(v) => go({ sort: v === 'newest' ? null : v })} />
        </div>
      </Sheet>
    </div>
  )
}

function ViewToggle({ view, onChange, compact }: { view: 'grid' | 'map'; onChange: (v: 'grid' | 'map') => void; compact?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Results view" className="flex h-10 shrink-0 rounded-sm border border-line-strong p-0.5">
      {(['grid', 'map'] as const).map((v) => {
        const Icon = v === 'grid' ? LayoutGrid : MapIcon
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={view === v}
            aria-label={v === 'grid' ? 'List' : 'Map'}
            onClick={() => onChange(v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[3px] px-2.5 text-sm transition-colors',
              view === v ? 'bg-primary text-on-primary' : 'text-ink hover:bg-page-alt'
            )}
          >
            <Icon aria-hidden className="size-4" />
            {!compact && (v === 'grid' ? 'List' : 'Map')}
          </button>
        )
      })}
    </div>
  )
}

function PricePopover({ fields, onApply, active, invalid }: { fields: React.ReactNode; onApply: () => void; active: boolean; invalid: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <span className="mb-1.5 block text-xs text-muted">Price</span>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(selectClass, 'flex w-32 items-center text-left', active && 'border-ink')}
        style={chevron}
      >
        {active ? 'Price set' : 'Any price'}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-[22rem] rounded-md border border-line bg-surface p-4 shadow-pop">
          {fields}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={invalid}
              onClick={() => {
                onApply()
                setOpen(false)
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
