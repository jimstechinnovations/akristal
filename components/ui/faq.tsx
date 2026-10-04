import { Plus } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'

/** Native <details> accordion: keyboard and screen-reader friendly with no JavaScript. Emits FAQPage JSON-LD. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
        }}
      />
      <div className="divide-y divide-line border-y border-line">
        {items.map((item) => (
          <details key={item.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1.0625rem] font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <Plus aria-hidden className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-45" />
            </summary>
            <p className="max-w-[65ch] pb-6 text-[0.9375rem] leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </>
  )
}
