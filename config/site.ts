import { CURRENCY_CODES } from './currencies'

// Single source for company details, navigation, form submission and finance defaults.
// Client-editable: change values here, not inside components.

export const site = {
  name: 'The Akristal Group',
  shortName: 'Akristal',
  legalName: 'The Akristal Group Limited',
  url: process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'https://akristal.com',
  description:
    'The Akristal Group builds, sells and furnishes homes across Africa and beyond. Browse Akristal developments, homes listed by Akristal Brokers & Agents, and Pay Small Small plans.',
  email: 'info@akristal.com',
  phone: { label: '+250 791 900 316', href: 'tel:+250791900316' },
  // Digits only, international format, no "+" (used for wa.me links).
  whatsapp: '250734994909',
  offices: [
    {
      region: 'Rwanda',
      label: 'Head office',
      address: 'KK 15 Rd, Kigali, Rwanda',
      phones: [
        { label: '+250 791 900 316', href: 'tel:+250791900316' },
        { label: '+250 788 357 819', href: 'tel:+250788357819' },
      ],
    },
    {
      region: 'Nigeria',
      label: 'West Africa',
      address: 'Abuja, Nigeria',
      phones: [{ label: '+234 813 238 3836', href: 'tel:+2348132383836' }],
    },
    {
      region: 'South Africa',
      label: 'Southern Africa',
      address: 'South Africa',
      phones: [{ label: '+27 67 684 6945', href: 'tel:+27676846945' }],
    },
  ],
  socials: [
    { name: 'Instagram', href: 'https://instagram.com/theakristalgroup' },
    { name: 'YouTube', href: 'https://www.youtube.com/@TheAkristalGroup' },
    { name: 'TikTok', href: 'https://tiktok.com/@akrystalgroupholdings' },
    { name: 'Facebook', href: 'https://facebook.com/theakristalgroup' },
    { name: 'X', href: 'https://twitter.com/TheAkristalGrup' },
    { name: 'Pinterest', href: 'https://pinterest.com/theakristalgroup' },
  ],
} as const

export type NavItem = { href: string; label: string; description?: string }
export type NavGroup = { label: string; items: NavItem[] }

// Desktop header shows `primaryNav`; the menu sheet shows every group.
export const primaryNav: NavItem[] = [
  { href: '/properties?listing_type=sale', label: 'Buy' },
  { href: '/properties?listing_type=rent', label: 'Rent' },
  { href: '/projects', label: 'Developments' },
  { href: '/agents', label: 'Brokers & Agents' },
]

export const menuGroups: NavGroup[] = [
  {
    label: 'Find a home',
    items: [
      { href: '/properties?listing_type=sale', label: 'Homes for sale' },
      { href: '/properties?listing_type=rent', label: 'Homes for rent' },
      { href: '/properties?view=map', label: 'Map search' },
      { href: '/projects', label: 'Developments' },
      { href: '/saved', label: 'Saved homes' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/mortgage', label: 'Mortgage' },
      { href: '/pay-small-small', label: 'Pay Small Small' },
    ],
  },
  {
    label: 'Interiors',
    items: [
      { href: '/interior-design', label: 'Interior design' },
      { href: '/furniture', label: 'Furniture' },
    ],
  },
  {
    label: 'Work with us',
    items: [
      { href: '/sell', label: 'Sell or value your home' },
      { href: '/agents', label: 'Find an agent' },
      { href: '/brokers', label: 'Find a broker' },
      { href: '/join', label: 'Become an Akristal agent' },
      { href: '/join/broker', label: 'Register a broker company' },
    ],
  },
  {
    label: 'Company',
    items: [
      { href: '/about', label: 'About' },
      { href: '/management', label: 'Management team' },
      { href: '/insights', label: 'Insights' },
      { href: '/contact', label: 'Contact' },
      { href: '/support', label: 'Help' },
    ],
  },
]

export const legalNav: NavItem[] = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
]

// Forms post to server actions by default. Set FORMS_WEBHOOK_URL to also forward
// every submission to an external endpoint (e.g. a CRM or Formspree).
export const forms = {
  webhookUrl: process.env.FORMS_WEBHOOK_URL ?? null,
  notifyEmail: process.env.BUSINESS_EMAIL ?? 'info@akristal.com',
}

/** Every currency a price can be listed or shown in (see config/currencies.ts). */
export const currencies: readonly string[] = CURRENCY_CODES

/** Currencies with their own calculator defaults; any other currency starts from the US dollar ones. */
export type CurrencyCode = 'RWF' | 'NGN' | 'USD' | 'ZAR' | 'AED' | 'UGX'

// Calculator defaults. These are illustrative estimates, not lender offers —
// confirm real figures with partner banks (PLAN.md Q6) and update here.
export const financeDefaults: Record<
  CurrencyCode,
  { rate: number; termYears: number; depositPct: number; samplePrice: number }
> = {
  RWF: { rate: 16, termYears: 20, depositPct: 20, samplePrice: 120_000_000 },
  NGN: { rate: 22, termYears: 15, depositPct: 30, samplePrice: 150_000_000 },
  USD: { rate: 6.5, termYears: 25, depositPct: 20, samplePrice: 350_000 },
  ZAR: { rate: 11.5, termYears: 20, depositPct: 10, samplePrice: 2_500_000 },
  AED: { rate: 4.5, termYears: 25, depositPct: 20, samplePrice: 1_500_000 },
  UGX: { rate: 17, termYears: 15, depositPct: 30, samplePrice: 400_000_000 },
}

// Share of gross monthly income that can go to housing debt in the affordability estimate.
export const affordabilityDebtToIncome = 0.35

// "Luxury" quick filter: minimum asking price per currency.
export const luxuryFrom: Record<CurrencyCode, number> = {
  RWF: 500_000_000,
  NGN: 1_000_000_000,
  USD: 500_000,
  ZAR: 10_000_000,
  AED: 2_000_000,
  UGX: 2_000_000_000,
}

// Hero "Price" menu. Each band searches within one currency.
export const priceBands: { currency: CurrencyCode; bands: { label: string; min?: number; max?: number }[] }[] = [
  {
    currency: 'RWF',
    bands: [
      { label: 'Under RWF 100M', max: 100_000_000 },
      { label: 'RWF 100M to 300M', min: 100_000_000, max: 300_000_000 },
      { label: 'Over RWF 300M', min: 300_000_000 },
    ],
  },
  {
    currency: 'USD',
    bands: [
      { label: 'Under USD 250k', max: 250_000 },
      { label: 'USD 250k to 750k', min: 250_000, max: 750_000 },
      { label: 'Over USD 750k', min: 750_000 },
    ],
  },
  {
    currency: 'NGN',
    bands: [
      { label: 'Under NGN 500M', max: 500_000_000 },
      { label: 'NGN 500M to 2B', min: 500_000_000, max: 2_000_000_000 },
      { label: 'Over NGN 2B', min: 2_000_000_000 },
    ],
  },
]
