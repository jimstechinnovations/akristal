'use client'

import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { whatsappLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

// Dashboards and auth screens don't need a floating chat button.
const HIDDEN_PREFIXES = ['/admin', '/agent/', '/buyer', '/seller', '/messages', '/login', '/register', '/verify-otp']

export function WhatsAppFab() {
  const pathname = usePathname() ?? '/'
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null
  // Property pages have a sticky action bar on mobile; sit above it.
  const raised = /^\/properties\/[^/]+$/.test(pathname)

  return (
    <a
      href={whatsappLink('Hello Akristal, I would like some help.')}
      aria-label="Chat with Akristal on WhatsApp"
      className={cn(
        'fixed right-4 z-40 inline-flex size-14 items-center justify-center rounded-full bg-[#1f6f4a] text-white shadow-pop transition-transform hover:scale-105 active:scale-95 sm:right-6',
        raised ? 'bottom-24 lg:bottom-6' : 'bottom-4 sm:bottom-6'
      )}
    >
      <MessageCircle aria-hidden className="size-6" />
    </a>
  )
}
