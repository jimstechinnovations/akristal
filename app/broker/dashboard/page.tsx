import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, Clock, ExternalLink, FileText, Pencil, Plus } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { buttonClasses } from '@/components/ui/button'
import { ContactStats } from '@/components/account/contact-stats'

export const metadata: Metadata = { title: 'Broker dashboard', robots: { index: false } }

type Broker = { id: string; slug: string | null; name: string; is_published: boolean; is_verified: boolean }

export default async function BrokerDashboard() {
  const user = await requireRole(['broker'])
  const supabase = (await createClient()) as unknown as { from: (t: string) => any } // eslint-disable-line @typescript-eslint/no-explicit-any
  const [{ data: broker }, { data: listings }] = (await Promise.all([
    supabase.from('brokers').select('id, slug, name, is_published, is_verified').eq('owner_id', user.id).maybeSingle(),
    supabase.from('properties').select('listing_status').eq('seller_id', user.id),
  ])) as [{ data: Broker | null }, { data: { listing_status: string }[] | null }]

  const live = (listings ?? []).filter((l) => l.listing_status === 'approved').length
  const waiting = (listings ?? []).filter((l) => l.listing_status === 'pending_approval').length

  return (
    <div className="page-x py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">Broker dashboard</p>
          <h1 className="mt-1 font-display text-display-m font-medium">{broker?.name ?? 'Your company'}</h1>
          {broker && (
            <p className={`mt-2 inline-flex items-center gap-1.5 text-sm ${broker.is_published ? 'text-success' : 'text-muted'}`}>
              {broker.is_published ? <BadgeCheck aria-hidden className="size-4" /> : <Clock aria-hidden className="size-4" />}
              {broker.is_published ? 'Live on the Akristal Brokers page' : 'Waiting for approval by the Akristal team'}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/seller/properties/new" className={buttonClasses()}>
            <Plus aria-hidden className="size-4" /> New listing
          </Link>
          <Link href="/seller/properties" className={buttonClasses({ variant: 'outline' })}>
            <FileText aria-hidden className="size-4" /> My listings
          </Link>
          <Link href="/broker/company" className={buttonClasses({ variant: 'outline' })}>
            <Pencil aria-hidden className="size-4" /> Company page
          </Link>
          {broker?.is_published && (
            <Link href={`/brokers/${broker.slug ?? broker.id}`} className={buttonClasses({ variant: 'ghost' })}>
              <ExternalLink aria-hidden className="size-4" /> View
            </Link>
          )}
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-md border border-line p-4">
          <dt className="text-sm text-muted">Listings live</dt>
          <dd className="tabular mt-1 text-3xl font-light">{live}</dd>
        </div>
        <div className="rounded-md border border-line p-4">
          <dt className="text-sm text-muted">Waiting for approval</dt>
          <dd className="tabular mt-1 text-3xl font-light">{waiting}</dd>
        </div>
      </dl>

      <div className="mt-6">{broker && <ContactStats brokerId={broker.id} />}</div>
    </div>
  )
}
