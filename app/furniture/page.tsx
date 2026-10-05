import type { Metadata } from 'next'
import Link from 'next/link'
import { getCopy } from '@/lib/data/copy'
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
  const [items, copy] = await Promise.all([getFurniture(), getCopy('furniture')])
  return (
    <>
      <header className="page-x-wide pb-8 pt-10 sm:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="font-display text-display-l font-medium">{copy.t('hero.title')}</h1>
            <p className="mt-3 text-base leading-relaxed text-muted">
              {copy.t('hero.intro')}
            </p>
          </div>
          <a href={whatsappLink('Hello Akristal, I am looking for furniture.')} className={buttonClasses({ variant: 'outline' })}>
            <MessageCircle aria-hidden className="size-4" /> {copy.t('hero.cta')}
          </a>
        </div>
      </header>

      <section aria-label="Catalogue" className="page-x-wide pb-20">
        {items.length ? (
          <Catalogue items={items} />
        ) : (
          <p className="rounded-md bg-page-alt px-6 py-10 text-center text-muted">{copy.t('empty')}</p>
        )}
      </section>

      <section aria-labelledby="whole-home" className="bg-brand text-white">
        <div className="page-x flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="whole-home" className="font-display text-display-s font-medium">
              {copy.t('banner.title')}
            </h2>
            <p className="mt-2 text-white/80">{copy.t('banner.text')}</p>
          </div>
          <Link href="/interior-design#consultation" className={buttonClasses({ variant: 'inverse' })}>
            {copy.t('banner.cta')}
          </Link>
        </div>
      </section>
    </>
  )
}
