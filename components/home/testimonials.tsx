import type { Testimonial } from '@/lib/data/settings'

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null
  const [lead, ...rest] = items
  return (
    <section aria-labelledby="testimonials-title" className="bg-page-alt section-y">
      <div className="page-x-wide">
        <h2 id="testimonials-title" className="font-display text-display-m font-medium">
          What our clients say
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <figure>
            <blockquote className="font-display text-[1.75rem] font-medium leading-snug sm:text-[2.25rem]">&ldquo;{lead.quote}&rdquo;</blockquote>
            <figcaption className="mt-5 text-[0.9375rem]">
              <span className="font-medium">{lead.name}</span>
              {lead.context && <span className="text-muted">, {lead.context}</span>}
            </figcaption>
          </figure>
          {rest.length > 0 && (
            <ul className="grid content-start gap-6">
              {rest.slice(0, 3).map((t) => (
                <li key={t.id} className="border-t border-line pt-5">
                  <figure>
                    <blockquote className="text-[0.9375rem] leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption className="mt-2 text-sm text-muted">
                      {t.name}
                      {t.context && `, ${t.context}`}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
