import Image from 'next/image'
import Link from 'next/link'
import { images } from '@/content/images'

const panels = [
  {
    href: '/interior-design',
    title: 'Interior design',
    text: 'We design and decorate homes, offices and short-let apartments, from the first plan to the finished room.',
    cta: 'See our interiors',
    image: images.interiorsLivingWarm,
  },
  {
    href: '/furniture',
    title: 'Furniture',
    text: 'Sofas, beds, dining sets and lighting chosen to finish a home. Ask about any piece on WhatsApp.',
    cta: 'Browse furniture',
    image: images.interiorsLivingWood,
  },
]

export function InteriorsTeaser() {
  return (
    <section aria-label="Interiors and furniture" className="section-y">
      <div className="page-x-wide grid gap-4 md:grid-cols-2 lg:gap-6">
        {panels.map((p) => (
          <article key={p.href} className="group relative isolate flex min-h-[460px] flex-col justify-end overflow-hidden rounded-md p-6 text-white sm:min-h-[560px] sm:p-10">
            <Image
              src={p.image.src}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="-z-10 object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_12_10/0.8)] via-[rgb(20_12_10/0.25)] to-transparent" />
            <h2 className="font-display text-display-m font-medium">{p.title}</h2>
            <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-white/85">{p.text}</p>
            <Link
              href={p.href}
              className="mt-6 inline-flex self-start border-b border-white/60 pb-0.5 text-[0.9375rem] font-medium after:absolute after:inset-0 hover:border-white"
            >
              {p.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
