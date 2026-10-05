'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { deleteRecord, saveRecord } from '@/app/admin/cms-actions'
import { CURRENCIES, getResource, type Field, type Option, type SubField } from '@/lib/admin/resources'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { fieldClasses } from '@/components/ui/input'

type Values = Record<string, unknown>

const VIDEO = /\.(mp4|webm|mov|m4v)(\?|$)/i

/** Uploads to the public site-media bucket with the admin's own session (RLS checks the role). */
async function upload(file: File, folder: string): Promise<string> {
  const supabase = createClient()
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
  const path = `${folder}/${Date.now()}-${safe}`
  const { error } = await supabase.storage.from('site-media').upload(path, file, { cacheControl: '31536000', upsert: false })
  if (error) throw error
  return supabase.storage.from('site-media').getPublicUrl(path).data.publicUrl
}

function Thumb({ src, className }: { src: string; className?: string }) {
  if (VIDEO.test(src)) return <video src={`${src}#t=1`} muted preload="metadata" className={cn('size-full object-cover', className)} />
  return <Image src={src} alt="" fill sizes="160px" className={cn('object-cover', className)} />
}

function ImageInput({ value, onChange, folder, disabled }: { value: string; onChange: (v: string) => void; folder: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className="flex items-start gap-4">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-md border border-line bg-page-alt">{value ? <Thumb src={value} /> : null}</div>
      <div className="grid flex-1 gap-2">
        <input type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Upload, or paste an image link" className={cn(fieldClasses, 'h-10 text-sm')} disabled={disabled} />
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy || disabled} onClick={() => input.current?.click()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />} {value ? 'Replace' : 'Upload'}
          </Button>
          {value && !disabled && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
              Remove
            </Button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            setBusy(true)
            try {
              onChange(await upload(file, folder))
            } catch (err) {
              toast.error(`Upload failed: ${(err as Error).message}`)
            } finally {
              setBusy(false)
              e.target.value = ''
            }
          }}
        />
      </div>
    </div>
  )
}

function ImagesInput({ value, onChange, folder, accept, disabled }: { value: string[]; onChange: (v: string[]) => void; folder: string; accept?: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const move = (i: number, d: -1 | 1) => {
    const next = [...value]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }
  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {value.map((src, i) => (
            <li key={src + i} className="group relative aspect-square overflow-hidden rounded-md border border-line bg-page-alt">
              <Thumb src={src} />
              {i === 0 && <span className="absolute left-1 top-1 rounded-sm bg-black/70 px-1.5 text-[10px] text-white">Cover</span>}
              {!disabled && (
                <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                  <span className="flex gap-1">
                    <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-sm bg-white/90 p-1 text-[#1f1b19] disabled:opacity-40">
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button type="button" aria-label="Move later" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded-sm bg-white/90 p-1 text-[#1f1b19] disabled:opacity-40">
                      <ArrowDown className="size-3.5" />
                    </button>
                  </span>
                  <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-sm bg-white/90 p-1 text-error">
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {!disabled && (
        <>
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />} Add files
          </Button>
          <input
            ref={input}
            type="file"
            multiple
            accept={accept ?? 'image/*'}
            hidden
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? [])
              if (!files.length) return
              setBusy(true)
              try {
                const urls: string[] = []
                for (const f of files) urls.push(await upload(f, folder))
                onChange([...value, ...urls])
              } catch (err) {
                toast.error(`Upload failed: ${(err as Error).message}`)
              } finally {
                setBusy(false)
                e.target.value = ''
              }
            }}
          />
        </>
      )}
    </div>
  )
}

function TagsInput({ value, onChange, numeric, disabled }: { value: (string | number)[]; onChange: (v: (string | number)[]) => void; numeric?: boolean; disabled?: boolean }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const parts = draft.split(',').map((p) => p.trim()).filter(Boolean)
    if (!parts.length) return
    const items = numeric ? parts.map(Number).filter((n) => Number.isFinite(n)) : parts
    onChange([...value, ...items.filter((x) => !value.includes(x))])
    setDraft('')
  }
  return (
    <div className={cn(fieldClasses, 'flex h-auto min-h-11 flex-wrap items-center gap-1.5 py-1.5')}>
      {value.map((t) => (
        <span key={String(t)} className="inline-flex items-center gap-1 rounded-sm bg-page-alt px-2 py-1 text-sm">
          {t}
          {!disabled && (
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}>
              <X className="size-3.5" />
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          value={draft}
          inputMode={numeric ? 'numeric' : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add()
            } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1))
          }}
          onBlur={add}
          placeholder={value.length ? '' : 'Type and press Enter'}
          className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none"
        />
      )}
    </div>
  )
}

