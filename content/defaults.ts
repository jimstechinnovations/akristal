// Built-in defaults for settings the admin can change in Admin → Site settings.
// The database row wins; these only fill gaps so pages always render.

export type AgentTier = { name: string; share: number; requirement: string }
export type Faq = { q: string; a: string }

export type SiteSettings = {
  home: { heroTitle: string; tagline: string; heroImageUrl: string; heroImageAlt: string }
  agent_programme: { commissionPct: number; tiers: AgentTier[]; faqs: Faq[] }
}

export const defaultSettings: SiteSettings = {
  home: {
    heroTitle: 'Kigali & beyond',
    tagline: 'Homes we build, furnish and hand over',
    heroImageUrl: '/images/hero/kigali-aerial.webp',
    heroImageAlt: 'Aerial view of a green park and wetlands in Kigali with the city on the hills behind',
  },
  agent_programme: {
    commissionPct: 3,
    tiers: [
      { name: 'Associate agent', share: 50, requirement: 'Your first year with Akristal' },
      { name: 'Senior agent', share: 60, requirement: 'Ten or more completed sales' },
      { name: 'Partner agent', share: 70, requirement: 'By invitation, for top performers' },
    ],
    faqs: [],
  },
}
