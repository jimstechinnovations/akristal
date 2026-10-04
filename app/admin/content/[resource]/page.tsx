import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { getResource } from '@/lib/admin/resources'
import { listRecords } from '@/lib/admin/load'
import { formatDate, formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { buttonClasses } from '@/components/ui/button'
import { fieldClasses } from '@/components/ui/input'

type PageProps = { params: Promise<{ resource: string }>; searchParams: Promise<{ q?: string; status?: string; page?: string }> }

const STATUS_TONE: Record<string, string> = {
  new: 'bg-primary text-on-primary',
  pending: 'bg-accent/30 text-ink',
  pending_approval: 'bg-accent/30 text-ink',
  approved: 'bg-success/15 text-success',
  active: 'bg-success/15 text-success',
  available: 'bg-success/15 text-success',
  accepted: 'bg-success/15 text-success',
  rejected: 'bg-error/10 text-error',
  declined: 'bg-error/10 text-error',
  spam: 'bg-error/10 text-error',
}

function Cell({ value, format, currency }: { value: unknown; format?: string; currency?: unknown }) {
  if (format === 'image') {
    const src = Array.isArray(value) ? (value[0] as string | undefined) : (value as string | null)
    return (
      <span className="relative block size-12 overflow-hidden rounded-sm bg-page-alt">
        {src && !/\.(mp4|webm|mov)/i.test(src) ? <Image src={src} alt="" fill sizes="48px" className="object-cover" /> : null}
      </span>
    )
  }
  if (format === 'boolean') return <span className={value ? 'text-success' : 'text-muted'}>{value ? 'Yes' : 'No'}</span>
  if (format === 'date') return <span className="tabular whitespace-nowrap">{value ? formatDate(String(value), 'short') : ''}</span>
  if (format === 'money') return <span className="tabular">{value != null ? formatMoney(Number(value), String(currency ?? 'RWF')) : 'On request'}</span>
  if (format === 'stars') return <span className="tabular">{'★'.repeat(Number(value) || 0)}</span>
  if (format === 'status' && value)
    return <span className={cn('whitespace-nowrap rounded-sm px-2 py-0.5 text-xs capitalize', STATUS_TONE[String(value)] ?? 'bg-page-alt')}>{String(value).replace(/_/g, ' ')}</span>
  return <span className="line-clamp-2">{value == null ? '' : String(value)}</span>
}

export default async function ResourceListPage({ params, searchParams }: PageProps) {
  const { resource: key } = await params
  const resource = getResource(key)
  if (!resource) notFound()
  if (resource.settingKey) redirect(`/admin/content/${key}/${resource.settingKey}`)
  const sp = await searchParams
  const { rows, count, page, pageSize, error } = await listRecords(resource, { q: sp.q, status: sp.status, page: Number(sp.page) || 1 })
  const statusField = resource.fields.find((f) => f.name === 'status' && f.type === 'select')
  const statusOptions = statusField && statusField.type === 'select' ? statusField.options ?? [] : []
  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries({ q: sp.q, status: sp.status, ...extra })) if (v) p.set(k, v)
    const s = p.toString()
    return `/admin/content/${key}${s ? `?${s}` : ''}`
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-display-s font-medium">{resource.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{resource.description}</p>
        </div>
        {resource.canCreate && (
          <Link href={`/admin/content/${key}/new`} className={buttonClasses()}>
            <Plus className="size-4" /> New {resource.singular}
          </Link>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <form method="get" className="relative w-full max-w-xs">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={sp.q} placeholder="Search" aria-label={`Search ${resource.title.toLowerCase()}`} className={cn(fieldClasses, 'h-10 pl-9 text-sm')} />
        </form>
        {statusOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {[{ value: '', label: 'All' }, ...statusOptions].map((o) => (
              <Link
                key={o.value}
                href={qs({ status: o.value || undefined, page: undefined })}
                aria-current={(sp.status ?? '') === o.value ? 'page' : undefined}
                className="inline-flex h-9 items-center rounded-sm border border-line px-3 text-sm aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-on-primary"
              >
                {o.label.replace(/ \(.*\)$/, '')}
              </Link>
            ))}
          </div>
        )}
        <span className="tabular ml-auto text-sm text-muted">{count} total</span>
      </div>

      {error && <p className="mt-6 rounded-sm bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-page-alt text-muted">
            <tr>
              {resource.listColumns.map((c) => (
                <th key={c.name} className={cn('px-4 py-3 font-normal', c.format === 'image' && 'w-16')}>
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row.id)} className="border-t border-line hover:bg-page-alt/60">
                {resource.listColumns.map((c) => (
                  <td key={c.name} className="px-4 py-3 align-middle">
                    <Cell value={row[c.name]} format={c.format} currency={row.currency} />
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/content/${key}/${row.id}`} className="font-medium underline underline-offset-4">
                    {resource.canCreate || resource.fields.some((f) => !f.readOnly) ? 'Edit' : 'Open'}
                  </Link>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={resource.listColumns.length + 1} className="px-4 py-12 text-center text-muted">
                  {sp.q || sp.status ? 'Nothing matches this search.' : resource.canCreate ? `No ${resource.title.toLowerCase()} yet. Create the first one.` : 'Nothing here yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {count > pageSize && (
        <div className="mt-4 flex justify-between text-sm">
          {page > 1 ? <Link href={qs({ page: String(page - 1) })} className="underline">Previous</Link> : <span />}
          <span className="text-muted">
            Page {page} of {Math.ceil(count / pageSize)}
          </span>
          {page * pageSize < count ? <Link href={qs({ page: String(page + 1) })} className="underline">Next</Link> : <span />}
        </div>
      )}
    </div>
  )
}
