import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { getFurniture } from '@/lib/data/interiors'
import { pageMetadata } from '@/lib/seo'
import { whatsappLink } from '@/lib/whatsapp'
import { buttonClasses } from '@/components/ui/button'
import { Catalogue } from '@/components/furniture/catalogue'

export const metadata: Metadata = pageMetadata({
  title: 'Furniture',
  description: 'Sofas, beds, dining sets, lighting and decor from Akristal. Browse the catalogue and order or ask about any piece on WhatsApp.',
  path: '/furniture',
})

export default async function FurniturePage() {
  const { items, placeholder } = await getFurniture()
  return (
    <>
      <header className="page-x-wide pb-8 pt-10 sm:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-display-l font-medium">Furniture</h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Pieces chosen to finish a home. Tap any item for sizes and colours, then order on WhatsApp with the details already filled in.
            </p>
          </div>
          <a href={whatsappLink('Hello Akristal, I am looking for furniture.')} className={buttonClasses({ variant: 'outline' })}>
            <MessageCircle aria-hidden className="size-4" /> Ask about something else
          </a>
        </div>
        {placeholder && (
          <p className="mt-6 rounded-sm bg-page-alt px-4 py-3 text-sm text-muted">
            This is a sample of the range while we photograph our full catalogue. Prices are given on request.
          </p>
        )}
      </header>

      <section aria-label="Catalogue" className="page-x-wide pb-20">
        <Catalogue items={items} placeholder={placeholder} />
      </section>

      <section aria-labelledby="whole-home" className="bg-brand text-white">
        <div className="page-x flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="whole-home" className="font-display text-display-s font-medium">
              Furnishing a whole home?
            </h2>
            <p className="mt-2 text-white/80">Our interior designers can plan and supply everything, room by room, to one budget.</p>
          </div>
          <Link href="/interior-design#consultation" className={buttonClasses({ variant: 'inverse' })}>
            Talk to a designer
          </Link>
        </div>
      </section>
    </>
  )
}
