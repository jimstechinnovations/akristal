'use client'

import type { AnchorHTMLAttributes } from 'react'

type Target = { agentId?: string | null; brokerId?: string | null; propertyId?: string | null }

/** Fire-and-forget: tells the admin dashboard someone tapped to contact a broker or agent. */
export function trackContact(channel: 'whatsapp' | 'call' | 'email', target: Target) {
  if (!target.agentId && !target.brokerId) return
  const payload = JSON.stringify({
    agentId: target.agentId ?? undefined,
    brokerId: target.brokerId ?? undefined,
    propertyId: target.propertyId ?? undefined,
    channel,
    path: window.location.pathname,
  })
  try {
    if (navigator.sendBeacon?.('/api/track', new Blob([payload], { type: 'text/plain' }))) return
  } catch {
    // Fall through to fetch.
  }
  fetch('/api/track', { method: 'POST', body: payload, keepalive: true }).catch(() => undefined)
}

/** A normal link (WhatsApp, tel: or mailto:) that also records the tap. */
export function TrackedLink({
  channel,
  agentId,
  brokerId,
  propertyId,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & Target & { channel: 'whatsapp' | 'call' | 'email' }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackContact(channel, { agentId, brokerId, propertyId })
        onClick?.(e)
      }}
    />
  )
}
