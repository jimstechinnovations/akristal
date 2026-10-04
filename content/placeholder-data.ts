// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER CONTENT: every record here is a stand-in until the client
// supplies the real thing (see PLAN.md §12). The site prefers database rows and
// only falls back to these. Each record carries `placeholder: true`, and pages
// show a visible "sample" note wherever one is displayed.
// ─────────────────────────────────────────────────────────────────────────────

import type { InstallmentPlan } from '@/lib/data/plans'
import { images } from '@/content/images'

/** Interior design portfolio: SAMPLE images showing the style until Akristal's own projects are added. */
export const placeholderInteriorProjects = [
  { slug: 'warm-living-room', title: 'Warm family living room', location: 'Kigali', spaceType: 'residential' as const, services: ['Interior design', 'Furniture', 'Lighting'], cover: images.interiorsLivingWarm, gallery: [images.interiorsLivingWarm, images.interiorsDining] },
  { slug: 'timber-kitchen', title: 'Timber kitchen and island', location: 'Kigali', spaceType: 'residential' as const, services: ['Kitchen design', 'Joinery'], cover: images.interiorsKitchenWood, gallery: [images.interiorsKitchenWood, images.interiorsKitchenBright] },
  { slug: 'quiet-bedroom', title: 'Main bedroom suite', location: 'Abuja', spaceType: 'residential' as const, services: ['Interior design', 'Furniture'], cover: images.interiorsBedroomDark, gallery: [images.interiorsBedroomDark, images.interiorsBedroomLight] },
  { slug: 'arched-lounge', title: 'Lounge with arched windows', location: 'Kigali', spaceType: 'hospitality' as const, services: ['Styling', 'Furniture'], cover: images.interiorsLivingArches, gallery: [images.interiorsLivingArches] },
  { slug: 'garden-kitchen', title: 'Kitchen opening to the garden', location: 'Kigali', spaceType: 'residential' as const, services: ['Kitchen design'], cover: images.interiorsKitchenBright, gallery: [images.interiorsKitchenBright] },
  { slug: 'timber-living', title: 'Short-let apartment living area', location: 'Kigali', spaceType: 'hospitality' as const, services: ['Turnkey furnishing'], cover: images.interiorsLivingWood, gallery: [images.interiorsLivingWood] },
]

