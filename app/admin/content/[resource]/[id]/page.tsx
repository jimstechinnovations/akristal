import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getResource } from '@/lib/admin/resources'
import { agentOptions, getRecord } from '@/lib/admin/load'
import { RecordForm } from '@/components/admin/record-form'

type PageProps = { params: Promise<{ resource: string; id: string }> }

/** Edit an existing record, create a new one (id = "new"), or edit a settings document (id = its key). */
export default async function ResourceRecordPage({ params }: PageProps) {
  const { resource: key, id } = await params
  const resource = getResource(key)
  if (!resource) notFound()
  const isNew = id === 'new'
  if (isNew && !resource.canCreate) notFound()

  const [record, agents] = await Promise.all([isNew ? Promise.resolve<Record<string, unknown>>({}) : getRecord(resource, id), agentOptions()])
  if (!record) notFound()

  // Sensible starting values for new records.
  const initial: Record<string, unknown> = isNew
    ? Object.fromEntries(
        resource.fields.map((f) => [
          f.name,
          f.type === 'boolean' ? ['is_published', 'is_active'].includes(f.name) : f.type === 'select' && f.required ? f.options?.[0]?.value ?? '' : undefined,
        ])
      )
    : record
  const listHref = resource.settingKey ? '/admin' : `/admin/content/${key}`
  const viewHref = !isNew && resource.viewHref ? resource.viewHref(record) : null
  const title = resource.settingKey
    ? resource.title
    : isNew
      ? `New ${resource.singular}`
      : String(record.name ?? record.title ?? record.full_name ?? record.author_name ?? resource.singular)

  return (
    <div>
      <Link href={listHref} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> {resource.settingKey ? 'Overview' : resource.title}
      </Link>
      <h1 className="mt-2 font-display text-display-s font-medium">{title}</h1>
      <p className="mb-6 mt-1 max-w-2xl text-sm text-muted">{resource.description}</p>
      <RecordForm resourceKey={key} id={isNew || resource.settingKey ? null : id} initial={initial} agentOptions={agents} viewHref={viewHref} listHref={listHref} />
    </div>
  )
}
