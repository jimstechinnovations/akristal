import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, Edit, MessageCircle, Tag } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getProject, getProjectTimeline, getProjects, toProject, type TimelineItem } from '@/lib/data/projects'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { getInstallmentPlans } from '@/lib/data/plans'
import { formatDate, formatMoney } from '@/lib/format'
import { absoluteUrl, breadcrumbJsonLd } from '@/lib/seo'
import { whatsappLink } from '@/lib/whatsapp'
import { JsonLd } from '@/components/seo/json-ld'
import { buttonClasses } from '@/components/ui/button'
import { ShowMore } from '@/components/ui/show-more'
import { Gallery } from '@/components/media/gallery'
import { StageTrack } from '@/components/projects/stage-track'
import { CostCalculator } from '@/components/finance/cost-calculator'
import { ContactFields, Field, LeadForm } from '@/components/forms/lead-form'
import { ProjectManagementTabs } from '@/components/project-management-tabs'
import { DeleteProjectButton } from '@/components/delete-project-button'
import { DeleteProjectItemButton } from '@/components/delete-project-item-button'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProject((await params).id)
  if (!project) return { title: 'Development not found', robots: { index: false } }
  const description = (project.summary ?? project.description ?? '').slice(0, 160)
  return {
    title: `${project.name}, ${project.location}`,
    description,
    alternates: { canonical: `/projects/${project.slug ?? project.id}` },
    openGraph: { title: project.name, description, url: `/projects/${project.slug ?? project.id}`, images: project.images[0] ? [project.images[0]] : undefined },
  }
}

