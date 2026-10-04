import Image from 'next/image'
import { images } from '@/content/images'
import { fieldClasses } from '@/components/ui/input'
import { buttonClasses } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Starts a valuation here and continues on /sell (plain GET form: works without JavaScript). */
export function SellCta({ propertyTypes }: { propertyTypes: { id: string; name: string }[] }) {
  const img = images.homesVilla1
  return (
    <section aria-labelledby="sell-title" className="bg-page-alt">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[320px] lg:min-h-[560px]">
          <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex items-center px-4 py-14 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-lg">
            <h2 id="sell-title" className="font-display text-display-m font-medium">
              Selling or letting a home?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Tell us about it and an agent will contact you with a price estimate and a plan to sell or let it.
            </p>
            <form action="/sell" method="get" className="mt-8 grid gap-3">
              <label className="grid gap-1.5 text-sm">
                <span>Address or area</span>
                <input name="address" required autoComplete="street-address" className={fieldClasses} placeholder="e.g. Kibagabaga, Kigali" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                  <span>Property type</span>
                  <select name="type" className={cn(fieldClasses, 'appearance-none')} defaultValue="">
                    <option value="">Choose one</option>
                    {propertyTypes.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span>Phone or WhatsApp</span>
                  <input name="phone" type="tel" autoComplete="tel" className={fieldClasses} placeholder="+250 7…" />
                </label>
              </div>
              <button type="submit" className={buttonClasses({ className: 'mt-2 sm:justify-self-start' })}>
                Get a valuation
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
