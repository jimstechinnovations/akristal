'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Minus, Plus, X } from 'lucide-react'
import { FURNITURE_CATEGORIES, type FurnitureItem } from '@/lib/data/interiors-shared'
import { formatMoney } from '@/lib/format'
import { Price } from '@/components/currency/price'
import { useFocusTrap } from '@/lib/use-focus-trap'
import { whatsappLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { ContactFields, Field, LeadForm } from '@/components/forms/lead-form'

function priceLabel(item: FurnitureItem) {
  return item.price ? formatMoney(item.price.amount, item.price.currency) : 'Price on request'
}

export function Catalogue({ items }: { items: FurnitureItem[] }) {
  const [category, setCategory] = useState<string>('all')
  const [selected, setSelected] = useState<FurnitureItem | null>(null)
  const categories = FURNITURE_CATEGORIES.filter((c) => items.some((i) => i.category === c.value))
  const shown = useMemo(() => (category === 'all' ? items : items.filter((i) => i.category === category)), [items, category])

  return (
    <>
      <div role="radiogroup" aria-label="Category" className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ value: 'all', label: 'Everything' }, ...categories].map((c) => {
          const count = c.value === 'all' ? items.length : items.filter((i) => i.category === c.value).length
          return (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={category === c.value}
              onClick={() => setCategory(c.value)}
              className={cn('inline-flex h-10 shrink-0 items-center gap-2 rounded-sm border px-4 text-sm transition-colors', category === c.value ? 'border-primary bg-primary text-on-primary' : 'border-line-strong hover:border-ink')}
            >
              {c.label} <span className="tabular text-xs opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      <motion.ul layout className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        <AnimatePresence initial={false}>
          {shown.map((item) => (
            <motion.li key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button type="button" onClick={() => setSelected(item)} className="group block w-full text-left" aria-haspopup="dialog">
                <span className="relative block aspect-[4/5] overflow-hidden rounded-md bg-page-alt">
                  {item.images[0] && (
                    <Image src={item.images[0].src} alt="" fill sizes="(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 48vw" className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]" />
                  )}
                  {item.madeToOrder && <span className="absolute left-2 top-2 rounded-sm bg-white/95 px-2 py-0.5 text-xs text-[#1f1b19]">Made to order</span>}
                </span>
                <span className="mt-3 block text-[0.9375rem] font-medium leading-snug group-hover:underline">{item.name}</span>
                <span className="tabular mt-1 block text-sm text-muted">{item.price ? <Price amount={item.price.amount} currency={item.price.currency} /> : 'Price on request'}</span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <ProductDialog item={selected} onClose={() => setSelected(null)} />
    </>
  )
}

function ProductDialog({ item, onClose }: { item: FurnitureItem | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, !!item, onClose)
  const [colour, setColour] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [lastId, setLastId] = useState<string | null>(null)
  // Reset choices when a different product opens.
  if (item && item.id !== lastId) {
    setLastId(item.id)
    setColour(item.colours[0] ?? null)
    setQty(1)
  }

  const order = item
    ? `Hello Akristal, I'd like to order: ${item.name}${colour ? `, colour ${colour}` : ''}, quantity ${qty}${item.sku ? ` (ref ${item.sku})` : ''}. ${priceLabel(item)}.`
    : ''

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div aria-hidden className="absolute inset-0 bg-[rgb(20_12_10/0.55)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative grid max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-lg bg-surface text-ink sm:rounded-lg md:grid-cols-2"
          >
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-[#1f1b19] hover:bg-white">
              <X aria-hidden className="size-5" />
            </button>
            <div className="relative aspect-square bg-page-alt md:aspect-auto md:min-h-full">
              {item.images[0] && <Image src={item.images[0].src} alt={item.images[0].alt} fill sizes="(min-width: 768px) 448px, 100vw" className="object-cover" />}
            </div>
            <div className="grid content-start gap-5 p-6 sm:p-8">
              <div>
                <h2 id="product-title" className="font-display text-display-s font-medium">
                  {item.name}
                </h2>
                <p className="tabular mt-2 text-lg">{item.price ? <Price amount={item.price.amount} currency={item.price.currency} /> : 'Price on request'}</p>
              </div>
              {item.description && <p className="text-[0.9375rem] leading-relaxed text-muted">{item.description}</p>}
              <dl className="grid gap-2 text-[0.9375rem]">
                {item.dimensions && (
                  <div className="flex justify-between gap-4 border-b border-line pb-2">
                    <dt className="text-muted">Size</dt>
                    <dd className="text-right">{item.dimensions}</dd>
                  </div>
                )}
                {item.materials.length > 0 && (
                  <div className="flex justify-between gap-4 border-b border-line pb-2">
                    <dt className="text-muted">Materials</dt>
                    <dd className="text-right">{item.materials.join(', ')}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-b border-line pb-2">
                  <dt className="text-muted">Availability</dt>
                  <dd className="text-right">{item.madeToOrder ? `Made to order${item.leadTimeDays ? `, about ${item.leadTimeDays} days` : ''}` : 'Ask for stock'}</dd>
                </div>
              </dl>
              {item.colours.length > 0 && (
                <fieldset>
                  <legend className="text-sm">Colour</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.colours.map((c) => (
                      <button key={c} type="button" aria-pressed={colour === c} onClick={() => setColour(c)} className={cn('h-9 rounded-sm border px-3 text-sm', colour === c ? 'border-primary bg-primary text-on-primary' : 'border-line-strong hover:border-ink')}>
                        {c}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              <div className="flex items-center gap-3">
                <span className="text-sm">Quantity</span>
                <div className="flex items-center rounded-sm border border-line-strong">
                  <button type="button" aria-label="Fewer" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} className="inline-flex size-10 items-center justify-center disabled:opacity-40">
                    <Minus aria-hidden className="size-4" />
                  </button>
                  <span className="tabular w-8 text-center" aria-live="polite">
                    {qty}
                  </span>
                  <button type="button" aria-label="More" disabled={qty >= 20} onClick={() => setQty((q) => Math.min(20, q + 1))} className="inline-flex size-10 items-center justify-center disabled:opacity-40">
                    <Plus aria-hidden className="size-4" />
                  </button>
                </div>
              </div>
              <a href={whatsappLink(order)} className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-[#1f6f4a] text-[0.9375rem] font-medium text-white hover:bg-[#185c3d]">
                <MessageCircle aria-hidden className="size-5" /> Order on WhatsApp
              </a>
              <details className="rounded-md border border-line">
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Or send an enquiry</summary>
                <div className="border-t border-line p-4">
                  <LeadForm type="furniture" submitLabel="Send enquiry" successText="We will contact you with price, stock and delivery.">
                    <input type="hidden" name="item" value={`${item.name}${colour ? ` (${colour})` : ''} × ${qty}`} />
                    <ContactFields compact />
                    <Field as="textarea" name="message" label="Delivery area or questions" rows={2} />
                  </LeadForm>
                </div>
              </details>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