/** Furniture catalogue: SAMPLE items until Akristal publishes its own. No prices are invented: all "price on request". */
export const placeholderFurniture = [
  { id: 'ph-sofa-velvet', name: 'Velvet three-seater sofa', category: 'living' as const, image: images.furnitureSofaVelvet, dimensions: 'W 210 × D 90 × H 80 cm', materials: ['Velvet', 'Solid wood legs'], colours: ['Bottle green', 'Rust', 'Charcoal'], madeToOrder: true },
  { id: 'ph-sofa-leather', name: 'Tufted leather sofa', category: 'living' as const, image: images.furnitureSofaLeather, dimensions: 'W 200 × D 95 × H 78 cm', materials: ['Leather', 'Hardwood frame'], colours: ['Tan', 'Chocolate'], madeToOrder: true },
  { id: 'ph-boucle-chair', name: 'Rounded bouclé armchair', category: 'living' as const, image: images.furnitureSofaBoucle, dimensions: 'W 85 × D 80 × H 72 cm', materials: ['Bouclé fabric'], colours: ['Cream'], madeToOrder: false },
  { id: 'ph-amber-chair', name: 'Mid-century lounge chair', category: 'living' as const, image: images.furnitureArmchairAmber, dimensions: 'W 70 × D 78 × H 80 cm', materials: ['Fabric', 'Oak frame'], colours: ['Amber', 'Olive'], madeToOrder: false },
  { id: 'ph-wing-chair', name: 'Wingback reading chair', category: 'living' as const, image: images.furnitureArmchairWing, dimensions: 'W 80 × D 85 × H 105 cm', materials: ['Woven fabric'], colours: ['Mustard', 'Grey'], madeToOrder: true },
  { id: 'ph-dining-set', name: 'Six-seat dining set', category: 'dining' as const, image: images.furnitureDiningSet, dimensions: 'Table L 180 × W 90 cm', materials: ['Solid timber', 'Black-painted chairs'], colours: ['Natural', 'Black'], madeToOrder: true },
  { id: 'ph-rattan-chairs', name: 'Rattan dining chair', category: 'dining' as const, image: images.furnitureDiningRattan, dimensions: 'W 52 × D 55 × H 80 cm', materials: ['Rattan', 'Timber'], colours: ['Natural'], madeToOrder: false },
  { id: 'ph-bed', name: 'Timber bed with upholstered headboard', category: 'bedroom' as const, image: images.furnitureBed, dimensions: 'King, 180 × 200 cm', materials: ['Solid timber', 'Linen'], colours: ['Walnut', 'Natural'], madeToOrder: true },
  { id: 'ph-dresser', name: 'Six-drawer chest', category: 'bedroom' as const, image: images.furnitureDresser, dimensions: 'W 140 × D 45 × H 80 cm', materials: ['Teak veneer'], colours: ['Teak'], madeToOrder: false },
  { id: 'ph-sideboard', name: 'Mid-century sideboard', category: 'living' as const, image: images.furnitureSideboard, dimensions: 'W 160 × D 45 × H 75 cm', materials: ['Walnut veneer'], colours: ['Walnut'], madeToOrder: false },
  { id: 'ph-side-table', name: 'Round side table and pouf', category: 'decor' as const, image: images.furnitureSideTable, dimensions: 'Ø 45 × H 50 cm', materials: ['Timber', 'Leather'], colours: ['Natural', 'Cognac'], madeToOrder: false },
  { id: 'ph-copper-pendant', name: 'Copper dome pendant', category: 'lighting' as const, image: images.furniturePendantCopper, dimensions: 'Ø 30 cm', materials: ['Spun copper'], colours: ['Copper'], madeToOrder: false },
  { id: 'ph-timber-pendant', name: 'Slatted timber pendant', category: 'lighting' as const, image: images.furniturePendantTimber, dimensions: 'Ø 25 × H 45 cm', materials: ['Timber slats'], colours: ['Natural'], madeToOrder: true },
]

/** Pay Small Small: terms to be confirmed by Akristal (deposit, tenures, any premium). */
export const placeholderPlan: InstallmentPlan = {
  id: 'placeholder-standard',
  name: 'Pay Small Small',
  description: 'Pay a deposit, then spread the balance in equal monthly instalments, paid directly to Akristal.',
  minDepositPct: 30,
  tenures: [6, 12, 18, 24],
  premiumByTenure: { '6': 0, '12': 0, '18': 0, '24': 0 },
  eligibility: [
    'Valid national ID or passport',
    'Proof of income or a guarantor',
    'Signed sale agreement for an eligible home',
  ],
  termsUrl: null,
  placeholder: true,
}

/** Become an agent: commission model. SAMPLE FIGURES until Akristal confirms its agent agreement. */
export const agentProgramme = {
  placeholder: true,
  /** Typical commission charged on a sale, % of price */
  commissionPct: 3,
  tiers: [
    { name: 'Associate agent', share: 50, requirement: 'Your first year with Akristal' },
    { name: 'Senior agent', share: 60, requirement: 'Ten or more completed sales' },
    { name: 'Partner agent', share: 70, requirement: 'By invitation, for top performers' },
  ],
  faqs: [
    {
      q: 'Do I need a licence to apply?',
      a: 'Tell us what registration you hold in your country. Where a licence is required by law, you must hold it before you list homes with us.',
    },
    {
      q: 'Can I work part-time?',
      a: 'Yes. You are paid on completed sales, so you can start part-time and grow from there.',
    },
    {
      q: 'Which areas do you need agents in?',
      a: 'Kigali first, then Abuja and Lagos. We also take applications for Dubai, Kampala and South Africa.',
    },
    {
      q: 'Will I sell Akristal’s own developments?',
      a: 'Yes. Agents sell our developments alongside homes listed by private owners.',
    },
    {
      q: 'How long does the application take?',
      a: 'The form takes about five minutes. Our team reviews each application and contacts shortlisted applicants for an interview.',
    },
  ],
}
