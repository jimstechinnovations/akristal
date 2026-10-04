import Link from 'next/link'
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { requireAdmin } from '@/lib/auth'
import { adminCounts } from '@/lib/admin/load'
import { cn } from '@/lib/utils'

export default async function AdminOverview() {
  const user = await requireAdmin()
  const c = await adminCounts()
  const firstName = user.profile?.full_name?.split(' ')[0] ?? 'there'

  const inbox = [
    { label: 'New leads', value: c.newLeads, href: '/admin/content/leads?status=new', help: 'Viewings, valuations, enquiries' },
    { label: 'Reviews to approve', value: c.pendingReviews, href: '/admin/content/reviews?status=pending', help: 'Hidden until approved' },
    { label: 'Agent applications', value: c.newApplications, href: '/admin/content/applications?status=new', help: 'From Become an agent' },
    { label: 'Listings to approve', value: c.pendingListings, href: '/admin/properties', help: 'Submitted by sellers and agents' },
  ]

  // Each item is computed from the live data, so it ticks itself off when done.
  const checklist = [
    { done: c.agentsNoPhoto === 0, label: 'Give every agent a photo, bio, areas and WhatsApp number', detail: c.agentsNoPhoto ? `${c.agentsNoPhoto} agent profiles have no photo` : 'All agents have a photo', href: '/admin/content/agents' },
    { done: c.listingsNoAgent === 0, label: 'Assign an agent to each live listing', detail: c.listingsNoAgent ? `${c.listingsNoAgent} of ${c.liveListings} live listings have no agent, so agent pages show no homes` : 'Every live listing has an agent', href: '/admin/content/listings' },
    { done: c.devsNoPrice === 0, label: 'Add starting prices to developments on sale', detail: c.devsNoPrice ? `${c.devsNoPrice} development(s) show "Prices on request"` : 'All developments on sale have a price', href: '/admin/content/developments' },
    { done: c.lenders > 0, label: 'Publish your partner lenders on the Mortgage page', detail: c.lenders ? `${c.lenders} lender(s) published` : 'No lenders published yet', href: '/admin/content/lenders' },
    { done: c.testimonials > 0, label: 'Add client testimonials (with their permission)', detail: c.testimonials ? `${c.testimonials} testimonial(s) on the home page` : 'The home page testimonial section is hidden until you add one', href: '/admin/content/testimonials' },
    { done: false, label: 'Replace stock photos with your own', detail: 'Furniture, interior portfolio, home page hero and section photos', href: '/admin/content/furniture' },
    { done: false, label: 'Confirm Pay Small Small terms and agent commission', detail: 'Deposit, tenures, any premium; commission levels and FAQ', href: '/admin/content/plans' },
  ]
  const done = checklist.filter((i) => i.done).length

  return (
    <div className="grid gap-10">
      <header>
        <h1 className="font-display text-display-m font-medium">Welcome, {firstName}</h1>
        <p className="mt-2 max-w-2xl text-[0.9375rem] text-muted">
          Everything on the public website is managed from here. New to it?{' '}
          <Link href="/admin/guide" className="text-ink underline underline-offset-4">
            Read how the website works
          </Link>{' '}
          (about five minutes).
        </p>
      </header>

      <section aria-labelledby="inbox-title">
        <h2 id="inbox-title" className="text-lg font-semibold">
          Needs your attention
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {inbox.map((i) => (
            <li key={i.label}>
              <Link href={i.href} className="group block rounded-md border border-line p-5 transition-colors hover:border-ink">
                <p className={cn('tabular text-4xl font-light', i.value > 0 && 'text-primary')}>{i.value}</p>
                <p className="mt-2 font-medium">{i.label}</p>
                <p className="text-sm text-muted">{i.help}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="setup-title" className="rounded-md border border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="setup-title" className="text-lg font-semibold">
            Launch checklist
          </h2>
          <p className="tabular text-sm text-muted">
            {done} of {checklist.length} done
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-success" style={{ width: `${(done / checklist.length) * 100}%` }} />
        </div>
        <ul className="mt-5 grid gap-1">
          {checklist.map((i) => (
            <li key={i.label}>
              <Link href={i.href} className="group flex items-start gap-3 rounded-sm px-2 py-3 hover:bg-page-alt">
                {i.done ? <CheckCircle2 aria-label="Done" className="mt-0.5 size-5 shrink-0 text-success" /> : <Circle aria-label="To do" className="mt-0.5 size-5 shrink-0 text-line-strong" />}
                <span className="flex-1">
                  <span className={cn('block font-medium', i.done && 'text-muted line-through decoration-line-strong')}>{i.label}</span>
                  <span className="text-sm text-muted">{i.detail}</span>
                </span>
                <ArrowRight aria-hidden className="mt-0.5 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="quick-title">
        <h2 id="quick-title" className="text-lg font-semibold">
          Common tasks
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Add a development', '/admin/content/developments/new'],
            ['Approve a listing', '/admin/properties'],
            ['Feature a home on the home page', '/admin/content/listings'],
            ['Edit an agent profile', '/admin/content/agents'],
            ['Add a furniture item', '/admin/content/furniture/new'],
            ['Add a portfolio project', '/admin/content/interiors/new'],
            ['Change the home page headline or photo', '/admin/content/home-settings'],
            ['Edit agent commission and FAQ', '/admin/content/agent-programme'],
            ['Create a user or agent account', '/admin/users/new'],
          ].map(([label, href]) => (
            <li key={href}>
              <Link href={href} className="flex items-center justify-between rounded-sm border border-line px-4 py-3 text-sm hover:border-ink">
                {label}
                <ArrowRight aria-hidden className="size-4 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
