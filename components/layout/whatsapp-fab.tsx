'use client'

import { usePathname } from 'next/navigation'
import { MessageCircle, Phone } from 'lucide-react'
import { whatsappLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

// Dashboards and auth screens don't need a floating chat button.
const HIDDEN_PREFIXES = ['/admin', '/agent/', '/buyer', '/seller', '/messages', '/login', '/register', '/verify-otp']

export function WhatsAppFab({ number, message, label }: { number?: string; message: string; label: string }) {
  const pathname = usePathname() ?? '/'
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null
  // Property pages have their own WhatsApp action in the mobile sticky bar.
  const onProperty = /^\/properties\/[^/]+$/.test(pathname)

  return (
    <a
      href={whatsappLink(message, number || undefined)}
      aria-label={label}
      className={cn(
        'ak-heartbeat fixed bottom-4 right-4 z-40 size-14 items-center justify-center rounded-full bg-[#1f9d55] text-white sm:bottom-6 sm:right-6',
        onProperty ? 'hidden lg:inline-flex' : 'inline-flex'
      )}
    >
      {/* Speech bubble with a handset: reads as WhatsApp without reproducing its logo. */}
      <span aria-hidden className="relative inline-flex size-7 items-center justify-center">
        <MessageCircle className="absolute size-7" strokeWidth={2} />
        <Phone className="relative size-3 fill-current" strokeWidth={2.5} />
      </span>
    </a>
  )
}
