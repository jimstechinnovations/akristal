import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { BrokerCompanyForm, type BrokerFormValues } from '@/components/account/broker-company-form'

export const metadata: Metadata = { title: 'Company page', robots: { index: false } }

export default async function BrokerCompanyPage() {
  const user = await requireRole(['broker'])
  const supabase = (await createClient()) as unknown as { from: (t: string) => any } // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: broker } = (await supabase.from('brokers').select('*').eq('owner_id', user.id).maybeSingle()) as { data: (BrokerFormValues & { slug: string | null; id: string; is_published: boolean }) | null }

  return (
    <div className="page-x py-8 sm:py-12">
      <Link href="/broker/dashboard" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft aria-hidden className="size-4" /> Dashboard
      </Link>
      <h1 className="mt-3 font-display text-display-m font-medium">Company page</h1>
      <p className="mt-2 max-w-2xl text-[0.9375rem] text-muted">
        What visitors see on the Akristal Brokers page. {broker?.is_published ? 'Your page is live.' : 'Your page goes live once the Akristal team approves it.'}
      </p>
      <div className="mt-8 max-w-3xl rounded-md border border-line p-6 sm:p-8">
        {broker ? (
          <BrokerCompanyForm broker={broker} />
        ) : (
          <p className="text-[0.9375rem]">
            No company is linked to this account yet. <Link href="/contact" className="underline underline-offset-4">Contact Akristal</Link> and the team will
            connect it.
          </p>
        )}
      </div>
    </div>
  )
}
