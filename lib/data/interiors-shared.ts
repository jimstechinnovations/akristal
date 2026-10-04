// Types and constants shared by server data loaders and client components (no server-only imports).

export type Img = { src: string; width?: number; height?: number; alt: string }

export type InteriorProject = {
  slug: string
  title: string
  location: string | null
  spaceType: 'residential' | 'commercial' | 'hospitality' | null
  services: string[]
  cover: Img
  gallery: Img[]
  beforeAfter: { before: string; after: string; caption?: string }[]
  summary: string | null
}

export const FURNITURE_CATEGORIES = [
  { value: 'living', label: 'Living room' },
  { value: 'dining', label: 'Dining' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'office', label: 'Office' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'decor', label: 'Decor' },
] as const
export type FurnitureCategory = (typeof FURNITURE_CATEGORIES)[number]['value']

export type FurnitureItem = {
  id: string
  sku: string | null
  name: string
  category: FurnitureCategory
  description: string | null
  images: Img[]
  price: { amount: number; currency: string } | null
  dimensions: string | null
  materials: string[]
  colours: string[]
  leadTimeDays: number | null
  madeToOrder: boolean
}
