'use client'

import dynamic from 'next/dynamic'
import { CalendarCheck, MessageCircle, Phone, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { MapListing } from '@/components/search/leaflet-map'
import { Button } from '@/components/ui/button'
import { SaveButton } from './save-button'

const LeafletMap = dynamic(() => import('@/components/search/leaflet-map'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-page-alt" aria-label="Loading map" />,
})

export function LocationMap({ listing }: { listing: MapListing }) {
  return (
    <div>
      <div className="h-80 overflow-hidden rounded-md border border-line">
        <LeafletMap listings={[listing]} />
      </div>
      {listing.approximate && (
        <p className="mt-2 text-sm text-muted">The pin shows the neighbourhood. Your broker or agent shares the exact address before a viewing.</p>
      )}
    </div>
  )
}

export function ShareAndSave({ id, title }: { id: string; title: string }) {
  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title, url })
      else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied')
      }
    } catch {
      // Share sheet dismissed: nothing to do.
    }
  }
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={share}>
        <Share2 aria-hidden className="size-4" /> Share
      </Button>
      <SaveButton id={id} title={title} className="size-9 border border-line-strong bg-transparent text-ink hover:bg-page-alt" />
    </div>
  )
}

/** Phones: the three actions people want, always in reach. */
export function StickyActions({ phoneHref, whatsappHref }: { phoneHref: string; whatsappHref: string }) {
  const cell = 'flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium'
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-line bg-page/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
      <a href={phoneHref} className={cell}>
        <Phone aria-hidden className="size-5" /> Call
      </a>
      <a href={whatsappHref} className={`${cell} text-[#1f6f4a] dark:text-[#7fbf9f]`}>
        <MessageCircle aria-hidden className="size-5" /> WhatsApp
      </a>
      <a href="#book-viewing" className={`${cell} bg-primary text-on-primary`}>
        <CalendarCheck aria-hidden className="size-5" /> Book a viewing
      </a>
    </div>
  )
}
