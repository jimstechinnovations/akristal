// Built-in defaults for settings the admin can change in Admin → Settings.
// The database row wins; these only fill gaps so pages always render.

export type AgentTier = { name: string; share: number; requirement: string }
export type Faq = { q: string; a: string }

/** Where a home-page figure comes from. "manual" uses the number typed in the admin. */
export type StatSource = 'developments' | 'sold' | 'available' | 'countries' | 'manual'
export type HomeStat = { label: string; source?: StatSource; value?: number | null; suffix?: string }

export type Office = { region: string; label: string; address: string; phones: string }
export type HeaderPhone = { label: string; number: string }

export type SiteSettings = {
  home: {
    heroTitle: string
    tagline: string
    heroImageUrl: string
    heroImageAlt: string
    tickerItems: string[]
    stats: HomeStat[]
    googleRating: number | null
    googleReviewCount: number | null
    googleReviewsUrl: string
  }
  agent_programme: { commissionPct: number; tiers: AgentTier[]; faqs: Faq[] }
  contact: { email: string; whatsapp: string; headerPhones: HeaderPhone[]; offices: Office[] }
}

export const defaultSettings: SiteSettings = {
  home: {
    heroTitle: 'Africa & beyond',
    tagline: 'We build, furnish and hand over',
    heroImageUrl: '/images/hero/kigali-aerial.webp',
    heroImageAlt: 'Aerial view of a green park and wetlands in Kigali with the city on the hills behind',
    tickerItems: [],
    stats: [
      { label: 'Akristal and partner development projects', source: 'developments' },
      { label: 'Properties sold', source: 'sold' },
      { label: 'Properties for sale and for rent', source: 'available' },
      { label: 'Countries where we sell and let properties globally', source: 'countries' },
    ],
    googleRating: null,
    googleReviewCount: null,
    googleReviewsUrl: '',
  },
  agent_programme: {
    commissionPct: 10,
    tiers: [
      { name: 'Associate agent', share: 40, requirement: 'Your first sales with Akristal' },
      { name: 'Senior agent', share: 50, requirement: 'Ten or more completed sales' },
      { name: 'Partner agent', share: 60, requirement: 'By invitation, for top performers' },
    ],
    faqs: [],
  },
  contact: {
    email: 'info@akristal.com',
    whatsapp: '250734994909',
    headerPhones: [{ label: 'Rwanda', number: '+250 791 900 316' }],
    offices: [{ region: 'Rwanda', label: 'Head office, East Africa', address: 'KK 15 Rd, Kigali, Rwanda', phones: '+250 791 900 316' }],
  },
}

/** An office's phone numbers are typed one per line (or separated by commas) in the admin. */
export const splitPhones = (phones: string) =>
  phones
    .split(/[\n,]/)
    .map((p) => p.trim())
    .filter(Boolean)

/** "+250 791 900 316" → "tel:+250791900316" */
export const telHref = (number: string) => `tel:${number.replace(/[^\d+]/g, '')}`
