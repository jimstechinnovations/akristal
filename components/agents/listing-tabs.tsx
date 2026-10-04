'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Listing } from '@/lib/data/listings'
import { formatArea, formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ListingCard } from '@/components/listings/listing-card'

type TabKey = 'forSale' | 'forRent' | 'sold'
const TABS: { key: TabKey; label: string; empty: string }[] = [
  { key: 'forSale', label: 'For sale', empty: 'No homes for sale with this agent right now.' },
  { key: 'forRent', label: 'For rent', empty: 'No homes for rent with this agent right now.' },
  { key: 'sold', label: 'Sold and let', empty: 'No completed sales recorded on the site yet.' },
]

export function AgentListingTabs({ groups, agentFirstName }: { groups: Record<TabKey, Listing[]>; agentFirstName: string }) {
  const firstWithItems = TABS.find((t) => groups[t.key].length)?.key ?? 'forSale'
  const [tab, setTab] = useState<TabKey>(firstWithItems)
  const items = groups[tab]

  return (
    <div>
      <div role="tablist" aria-label={`${agentFirstName}'s homes`} className="flex gap-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            id={`tab-${t.key}`}
            type="button"
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => setTab(t.key)}
            className={cn('relative -mb-px flex items-center gap-2 pb-3 text-[0.9375rem] transition-colors', tab === t.key ? 'text-ink' : 'text-muted hover:text-ink')}
          >
            {t.label}
            <span className="tabular rounded-sm bg-page-alt px-1.5 text-xs">{groups[t.key].length}</span>
            {tab === t.key && <motion.span layoutId="agent-tab" className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-8">
        {!items.length ? (
          <p className="rounded-md bg-page-alt px-5 py-8 text-center text-[0.9375rem] text-muted">
            {TABS.find((t) => t.key === tab)!.empty}{' '}
            <Link href="/properties" className="text-ink underline underline-offset-4">
              Browse all homes
            </Link>
          </p>
        ) : tab === 'sold' ? (
          // Past sales read best as a compact table (SERHANT pattern).
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th className="py-3 pr-4 font-normal">Home</th>
                  <th className="py-3 pr-4 font-normal">Area</th>
                  <th className="py-3 pr-4 font-normal">Beds</th>
                  <th className="py-3 pr-4 font-normal">Size</th>
                  <th className="py-3 text-right font-normal">Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((l) => (
                  <tr key={l.id} className="border-b border-line">
                    <td className="py-3 pr-4">{l.title}</td>
                    <td className="py-3 pr-4 text-muted">{[l.area, l.market?.name].filter(Boolean).join(', ')}</td>
                    <td className="tabular py-3 pr-4">{l.bedrooms ?? '–'}</td>
                    <td className="tabular py-3 pr-4">{formatArea(l.sizeSqm) ?? '–'}</td>
                    <td className="tabular py-3 text-right">{formatMoney(l.price, l.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((l) => (
              <li key={l.id}>
                <ListingCard listing={l} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