function KeyValueInput({ value, onChange, valueType, keyLabel, valueLabel, disabled }: { value: Record<string, unknown>; onChange: (v: Record<string, unknown>) => void; valueType: 'number' | 'text'; keyLabel: string; valueLabel: string; disabled?: boolean }) {
  const [rows, setRows] = useState<[string, string][]>(() => Object.entries(value ?? {}).map(([k, v]) => [k, String(v ?? '')]))
  const commit = (next: [string, string][]) => {
    setRows(next)
    onChange(Object.fromEntries(next.filter(([k]) => k.trim()).map(([k, v]) => [k.trim(), valueType === 'number' ? Number(v) || 0 : v])))
  }
  if (disabled) {
    return rows.length ? (
      <dl className="grid gap-1 rounded-md bg-page-alt p-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3">
            <dt className="w-40 shrink-0 text-muted">{k.replace(/_/g, ' ')}</dt>
            <dd className="whitespace-pre-line">{v}</dd>
          </div>
        ))}
      </dl>
    ) : (
      <p className="text-sm text-muted">None</p>
    )
  }
  return (
    <div className="grid gap-2">
      {rows.map(([k, v], i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input aria-label={keyLabel} value={k} placeholder={keyLabel} onChange={(e) => commit(rows.map((r, j) => (j === i ? [e.target.value, r[1]] : r)))} className={cn(fieldClasses, 'h-10 text-sm')} />
          <input aria-label={valueLabel} value={v} placeholder={valueLabel} inputMode={valueType === 'number' ? 'decimal' : undefined} onChange={(e) => commit(rows.map((r, j) => (j === i ? [r[0], e.target.value] : r)))} className={cn(fieldClasses, 'h-10 text-sm')} />
          <Button type="button" variant="ghost" size="sm" className="h-10" aria-label="Remove row" onClick={() => commit(rows.filter((_, j) => j !== i))}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => commit([...rows, ['', '']])}>
        <Plus className="size-4" /> Add {keyLabel.toLowerCase()}
      </Button>
    </div>
  )
}

function ListInput({ value, onChange, fields, itemLabel, folder }: { value: Record<string, unknown>[]; onChange: (v: Record<string, unknown>[]) => void; fields: SubField[]; itemLabel: string; folder: string }) {
  const set = (i: number, name: string, v: unknown) => onChange(value.map((row, j) => (j === i ? { ...row, [name]: v } : row)))
  return (
    <div className="grid gap-3">
      {value.map((row, i) => (
        <fieldset key={i} className="rounded-md border border-line p-4">
          <div className="mb-3 flex items-center justify-between">
            <legend className="text-sm font-medium capitalize">
              {itemLabel} {i + 1}
            </legend>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="sm" aria-label="Move up" disabled={i === 0} onClick={() => { const n = [...value]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n) }}>
                <ArrowUp className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.name} className={cn('grid gap-1.5 text-sm', (f.type === 'textarea' || f.type === 'image') && 'sm:col-span-2')}>
                {f.label}
                {f.type === 'image' ? (
                  <ImageInput value={String(row[f.name] ?? '')} onChange={(v) => set(i, f.name, v)} folder={folder} />
                ) : f.type === 'select' ? (
                  <select value={String(row[f.name] ?? '')} onChange={(e) => set(i, f.name, e.target.value)} className={cn(fieldClasses, 'h-10 text-sm')}>
                    <option value="">Choose…</option>
                    {(f.options ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea rows={3} value={String(row[f.name] ?? '')} placeholder={f.placeholder} onChange={(e) => set(i, f.name, e.target.value)} className={cn(fieldClasses, 'h-auto py-2 text-sm')} />
                ) : (
                  <input
                    value={String(row[f.name] ?? '')}
                    inputMode={f.type === 'number' ? 'decimal' : undefined}
                    placeholder={f.placeholder}
                    onChange={(e) => set(i, f.name, e.target.value)}
                    className={cn(fieldClasses, 'h-10 text-sm')}
                  />
                )}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => onChange([...value, {}])}>
        <Plus className="size-4" /> Add {itemLabel}
      </Button>
    </div>
  )
}

export function RecordForm({
  resourceKey,
  id,
  initial,
  agentOptions,
  brokerOptions = [],
  viewHref,
  listHref,
}: {
  resourceKey: string
  id: string | null
  initial: Values
  agentOptions: Option[]
  brokerOptions?: Option[]
  viewHref: string | null
  listHref: string
}) {
  const resource = getResource(resourceKey)!
  const router = useRouter()
  const [values, setValues] = useState<Values>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [deleting, startDelete] = useTransition()
  const set = (name: string, v: unknown) => setValues((prev) => ({ ...prev, [name]: v }))
  const folder = resource.key

  function optionsFor(f: Field): Option[] {
    if (f.type !== 'select') return []
    if (f.optionsFrom === 'agents') return [{ value: '', label: 'None' }, ...agentOptions]
    if (f.optionsFrom === 'brokers') return [{ value: '', label: 'None' }, ...brokerOptions]
    if (f.optionsFrom === 'currencies') return CURRENCIES
    return [...(f.required ? [] : [{ value: '', label: 'Not set' }]), ...(f.options ?? [])]
  }

  function control(f: Field) {
    const v = values[f.name]
    const ro = f.readOnly
    const common = { id: `fld-${f.name}`, 'aria-invalid': errors[f.name] ? true : undefined, disabled: ro }
    switch (f.type) {
      case 'textarea':
      case 'richtext':
        return <textarea {...common} rows={f.name === 'description' || f.name === 'bio' ? 8 : 4} value={String(v ?? '')} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} className={cn(fieldClasses, 'h-auto py-2.5 disabled:opacity-100 disabled:bg-page-alt')} />
      case 'number':
        return <input {...common} inputMode="decimal" value={v == null ? '' : String(v)} onChange={(e) => set(f.name, e.target.value)} className={cn(fieldClasses, 'disabled:bg-page-alt disabled:opacity-100')} />
      case 'boolean':
        return (
          <label className="inline-flex cursor-pointer items-center gap-3">
            <input type="checkbox" {...common} checked={!!v} onChange={(e) => set(f.name, e.target.checked)} className="peer sr-only" />
            <span className="relative h-6 w-11 rounded-full bg-line-strong transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2" />
            <span className="text-sm">{v ? 'Yes' : 'No'}</span>
          </label>
        )
      case 'select':
        return (
          <select {...common} value={String(v ?? '')} onChange={(e) => set(f.name, e.target.value)} className={cn(fieldClasses, 'disabled:bg-page-alt disabled:opacity-100')}>
            {optionsFor(f).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )
      case 'tags':
      case 'numberTags':
        return <TagsInput value={(v as (string | number)[]) ?? []} onChange={(n) => set(f.name, n)} numeric={f.type === 'numberTags'} disabled={ro} />
      case 'image':
        return <ImageInput value={String(v ?? '')} onChange={(n) => set(f.name, n)} folder={folder} disabled={ro} />
      case 'images':
        return <ImagesInput value={(v as string[]) ?? []} onChange={(n) => set(f.name, n)} folder={folder} accept={f.accept} disabled={ro} />
      case 'keyValue':
        return <KeyValueInput value={(v as Record<string, unknown>) ?? {}} onChange={(n) => set(f.name, n)} valueType={f.valueType} keyLabel={f.keyLabel} valueLabel={f.valueLabel} disabled={ro} />
      case 'list':
        return <ListInput value={(v as Record<string, unknown>[]) ?? []} onChange={(n) => set(f.name, n)} fields={f.fields} itemLabel={f.itemLabel} folder={folder} />
      default:
        return (
          <input
            {...common}
            type={f.type === 'url' ? 'url' : f.type === 'email' ? 'email' : f.type === 'date' ? 'date' : 'text'}
            value={String(v ?? '').slice(0, f.type === 'date' ? 10 : undefined)}
            placeholder={f.placeholder}
            onChange={(e) => set(f.name, e.target.value)}
            className={cn(fieldClasses, 'disabled:bg-page-alt disabled:opacity-100')}
          />
        )
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    start(async () => {
      const res = await saveRecord(resource.key, id, values)
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {})
        setFormError(res.error)
        toast.error(res.error)
        return
      }
      setErrors({})
      toast.success(`${resource.singular[0].toUpperCase()}${resource.singular.slice(1)} saved`)
      if (!id && !resource.settingKey) router.push(`/admin/content/${resource.key}/${res.id}`)
      else router.refresh()
    })
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6">
      <div className="grid gap-x-6 gap-y-5 rounded-md border border-line bg-surface p-5 sm:grid-cols-2 sm:p-6">
        {resource.fields.map((f) => (
          <div key={f.name} className={cn('grid content-start gap-1.5', !f.half && 'sm:col-span-2')}>
            <label htmlFor={`fld-${f.name}`} className="text-sm font-medium">
              {f.label}
              {f.required && !f.readOnly && <span className="text-error"> *</span>}
            </label>
            {control(f)}
            {errors[f.name] ? <p className="text-xs text-error">{errors[f.name]}</p> : f.help && <p className="text-xs text-muted">{f.help}</p>}
          </div>
        ))}
      </div>

      {formError && (
        <p role="alert" className="rounded-sm bg-error/10 px-3 py-2 text-sm text-error">
          {formError}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-page/95 px-4 py-3 backdrop-blur-sm sm:mx-0 sm:rounded-md sm:border">
        <Button type="submit" loading={pending}>
          {pending ? 'Saving…' : id || resource.settingKey ? 'Save changes' : `Create ${resource.singular}`}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push(listHref)}>
          {resource.settingKey ? 'Back' : 'Back to list'}
        </Button>
        {viewHref && (
          <a href={viewHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4">
            View on website <ExternalLink className="size-3.5" />
          </a>
        )}
        {id && resource.canDelete && (
          <Button
            type="button"
            variant="ghost"
            className="ml-auto text-error hover:bg-error/10"
            loading={deleting}
            onClick={() => {
              if (!confirm(`Delete this ${resource.singular}? This cannot be undone.`)) return
              startDelete(async () => {
                const res = await deleteRecord(resource.key, id)
                if (!res.ok) return void toast.error(res.error ?? 'Could not delete')
                toast.success('Deleted')
                router.push(listHref)
              })
            }}
          >
            <Trash2 className="size-4" /> Delete
          </Button>
        )}
      </div>
    </form>
  )
}
