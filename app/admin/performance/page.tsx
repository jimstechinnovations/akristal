import Link from 'next/link'
import { MessageCircle, Mail, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getRates } from '@/lib/data/rates'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { roundApprox } from '@/lib/currency'

export const dynamic = 'force-dynamic'

type PageProps = { searchParams: Promise<{ days?: string }> }
type Row = {
  key: string
  name: string
  kind: 'Agent' | 'Broker'
  href: string | null
  whatsapp: number
  call: number
  email: number
  leads: number
  sales: number
  value: Record<string, number>
}

const PERIODS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: 'all', label: 'All time' },
]

/** Start of the chosen period as an ISO date; the page is rendered per request, so "now" is the request time. */
function startOf(period: string) {
  return period === 'all' ? null : new Date(Date.now() - Number(period) * 86_400_000).toISOString()
}

export default async function PerformancePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const period = PERIODS.some((p) => p.value === sp.days) ? sp.days! : '30'
  const since = startOf(period)
  // Loose client type: @supabase/ssr 0.5 and supabase-js 2.88 disagree on generics, so rows are typed below instead.
  const supabase = (await createClient()) as unknown as { from: (t: string) => any } // eslint-disable-line @typescript-eslint/no-explicit-any

  let events = supabase.from('contact_events').select('agent_id, broker_id, channel').limit(50_000)
  let leads = supabase.from('leads').select('agent_id, assigned_to').limit(50_000)
  let sales = supabase.from('agent_sales').select('agent_id, broker_id, sale_price, currency, status').neq('status', 'cancelled')
  if (since) {
    events = events.gte('created_at', since)
    leads = leads.gte('created_at', since)
    sales = sales.gte('closed_on', since.slice(0, 10))
  }
  type Res<T> = Promise<{ data: T[] | null }>
  const [{ data: agents }, { data: brokers }, { data: ev }, { data: ld }, { data: sl }, rates] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email, slug').eq('role', 'agent') as Res<{ id: string; full_name: string | null; email: string }>,
    supabase.from('brokers').select('id, name, slug, is_published') as Res<{ id: string; name: string }>,
    events as Res<{ agent_id: string | null; broker_id: string | null; channel: 'whatsapp' | 'call' | 'email' }>,
    leads as Res<{ agent_id: string | null; assigned_to: string | null }>,
    sales as Res<{ agent_id: string | null; broker_id: string | null; sale_price: number | null; currency: string }>,
    getRates(),
  ])

  const rows = new Map<string, Row>()
  const empty = (key: string, name: string, kind: Row['kind'], href: string | null): Row => ({ key, name, kind, href, whatsapp: 0, call: 0, email: 0, leads: 0, sales: 0, value: {} })
  for (const a of agents ?? []) rows.set(`a:${a.id}`, empty(`a:${a.id}`, a.full_name || a.email, 'Agent', `/admin/content/agents/${a.id}`))
  for (const b of brokers ?? []) rows.set(`b:${b.id}`, empty(`b:${b.id}`, b.name, 'Broker', `/admin/content/brokers/${b.id}`))
  const rowFor = (agentId: string | null, brokerId: string | null) => (agentId ? rows.get(`a:${agentId}`) : brokerId ? rows.get(`b:${brokerId}`) : undefined)

  for (const e of ev ?? []) {
    const r = rowFor(e.agent_id, e.broker_id)
    if (r && (e.channel === 'whatsapp' || e.channel === 'call' || e.channel === 'email')) r[e.channel] += 1
  }
  for (const l of ld ?? []) {
    const r = rowFor(l.agent_id ?? l.assigned_to, null)
    if (r) r.leads++
  }
  for (const s of sl ?? []) {
    const r = rowFor(s.agent_id, s.broker_id)
    if (!r) continue
    r.sales++
    if (s.sale_price) r.value[s.currency] = (r.value[s.currency] ?? 0) + Number(s.sale_price)
  }

  const contacts = (r: Row) => r.whatsapp + r.call + r.email
  const list = [...rows.values()].filter((r) => contacts(r) + r.leads + r.sales > 0 || r.kind === 'Agent').sort((a, b) => b.sales - a.sales || contacts(b) - contacts(a) || a.name.localeCompare(b.name))
  const totals = list.reduce((t, r) => ({ whatsapp: t.whatsapp + r.whatsapp, call: t.call + r.call, email: t.email + r.email, leads: t.leads + r.leads, sales: t.sales + r.sales }), { whatsapp: 0, call: 0, email: 0, leads: 0, sales: 0 })

  // Sale values in several currencies are summed in US dollars at today's rate, as an estimate.
  const usd = (value: Record<string, number>) => {
    if (!rates) return null
    let total = 0
    for (const [cur, amount] of Object.entries(value)) {
      const r = rates.rates[cur]
      if (!r) return null
      total += amount / r
    }
    return total
  }

  return (
    <div>
      <h1 className="font-display text-display-s font-medium">Brokers &amp; Agents performance</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Every tap on WhatsApp, Call or Email on a broker or agent is counted, along with the enquiries sent to them and the sales recorded in{' '}
        <Link href="/admin/content/sales" className="underline underline-offset-4">
          Sales
        </Link>
        .
      </p>

      <nav aria-label="Period" className="mt-6 inline-flex gap-1 rounded-md border border-line p-1">
        {PERIODS.map((p) => (
          <Link
            key={p.value}
            href={`/admin/performance?days=${p.value}`}
            aria-current={p.value === period ? 'page' : undefined}
            className={cn('inline-flex h-9 items-center rounded-sm px-3 text-sm', p.value === period ? 'bg-primary text-on-primary' : 'text-muted hover:bg-page-alt hover:text-ink')}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: 'WhatsApp taps', value: totals.whatsapp },
          { label: 'Call taps', value: totals.call },
          { label: 'Email taps', value: totals.email },
          { label: 'Enquiries', value: totals.leads },
          { label: 'Sales', value: totals.sales },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-line p-4">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="tabular mt-1 text-3xl font-light">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-page-alt text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-normal">Broker or agent</th>
              <th className="px-3 py-3 text-right font-normal">
                <MessageCircle aria-hidden className="mr-1 inline size-4" />
                WhatsApp
              </th>
              <th className="px-3 py-3 text-right font-normal">
                <Phone aria-hidden className="mr-1 inline size-4" />
                Calls
              </th>
              <th className="px-3 py-3 text-right font-normal">
                <Mail aria-hidden className="mr-1 inline size-4" />
                Emails
              </th>
              <th className="px-3 py-3 text-right font-normal">Enquiries</th>
              <th className="px-3 py-3 text-right font-normal">Sales</th>
              <th className="px-4 py-3 text-right font-normal">Sales value</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {list.map((r) => {
              const total = usd(r.value)
              return (
                <tr key={r.key} className="border-t border-line">
                  <td className="px-4 py-3">
                    {r.href ? (
                      <Link href={r.href} className="font-medium hover:underline">
                        {r.name}
                      </Link>
                    ) : (
                      r.name
                    )}
                    <span className="ml-2 text-xs text-muted">{r.kind}</span>
                  </td>
                  <td className="px-3 py-3 text-right">{r.whatsapp || '–'}</td>
                  <td className="px-3 py-3 text-right">{r.call || '–'}</td>
                  <td className="px-3 py-3 text-right">{r.email || '–'}</td>
                  <td className="px-3 py-3 text-right">{r.leads || '–'}</td>
                  <td className="px-3 py-3 text-right font-medium">{r.sales || '–'}</td>
                  <td className="px-4 py-3 text-right">
                    {Object.keys(r.value).length === 0
                      ? '–'
                      : Object.keys(r.value).length === 1
                        ? formatMoney(Object.values(r.value)[0], Object.keys(r.value)[0], { compact: true })
                        : total != null
                          ? `≈ ${formatMoney(roundApprox(total), 'USD', { compact: true })}`
                          : Object.entries(r.value)
                              .map(([c, v]) => formatMoney(v, c, { compact: true }))
                              .join(', ')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">
        Taps are counted when a visitor presses the button; the call or message itself happens on their phone. Record a sale in{' '}
        <Link href="/admin/content/sales/new" className="underline underline-offset-4">
          Sales → New
        </Link>{' '}
        when it completes.
      </p>
    </div>
  )
}
