import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/lib/data/projects'
import type { Copy } from '@/lib/data/copy'
import type { Stat } from '@/lib/stats'
import { cn } from '@/lib/utils'
import { Price } from '@/components/currency/price'
import { SectionHeading } from '@/components/ui/section-heading'
import { CountUp } from '@/components/motion/count-up'
import { Reveal } from '@/components/motion/reveal'
import { StageTrack } from '@/components/projects/stage-track'
import { HillsSkyline } from '@/components/illustrations/hills-skyline'

function projectHref(p: Project) {
  return `/projects/${p.slug ?? p.id}`
}

function PriceLine({ project }: { project: Project }) {
  if (project.soldOut) return <span>Sold out</span>
  if (project.priceFrom)
    return (
      <span className="tabular">
        From <Price amount={project.priceFrom.amount} currency={project.priceFrom.currency} />
      </span>
    )
  return <span>Prices on request</span>
}

function ProjectFeature({ project, lead, priority }: { project: Project; lead?: boolean; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col">
      <div className={cn('relative overflow-hidden rounded-md bg-page-alt', lead ? 'aspect-[4/3] lg:aspect-[16/11]' : 'aspect-[16/10]')}>
        <Image
          src={project.images[0]}
          alt=""
          fill
          priority={priority}
          sizes={lead ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 34vw, 100vw'}
          className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-[#1f1b19]/75 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {project.soldOut ? 'Sold out' : project.stageLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <h3 className={cn('font-display font-medium text-ink', lead ? 'text-display-s lg:text-[2.25rem]' : 'text-2xl')}>
          <Link href={projectHref(project)} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4">
            {project.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted">{project.location}</p>
        {lead && project.summary && <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ink/85">{project.summary}</p>}
        <div className="pt-5">
          <StageTrack stage={project.stage} progressPct={project.progressPct} soldOut={project.soldOut} tone="default" className="max-w-md" />
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink">
            <PriceLine project={project} />
            {project.paySmallSmall && !project.soldOut && <span className="font-medium text-brand dark:text-accent">Pay Small Small available</span>}
          </p>
        </div>
      </div>
    </article>
  )
}

export function Developments({ projects, stats, copy }: { projects: Project[]; stats: Stat[]; copy: Copy }) {
  if (!projects.length) return null
  const [lead, ...rest] = projects
  return (
    <section aria-labelledby="developments-title" className="relative isolate overflow-hidden bg-gradient-to-b from-wash via-wash/70 to-page">
      <div className="page-x-wide pt-16 lg:pt-24">
        <SectionHeading
          id="developments-title"
          title={copy.t('developments.title')}
          intro={copy.t('developments.intro')}
          action={{ href: '/projects', label: copy.t('developments.action') }}
        />

        <div className="mt-12 grid gap-x-10 gap-y-14 lg:grid-cols-12 lg:items-start">
          <Reveal className="lg:col-span-7">
            <ProjectFeature project={lead} lead priority />
          </Reveal>
          <div className="grid gap-y-14 sm:grid-cols-2 sm:gap-x-8 lg:col-span-5 lg:grid-cols-1">
            {rest.map((p, i) => (
              <Reveal key={p.id} delay={0.08 * (i + 1)}>
                <ProjectFeature project={p} />
              </Reveal>
            ))}
          </div>
        </div>

        {stats.length > 0 && (
          <dl className={cn('mt-16 grid grid-cols-2 gap-y-10 border-t border-line pt-10', stats.length >= 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4')}>
            {stats.map((s) => (
              <div key={s.label} className="pr-6">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <CountUp value={s.value} className="text-[2.75rem] font-light leading-none tracking-tight text-brand lg:text-[3.5rem] dark:text-accent" />
                  {s.suffix && <span className="text-[2rem] font-light text-brand lg:text-[2.5rem] dark:text-accent">{s.suffix}</span>}
                  <p aria-hidden className="mt-2 max-w-[14rem] text-sm text-muted">
                    {s.label}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {/* Rwanda's terraced hills, drawn as a horizon under the figures: the Akristal signature. */}
      <HillsSkyline className="mt-6 block aspect-[2.2/1] w-full text-line-art opacity-[0.28] sm:aspect-[4/1] dark:opacity-[0.38]" strokeWidth={1.1} />
    </section>
  )
}
