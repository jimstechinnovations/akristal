'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getResource, type Field } from '@/lib/admin/resources'

export type SaveResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: Record<string, string> }

type Db = { from: (table: string) => any } // eslint-disable-line @typescript-eslint/no-explicit-any -- table names come from the resource config

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

/** Turns whatever the form sent into the value the database column expects. */
function coerce(field: Field, raw: unknown): unknown {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v))
  switch (field.type) {
    case 'number': {
      const s = str(raw)
      if (s === '') return null
      const n = Number(s.replace(/,/g, ''))
      return Number.isFinite(n) ? n : NaN
    }
    case 'boolean':
      return raw === true || raw === 'true' || raw === 'on'
    case 'tags':
      return Array.isArray(raw) ? raw.map(str).filter(Boolean) : []
    case 'numberTags':
      return Array.isArray(raw) ? raw.map((v) => Number(v)).filter((n) => Number.isFinite(n)).sort((a, b) => a - b) : []
    case 'images':
      return Array.isArray(raw) ? raw.map(str).filter(Boolean) : []
    case 'keyValue': {
      const out: Record<string, string | number> = {}
      for (const [k, v] of Object.entries((raw as Record<string, unknown>) ?? {})) {
        const key = k.trim()
        if (!key) continue
        out[key] = field.valueType === 'number' ? Number(v) || 0 : str(v)
      }
      return out
    }
    case 'list':
      return Array.isArray(raw)
        ? raw
            .map((item) => {
              const row: Record<string, unknown> = {}
              for (const sub of field.fields) {
                const v = (item as Record<string, unknown>)?.[sub.name]
                if (sub.type === 'number') {
                  const n = v === '' || v == null ? null : Number(v)
                  if (n != null && Number.isFinite(n)) row[sub.name] = n
                } else if (str(v)) row[sub.name] = str(v)
              }
              return row
            })
            .filter((row) => Object.keys(row).length > 0)
        : []
    default: {
      const s = str(raw)
      return s === '' ? null : s
    }
  }
}

function validate(fields: Field[], values: Record<string, unknown>) {
  const errors: Record<string, string> = {}
  const data: Record<string, unknown> = {}
  for (const f of fields) {
    if (f.readOnly) continue
    const v = coerce(f, values[f.name])
    if (f.type === 'number' && Number.isNaN(v)) errors[f.name] = 'Enter a number'
    else if (f.type === 'number' && typeof v === 'number' && ((f.min != null && v < f.min) || (f.max != null && v > f.max)))
      errors[f.name] = `Enter a number between ${f.min ?? '…'} and ${f.max ?? '…'}`
    else if (f.required && (v == null || v === '' || (Array.isArray(v) && v.length === 0))) errors[f.name] = `${f.label} is required`
    data[f.name] = v
  }
  return { errors, data }
}

function friendly(message: string) {
  if (/duplicate key.*slug/i.test(message)) return 'That web address is already used. Choose another.'
  if (/duplicate key/i.test(message)) return 'A record with the same unique value already exists.'
  if (/consent/i.test(message) || /check constraint/i.test(message)) return 'One of the values is not allowed. For testimonials, consent is required before publishing.'
  if (/row-level security/i.test(message)) return 'Your account is not allowed to make this change.'
  return message
}

export async function saveRecord(resourceKey: string, id: string | null, values: Record<string, unknown>): Promise<SaveResult> {
  const admin = await requireAdmin()
  const resource = getResource(resourceKey)
  if (!resource) return { ok: false, error: 'Unknown section.' }
  const { errors, data } = validate(resource.fields, values)
  if (Object.keys(errors).length) return { ok: false, error: 'Check the highlighted fields.', fieldErrors: errors }

  const db = (await createClient()) as unknown as Db

  if (resource.settingKey) {
    const { error } = await db
      .from('site_settings')
      .upsert({ key: resource.settingKey, value: data, updated_at: new Date().toISOString(), updated_by: admin.id })
    if (error) return { ok: false, error: friendly(error.message) }
    resource.revalidate.forEach((p) => revalidatePath(p))
    return { ok: true, id: resource.settingKey }
  }

  // Resource-specific rules.
  if (resource.key === 'agents' && !data.slug && typeof data.full_name === 'string' && id) data.slug = `${slugify(data.full_name)}-${id.slice(0, 6)}`
  if (resource.key === 'developments' && !data.slug && typeof data.name === 'string') data.slug = slugify(data.name)
  if (resource.key === 'reviews') {
    data.moderated_by = admin.id
    data.moderated_at = new Date().toISOString()
  }
  if (resource.key === 'furniture' && !data.currency) data.currency = 'RWF'

  let result
  if (id) {
    let query = db.from(resource.table).update(data).eq(resource.idColumn ?? 'id', id)
    for (const [k, v] of Object.entries(resource.filter ?? {})) query = query.eq(k, v)
    result = await query.select('id').single()
  } else {
    if (!resource.canCreate) return { ok: false, error: 'New records cannot be created here.' }
    const extra = resource.key === 'developments' ? { created_by: admin.id } : {}
    result = await db.from(resource.table).insert({ ...data, ...extra }).select('id').single()
  }
  if (result.error) return { ok: false, error: friendly(result.error.message) }

  resource.revalidate.forEach((p) => revalidatePath(p, 'layout'))
  return { ok: true, id: result.data.id as string }
}

export async function deleteRecord(resourceKey: string, id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const resource = getResource(resourceKey)
  if (!resource || !resource.canDelete) return { ok: false, error: 'This record cannot be deleted here.' }
  const db = (await createClient()) as unknown as Db
  const { error } = await db.from(resource.table).delete().eq(resource.idColumn ?? 'id', id)
  if (error) return { ok: false, error: friendly(error.message) }
  resource.revalidate.forEach((p) => revalidatePath(p, 'layout'))
  return { ok: true }
}
