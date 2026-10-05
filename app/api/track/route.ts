import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createPublicClient } from '@/lib/supabase/public'

// Records one WhatsApp, call or email tap on a broker or agent. Sent with navigator.sendBeacon,
// so the visitor is never kept waiting; failures are logged and otherwise ignored.
const schema = z
  .object({
    agentId: z.string().uuid().optional(),
    brokerId: z.string().uuid().optional(),
    propertyId: z.string().uuid().optional(),
    channel: z.enum(['whatsapp', 'call', 'email']),
    path: z.string().max(300).optional(),
  })
  .refine((v) => v.agentId || v.brokerId, 'agentId or brokerId is required')

export async function POST(request: Request) {
  let body: unknown
  try {
    body = JSON.parse(await request.text())
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

  const { agentId, brokerId, propertyId, channel, path } = parsed.data
  const { error } = await createPublicClient()
    .from('contact_events')
    .insert({ agent_id: agentId ?? null, broker_id: brokerId ?? null, property_id: propertyId ?? null, channel, source_path: path ?? null })
  if (error) console.error('Contact click not recorded', error.message)
  return NextResponse.json({ ok: !error })
}
