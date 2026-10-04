import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { images } from '@/content/images'
import { getInteriorProjects } from '@/lib/data/interiors'
import { pageMetadata } from '@/lib/seo'
import { buttonClasses } from '@/components/ui/button'
import { Portfolio } from '@/components/interiors/portfolio'
import { BeforeAfter } from '@/components/interiors/before-after'
import { ContactFields, Field, LeadForm } from '@/components/forms/lead-form'

export const metadata: Metadata = pageMetadata({
  title: 'Interior design',
  description: 'Interior design, fit-out and furnishing for homes, short-let apartments and offices in Kigali and beyond, from the team that builds Akristal homes.',
  path: '/interior-design',
})

const services = [
  { title: 'Home interiors', text: 'Layouts, finishes, lighting and furniture for a new or existing home, room by room or the whole house.' },
  { title: 'Short-let and rental styling', text: 'Durable, photogenic interiors for apartments you let, ready for guests and listing photos.' },
  { title: 'Offices and shops', text: 'Workspaces and retail interiors that suit your brand and the way your team works.' },
  { title: 'Turnkey furnishing', text: 'We supply and install everything, from sofas and beds to curtains and kitchenware, so you move straight in.' },
  { title: 'Exterior and decoration', text: 'Facades, gardens, outdoor lighting and decorative finishes, designed with the interior.' },
  { title: 'Design consultation', text: 'A session with a designer to plan colours, materials and a layout you can carry out yourself.' },
]

const process = [
  { title: 'Brief', text: 'We visit or video-call, measure the space and agree what you need and your budget.' },
  { title: 'Concept', text: 'Mood boards, layouts and a colour and material palette for you to react to.' },
  { title: 'Design and quote', text: 'Detailed drawings, a furniture and finishes list, and a fixed quote.' },
  { title: 'Build and install', text: 'Our team manages the work, the suppliers and the schedule on site.' },
  { title: 'Handover', text: 'A final walk-through, styling, and a snag list closed before you move in.' },
]

export default async function InteriorDesignPage() {
  const { items, placeholder } = await getInteriorProjects()
  const pairs = items.flatMap((p) => p.beforeAfter.map((b) => ({ ...b, caption: b.caption ?? p.title })))
  const hero = images.interiorsLivingWarm

  return (
    <>
      <section className="relative isolate flex min-h-[78svh] items-end text-white">
        <Image src={hero.src} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgb(20_12_10/0.85)] via-[rgb(20_12_10/0.3)] to-transparent" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[rgb(20_12_10/0.55)] to-transparent" />
        <div className="page-x-wide pb-14 pt-28">
          <h1 className="max-w-3xl font-display text-display-xl font-medium">Interiors, finished by the people who built them</h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Design, fit-out and furnishing for homes, short-let apartments and offices, from first sketch to the last cushion.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#consultation" className={buttonClasses({ className: 'bg-white text-[#1f1b19] hover:bg-[#edefec]' })}>
              Book a consultation
            </a>
            <a href="#portfolio" className={buttonClasses({ variant: 'inverse' })}>
              See our work
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="services-title" className="page-x section-y">
        <h2 id="services-title" className="max-w-xl font-display text-display-m font-medium">
          What we do
        </h2>
        <dl className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="border-t border-line pt-5">
              <dt className="text-lg font-semibold">{s.title}</dt>
              <dd className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{s.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="portfolio" aria-labelledby="portfolio-title" className="scroll-mt-20 bg-page-alt section-y">
        <div className="page-x-wide">
          <h2 id="portfolio-title" className="font-display text-display-m font-medium">
            Portfolio
          </h2>
          {placeholder ? (
            <p className="mb-8 mt-3 max-w-2xl text-[0.9375rem] text-muted">
              Sample images showing the style we work in. Photos of our completed interiors will be added here.
            </p>
          ) : (
            <p className="mb-8 mt-3 max-w-2xl text-[0.9375rem] text-muted">A selection of homes and spaces we have designed and furnished.</p>
          )}
          <Portfolio projects={items} />
        </div>
      </section>

      {pairs.length > 0 && (
        <section aria-labelledby="ba-title" className="page-x section-y">
          <h2 id="ba-title" className="font-display text-display-m font-medium">
            Before and after
          </h2>
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            {pairs.slice(0, 4).map((p) => (
              <BeforeAfter key={p.after} before={p.before} after={p.after} caption={p.caption} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="process-title" className="page-x section-y">
        <h2 id="process-title" className="font-display text-display-m font-medium">
          How a project runs
        </h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {process.map((s, i) => (
            <li key={s.title}>
              <span className="tabular font-display text-5xl leading-none text-line-strong">{i + 1}</span>
              <p className="mt-4 text-lg font-semibold">{s.title}</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="consultation" aria-labelledby="consult-title" className="scroll-mt-20 border-t border-line bg-page-alt section-y">
        <div className="page-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 id="consult-title" className="font-display text-display-m font-medium">
              Book a consultation
            </h2>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">Tell us about the space. A designer will contact you to arrange a visit or video call.</p>
            <p className="mt-6 text-[0.9375rem]">
              Need furniture only?{' '}
              <Link href="/furniture" className="underline underline-offset-4">
                Browse furniture
              </Link>
              .
            </p>
          </div>
          <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
            <LeadForm type="consultation" submitLabel="Book my consultation" successTitle="Consultation requested" successText="A designer will contact you to arrange a time.">
              <ContactFields />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  as="select"
                  name="space"
                  label="What is the space?"
                  options={['Whole home', 'One or two rooms', 'Kitchen', 'Short-let apartment', 'Office or shop', 'Outdoor or exterior'].map((v) => ({ value: v, label: v }))}
                />
                <Field name="location" label="Where is it?" placeholder="e.g. Kimihurura, Kigali" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  as="select"
                  name="budget"
                  label="Budget"
                  options={['Not sure yet', 'Under RWF 5M', 'RWF 5M to 20M', 'RWF 20M to 50M', 'Over RWF 50M'].map((v) => ({ value: v, label: v }))}
                />
                <Field
                  as="select"
                  name="timing"
                  label="When would you like to start?"
                  options={['As soon as possible', 'Within 3 months', 'In 3 to 6 months', 'Just exploring'].map((v) => ({ value: v, label: v }))}
                />
              </div>
              <Field as="textarea" name="message" label="Tell us about the project" rows={4} />
            </LeadForm>
          </div>
        </div>
      </section>
    </>
  )
}
