import { Marquee } from '@/components/ui/marquee'

/** Slim moving band under the hero: what Akristal does and where. Edited in Admin → Home page. */
export function Ticker({ items }: { items: string[] }) {
  const clean = items.map((t) => t.trim()).filter(Boolean)
  if (clean.length < 2) return null
  return (
    <div className="border-b border-line bg-page-alt py-4 sm:py-5">
      <Marquee seconds={Math.max(28, clean.length * 5)} label="What Akristal does">
        {clean.map((t, i) => (
          <span key={`${t}-${i}`} className="flex items-center whitespace-nowrap font-display text-xl text-ink sm:text-2xl">
            <span className="px-6 sm:px-8">{t}</span>
            {/* A brass lozenge between items, echoing the roof lines in the illustrations. */}
            <svg aria-hidden viewBox="0 0 10 10" className="size-2.5 text-accent">
              <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </Marquee>
    </div>
  )
}
