import { Mail, MessageCircle, Phone, BadgeCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatMoney } from '@/lib/format'

type Row = { channel: 'whatsapp' | 'call' | 'email' }
type Sale = { sale_price: number | null; currency: string; status: string }

/** Rendered per request on the server, so "now" is the request time. */
function thirtyDaysAgo() {
  return new Date(Date.now() - 30 * 86_400_000).toISOString()
}

/**
 * Taps on WhatsApp, Call and Email for an agent or a broker company over the last 30 days,
 * plus the sales Akristal has recorded for them. Reads with the signed-in user's own access.
 */
export async function ContactStats({ agentId, brokerId }: { agentId?: string; brokerId?: string }) {
  // Loose client type: @supabase/ssr 0.5 and supabase-js 2.88 disagree on generics.
  const supabase = (await createClient()) as unknown as { from: (t: string) => any } // eslint-disable-line @typescript-eslint/no-explicit-any
  const since = thirtyDaysAgo()
  const column = agentId ? 'agent_id' : 'broker_id'
  const id = agentId ?? brokerId
  if (!id) return null
  const [{ data: events }, { data: sales }] = (await Promise.all([
    supabase.from('contact_events').select('channel').eq(column, id).gte('created_at', since).limit(10_000),
    supabase.from('agent_sales').select('sale_price, currency, status').eq(column, id).neq('status', 'cancelled'),
  ])) as [{ data: Row[] | null }, { data: Sale[] | null }]

  const count = (c: Row['channel']) => (events ?? []).filter((e) => e.channel === c).length
  const confirmed = (sales ?? []).filter((s) => s.status === 'confirmed')
  const byCurrency = confirmed.reduce<Record<string, number>>((acc, s) => {
    if (s.sale_price) acc[s.currency] = (acc[s.currency] ?? 0) + Number(s.sale_price)
    return acc
  }, {})

  const tiles = [
    { label: 'WhatsApp taps', value: count('whatsapp'), icon: MessageCircle },
    { label: 'Call taps', value: count('call'), icon: Phone },
    { label: 'Email taps', value: count('email'), icon: Mail },
    { label: 'Sales recorded', value: confirmed.length, icon: BadgeCheck },
  ]

  return (
    <section aria-labelledby="contact-stats-title" className="mb-6 rounded-md border border-line p-5">
      <h2 id="contact-stats-title" className="font-semibold">
        People who contacted you
      </h2>
      <p className="mt-1 text-sm text-muted">Taps on your WhatsApp, Call and Email buttons in the last 30 days, and every sale Akristal has recorded for you.</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-md bg-page-alt p-4">
            <dt className="flex items-center gap-1.5 text-sm text-muted">
              <Icon aria-hidden className="size-4" />
              {label}
            </dt>
            <dd className="tabular mt-1 text-3xl font-light">{value}</dd>
          </div>
        ))}
      </dl>
      {Object.keys(byCurrency).length > 0 && (
        <p className="tabular mt-3 text-sm text-muted">
          Sales value:{' '}
          {Object.entries(byCurrency)
            .map(([c, v]) => formatMoney(v, c))
            .join(', ')}
        </p>
      )}
    </section>
  )
}