function TimelineEntry({ item, canEdit }: { item: TimelineItem; canEdit: boolean }) {
  const Icon = item.kind === 'offer' ? Tag : CalendarDays
  return (
    <li className="relative border-l border-line pb-10 pl-8 last:pb-0">
      <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-primary" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-muted">
          {item.kind !== 'update' && <Icon aria-hidden className="size-4" />}
          <time dateTime={item.date}>{formatDate(item.date)}</time>
          {item.endDate && (
            <>
              {' '}
              to <time dateTime={item.endDate}>{formatDate(item.endDate)}</time>
            </>
          )}
        </p>
        {canEdit && <DeleteProjectItemButton itemId={item.id} itemType={item.kind} />}
      </div>
      {item.title && <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>}
      <p className="mt-2 max-w-[65ch] whitespace-pre-line text-[0.9375rem] leading-relaxed">{item.body}</p>
      {item.media.filter((m) => !/\.(mp4|webm|mov)(\?|$)/i.test(m)).length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {item.media
            .filter((m) => !/\.(mp4|webm|mov)(\?|$)/i.test(m))
            .slice(0, 6)
            .map((m) => (
              <li key={m} className="relative aspect-[4/3] overflow-hidden rounded-sm bg-page-alt">
                <Image src={m} alt="" fill sizes="(min-width: 640px) 20vw, 45vw" className="object-cover" />
              </li>
            ))}
        </ul>
      )}
    </li>
  )
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params
  const [publicProject, user] = await Promise.all([getProject(id), getCurrentUser()])
  const isAdmin = user?.profile?.role === 'admin'
  let project = publicProject
  // Drafts and archived developments are hidden from the public but still open for admins.
  if (!project && isAdmin && /^[0-9a-f-]{36}$/i.test(id)) {
    const { data } = await (await createClient()).from('projects').select('*').eq('id', id).maybeSingle()
    if (data) project = toProject(data as Database['public']['Tables']['projects']['Row'])
  }
  if (!project) notFound()
  const [timeline, plans, all] = await Promise.all([getProjectTimeline(project.id), getInstallmentPlans(), getProjects()])
  const others = all.filter((p) => p.id !== project.id && p.images.length).slice(0, 3)
  const url = absoluteUrl(`/projects/${project.slug ?? project.id}`)
  const enquiry = `Hello Akristal, I'd like details on ${project.name} (${url}).`
  // The first image is often a title card with text baked in; the hero has its own headline, so prefer the next one.
  const hero = project.images[1] ?? project.images[0]

  const facts: [string, string][] = (
    [
      ['Stage', project.soldOut ? 'Completed, sold out' : project.stageLabel],
      ['Location', project.location],
      ['Prices', project.soldOut ? 'Sold out' : project.priceFrom ? `From ${formatMoney(project.priceFrom.amount, project.priceFrom.currency)}` : 'On request'],
      ['Homes', project.unitTypes.map((u) => (u.units ? `${u.units} × ${u.type}` : u.type)).join('; ') || null],
      ['Completed', project.completionDate ? new Date(project.completionDate).getFullYear().toString() : null],
      ['Pay Small Small', project.paySmallSmall ? 'Available' : null],
    ] as [string, string | null][]
  ).filter((f): f is [string, string] => !!f[1])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: project.name,
    url,
    description: project.summary ?? undefined,
    image: project.images.slice(0, 6),
    address: { '@type': 'PostalAddress', addressLocality: project.location, addressCountry: project.country ?? undefined },
  }

  return (
    <article>
      <JsonLd data={[jsonLd, breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Developments', path: '/projects' }, { name: project.name, path: `/projects/${project.slug ?? project.id}` }])]} />

      {/* Hero: the development's own image, full width. */}
      <header className="relative isolate flex min-h-[70svh] items-end text-white">
        <div className="absolute inset-0 -z-10 bg-brand">
          {hero && <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgb(20_12_10/0.85)] via-[rgb(20_12_10/0.35)] to-[rgb(20_12_10/0.15)]" />
        </div>
        <div className="page-x-wide pb-12 pt-32">
          <Link href="/projects" className="text-sm text-white/80 hover:text-white hover:underline">
            Akristal developments
          </Link>
          <h1 className="mt-3 font-display text-display-xl font-medium">{project.name}</h1>
          <p className="mt-3 text-base text-white/85">{project.location}</p>
          <StageTrack stage={project.stage} progressPct={project.progressPct} soldOut={project.soldOut} className="mt-8 max-w-lg" />
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#enquire" className={buttonClasses({ className: 'bg-white text-[#1f1b19] hover:bg-[#edefec]' })}>
              {project.soldOut ? 'Ask about similar homes' : 'Register your interest'}
            </a>
            <a href={whatsappLink(enquiry)} className={buttonClasses({ variant: 'inverse' })}>
              <MessageCircle aria-hidden className="size-4" /> WhatsApp
            </a>
          </div>
        </div>
      </header>

      {isAdmin && (
        <div className="border-b border-line bg-page-alt">
          <div className="page-x-wide flex flex-wrap items-center gap-3 py-4">
            <span className="text-sm text-muted">Admin</span>
            <Link href={`/projects/${project.id}/edit`} className={buttonClasses({ variant: 'outline', size: 'sm' })}>
              <Edit aria-hidden className="size-4" /> Edit development
            </Link>
            <DeleteProjectButton projectId={project.id} />
          </div>
        </div>
      )}

      <div className="page-x-wide grid gap-14 py-14 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-20">
        <div className="min-w-0">
          <section aria-labelledby="overview-title">
            <h2 id="overview-title" className="font-display text-display-m font-medium">
              Overview
            </h2>
            {project.summary && <p className="mt-4 max-w-[65ch] text-lg leading-relaxed">{project.summary}</p>}
            <dl className="mt-8 grid gap-x-8 sm:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line py-3 text-[0.9375rem]">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {project.images.length > 1 || project.videos.length ? (
            <section aria-labelledby="gallery-title" className="mt-14">
              <h2 id="gallery-title" className="mb-6 font-display text-display-s font-medium">
                Photos and plans
              </h2>
              <Gallery images={project.images} videos={project.videos} title={project.name} />
            </section>
          ) : null}

          {project.description && (
            <section aria-labelledby="story-title" className="mt-14">
              <h2 id="story-title" className="font-display text-display-s font-medium">
                About the development
              </h2>
              <ShowMore text={project.description} className="mt-4 max-w-[70ch]" />
            </section>
          )}

          {(timeline.offers.length > 0 || timeline.events.length > 0) && (
            <section aria-labelledby="offers-title" className="mt-14">
              <h2 id="offers-title" className="font-display text-display-s font-medium">
                Current offers and events
              </h2>
              <ol className="mt-8">
                {[...timeline.offers, ...timeline.events].map((item) => (
                  <TimelineEntry key={item.id} item={item} canEdit={isAdmin} />
                ))}
              </ol>
            </section>
          )}

          {timeline.updates.length > 0 && (
            <section aria-labelledby="updates-title" className="mt-14">
              <h2 id="updates-title" className="font-display text-display-s font-medium">
                Progress updates
              </h2>
              <ol className="mt-8">
                {timeline.updates.map((item) => (
                  <TimelineEntry key={item.id} item={item} canEdit={isAdmin} />
                ))}
              </ol>
            </section>
          )}

          {isAdmin && (
            <section aria-label="Manage updates, offers and events" className="mt-14 rounded-md border border-dashed border-line-strong p-5">
              <ProjectManagementTabs projectId={project.id} />
            </section>
          )}

          {project.priceFrom && !project.soldOut && (
            <div className="mt-14">
              <CostCalculator price={project.priceFrom.amount} currency={project.priceFrom.currency} plan={plans[0]} />
            </div>
          )}
        </div>

        <aside id="enquire" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-md border border-line p-5">
            <h2 className="text-lg font-semibold">{project.soldOut ? 'Ask about similar homes' : `Register interest in ${project.name}`}</h2>
            <p className="mb-5 mt-1 text-sm text-muted">
              {project.soldOut
                ? 'This development is sold out. Tell us what you are looking for and we will suggest homes like it.'
                : 'Get prices, floor plans and payment options as soon as they are released.'}
            </p>
            <LeadForm
              type="project_enquiry"
              context={{ projectId: project.id }}
              submitLabel={project.soldOut ? 'Send my request' : 'Register my interest'}
              successTitle="You're on the list"
              successText={`We will contact you with details on ${project.name}.`}
            >
              <ContactFields compact />
              <Field
                as="select"
                name="interest"
                label="I'm interested in"
                options={[
                  { value: 'Buying to live in', label: 'Buying to live in' },
                  { value: 'Buying to invest', label: 'Buying to invest' },
                  { value: 'Pay Small Small', label: 'Paying in instalments (Pay Small Small)' },
                  { value: 'Mortgage', label: 'Buying with a mortgage' },
                ]}
              />
              <Field as="textarea" name="message" label="Questions" rows={3} />
            </LeadForm>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section aria-labelledby="others-title" className="border-t border-line bg-page-alt py-16">
          <div className="page-x-wide">
            <h2 id="others-title" className="font-display text-display-m font-medium">
              Other Akristal developments
            </h2>
            <ul className="mt-10 grid gap-8 md:grid-cols-3">
              {others.map((p) => (
                <li key={p.id} className="group relative">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-md">
                    <Image src={p.images[0]} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-medium">
                    <Link href={`/projects/${p.slug ?? p.id}`} className="after:absolute after:inset-0 group-hover:underline">
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {p.location}, {p.soldOut ? 'sold out' : p.stageLabel.toLowerCase()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  )
}
