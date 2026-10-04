# Akristal — Phase 2 Plan

Status: **approved 2026-10-04 with the changes in §0.** Read with `AUDIT.md`.

## 0. Decisions from review (2026-10-04)

| Item | Decision | Where it changes the plan |
| --- | --- | --- |
| Dark mode | **Keep it** on the public site and dashboards | §3.2 dark tokens; every page is screenshot-reviewed in both themes |
| Motion library | **Add Framer Motion** | §2, §3.6. The motion budget itself is unchanged (one hero moment + responsive motion) |
| Backend | **Use real Supabase tables** for leads, reviews, agent applications, agent/project fields, furniture, interior portfolio, plans, lenders | §9. Additive migrations only (`ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`); no drops or renames |
| `WGU_Clinical_Schedule_old.docx` | Delete | Already gone from `public/partners/` (it was never tracked in git) |
| Hero | Follow the Sand Piper reference the client resent: centred place-name headline in large serif capitals, tracked tagline, centred search with Map search / Rentals, and a bottom rail of quick filters with Home valuation | §6 Home. This is the one place display capitals are used |

---

## 1. Decisions resolved from the brief (`[[FILL]]` fields)

| Field | Decision | Why |
| --- | --- | --- |
| LuzonPrime folder | `luzonprime` | Present in the parent folder; treated as read-only |
| Market | **Rwanda first (Kigali HQ), with Nigeria (Abuja, Lagos), UAE (Dubai), Uganda (Kampala) and South Africa as secondary markets** | The live listings, the phone lines and the project locations all say so |
| Currency | **Each listing and project keeps its own currency** (RWF, NGN, USD, ZAR…), formatted with `Intl.NumberFormat`. Standalone calculators default to **RWF** with a currency selector. No automatic FX conversion (see Q2) | One site currency would misprice most of the inventory |
| Copy voice | A premium Kigali developer-agency: plain, confident, specific to places (Nyarutarama, Kiyovu, Maitama), no hype | Section 6 of the brief |

## 2. Stack decision

**Keep** Next.js 16 + Tailwind v4 + Supabase + Leaflet + react-hook-form/zod. Nothing in the brief is blocked by this stack.

| Change | Reason |
| --- | --- |
| Upgrade `next` 16.0.10 → current 16.x patch, aligned `eslint-config-next` | LuzonPrime runs 16.2.x; picks up fixes. Tested before commit |
| Add `vitest` (dev) | The calculators must be unit-tested pure functions |
| Add `@playwright/test` (dev) | Screenshot review at 360/390/768/1024/1280/1440 after each page, plus smoke tests |
| **Add `framer-motion`** (decision §0) | Hero entrance, the lightbox, filter sheet, menu sheet, tab and calculator transitions. Imported only in client components that animate; `MotionConfig reducedMotion="user"` at the root |
| Remove `zustand` if unused after refactor | Favourites move to a small context + `localStorage` |
| Replace the 5 MB logo | Optimised SVG/PNG set from the client's vector. Interim: a 512px PNG export of the badge and a lightweight text wordmark |

Admin, auth, dashboards, messaging and payments **stay as they are** functionally. They get the new tokens (colours/type) in a light-touch pass at the end, not a redesign.

---

## 3. Brand direction

### 3.1 Subject, audience, job
- **Subject:** a Kigali developer that builds its own estates, brokers homes across Africa and the Gulf, and finishes them with interiors and furniture.
- **Audience:** Rwandan and Nigerian professionals, diaspora buyers browsing on phones, and investors.
- **Primary job of the site:** make Akristal's own developments the first thing people see, then let people find a home, see what it costs per month, and reach a person on WhatsApp in one tap.

### 3.2 Palette (from the logo, not from LuzonPrime)

| Name | Hex | Role |
| --- | --- | --- |
| **Oxblood** | `#3F1712` | Brand. Primary buttons, the "Built by Akristal" band, footer. Taken from the badge disc |
| Oxblood 600 | `#5C231B` | Hover/active on Oxblood |
| **Brass** | `#B8924A` | The one accent: the star mark, fine rules and focus rings **on dark surfaces only** (5.4:1 on Oxblood; 2.9:1 on white, so never text on light) |
| **Ink** | `#1F1B19` | Text (17:1 on white) |
| Stone | `#66605B` | Secondary text (6.2:1 on white, 5.4:1 on Mist) |
| **Mist** | `#EDEFEC` | Alternate section background: a cool hill-mist grey, deliberately *not* cream |
| Line | `#D9DAD5` | Borders, dividers |
| White | `#FFFFFF` | Page |

Status colours (never used decoratively): success Hill `#2E5A45` (7.9:1), error `#B3261E` (6.5:1, always with an icon and text so it can't be confused with Oxblood).

**Dark mode (kept, decision §0):** a warm basalt night palette, not navy and not pure black. In dark mode the primary button becomes Brass with Ink text, because an Oxblood button disappears on a dark page. The Oxblood band stays Oxblood.

| Dark role | Hex | Contrast |
| --- | --- | --- |
| Page | `#14100E` | — |
| Alternate section | `#1C1714` | — |
| Surface (cards, sheets) | `#221C19` | — |
| Line | `#3B332E` | — |
| Text | `#F1EDE8` | 16.2:1 on page |
| Muted text | `#ABA29B` | 7.5:1 on page, 6.7:1 on surface |
| Accent / primary button | Brass `#C9A35C`, text `#1F1B19` | 8.0:1 on page; 7.2:1 for button text |
| Error / success | `#F2867E` / `#7FBF9F` | 7.6:1 / 8.9:1 |

The theme follows the system setting by default, with a toggle in the header and mobile menu (existing `ThemeProvider`, `.dark` class).

### 3.3 Typography
- **Display: Cormorant Garamond** (500/600), used only at ≥28px for the hero, section titles and project names. It has the high-contrast, engraved elegance of the Sand Piper reference without being Playfair (LuzonPrime's face).
- **Text and UI: Instrument Sans** (400/500/600), for body, navigation, forms, prices and tables. It's slightly narrow, so prices and facts fit on phone cards. Tabular figures (`font-variant-numeric: tabular-nums`) for prices and schedules. *Verify tnum support in the first build step; fallback is Inter Tight.*
- Rules:
  - No ALL-CAPS labels, except the one tracked tagline under the hero headline.
  - No single-word colour or italic accents in headlines.
  - Sentence case everywhere.
  - Body line length ≤ 70ch.

### 3.4 How it differs from LuzonPrime

| | LuzonPrime | Akristal |
| --- | --- | --- |
| Colour | Navy `#091F46` + gold `#C9A84C`, white/black | **Oxblood + Brass, Ink on White/Mist.** No navy anywhere |
| Faces | Playfair Display + Plus Jakarta Sans | **Cormorant Garamond + Instrument Sans** |
| Shape | Pills (`rounded-full`) and `rounded-2xl` cards | **Rectangular:** 4px controls, 6px cards, 0px editorial photos; chips are 4px, not pills |
| Section skeleton | Eyebrow + bar + serif title on every section | Serif title only; a label appears only where it carries information (e.g. "Off-plan · 62% built") |
| Motion | Fade-up on every block, parallax, page fades, marquees | One orchestrated hero entrance; everything else moves only in response to the user |
| Signature | Hero awards panel | **The Oxblood "Built by Akristal" band** directly under the hero (§3.5) |
| Search | Inline select bar on the hero | Sand Piper-style centred box: **Buy/Rent toggle**, area search, **Map search**, plus a quick-filter rail with **Home valuation** |

### 3.5 The one memorable thing
**"Built by Akristal"** is a full-width Oxblood band immediately after the hero. It shows the company's own developments as large editorial photographs, each with:
- its stage (Off-plan / Under construction / Completed)
- a construction-progress rule drawn in Brass
- location, starting price and the Pay Small Small availability

It's visually unlike the white marketplace listings below it, which answers the client's "our own job will be the first thing people see" literally. Everything else on the site stays quiet: white, Ink and photography.

### 3.6 Motion budget
- **One page-load moment:** the hero headline, tagline and search rise 12px and fade in, staggered over about 600ms.
- The hero image is a static poster (the LCP element). Optional muted video loads after idle on desktop/Wi-Fi only, with a visible pause control.
- On-scroll reveals only for the projects band and image grids, at 250ms and 8px. The brief allows fade/slide on scroll. I'm using it on 2 places, not every section, because blanket fade-ups read as generated.
- Responsive motion (welcome): the gallery lightbox, filter drawer, Buy/Rent toggle, calculator results updating, and the favourite heart.
- `prefers-reduced-motion`: all of the above become instant.

### 3.7 Photography
- Real Akristal sites first: drone at golden hour over Kigali's hills, construction progress, finished interiors.
- No stock "handshake/keys" photos.
- People only in agent headshots: consistent neutral background, shoulders up, natural light.
- Interiors shot level, wide, with daylight.
- One hero image per page, ≥2400px, delivered as AVIF/WebP via `next/image`.

### 3.8 Voice: examples (original copy, to be refined with the client)
- Hero headline options: **"Homes built for the hills."** / **"We build it. We furnish it. We hand you the keys."** Tagline: "Kigali · Abuja · Lagos · Dubai".
- Section titles: "Built by Akristal", "Homes listed with our agents", "What it costs each month", "Pay Small Small", "Talk to an agent who knows the street".
- Empty state: "No homes match these filters. Widen the price range or clear the area to see more."
- Avoid: "Welcome to…", "Unlock your dream home", "world-class", invented numbers.

---

## 4. Design tokens (in `app/globals.css` → Tailwind `@theme`)

```
Colour roles   --c-brand #3F1712  --c-brand-hover #5C231B  --c-accent #B8924A
               --c-ink #1F1B19  --c-muted #66605B  --c-bg #FFFFFF  --c-bg-alt #EDEFEC
               --c-line #D9DAD5  --c-success #2E5A45  --c-error #B3261E
               --c-on-brand #FFFFFF  --c-scrim rgba(20,12,10,.55)

Type scale     display-xl  clamp(2.75rem, 5.5vw + 1rem, 5.5rem) / 1.0   Cormorant 500, -0.01em
(fluid)        display-l   clamp(2.25rem, 3.5vw + 1rem, 3.75rem) / 1.05 Cormorant 500
               h2          clamp(1.875rem, 2vw + 1rem, 2.75rem) / 1.1   Cormorant 600
               h3          1.25rem / 1.3   Instrument 600
               body-l      1.125rem / 1.6  Instrument 400
               body        1rem / 1.6      Instrument 400   (inputs ≥16px on mobile)
               small       0.875rem / 1.5
               caption     0.75rem / 1.4   (never all-caps)
               price       Instrument 600, tabular-nums

Spacing (4px)  1=4 2=8 3=12 4=16 6=24 8=32 12=48 16=64 24=96 32=128
               section-y: 64 mobile / 96 desktop · gutter: 16 / 24 (md) / 40 (xl)

Layout         container 1280; wide 1440 (galleries, map); prose 70ch
               grid 4 cols (<768) / 8 (768–1023) / 12 (≥1024), gap 16/24

Radii          none 0 (editorial photos) · sm 4 (buttons, inputs, chips) · md 6 (cards) · lg 10 (dialogs, sheets)

Elevation      0: borders only (cards) · 1: 0 8px 24px rgba(31,27,25,.12) (popovers, sticky bars, sheets)
               No shadow on resting cards; hover = image scale 1.03 + title underline, not a shadow lift

Motion         fast 150ms · base 250ms · slow 400ms · hero 600ms · ease cubic-bezier(.2,.7,.2,1)

Breakpoints    360 · 390 · 768 · 1024 · 1280 · 1440

Icons          lucide-react only, 1.5 stroke, 16/20/24
Focus          2px ring: Ink on light, Brass on dark, 2px offset — always visible
```

---

## 5. Sitemap

Existing URLs are kept where they're indexed (`/properties`, `/projects`).

```
/                         Home
/properties               Search: grid ↔ map, filters, sort, pagination (absorbs /properties/map)
/properties/[id]          Property detail
/projects                 Built by Akristal: all developments
/projects/[id]            Development detail (updates, offers, events already in DB)
/agents                   Agent directory
/agents/[slug]            Agent profile
/join                     Become an Akristal Agent
/mortgage                 Mortgage: how it works, calculators, pre-qualification, lenders
/pay-small-small          Installment plans
/interior-design          Services, portfolio, process, consultation
/furniture                Catalogue + product dialog + WhatsApp order
/sell                     Home valuation / List with us
/about  /contact  /privacy  /terms  /support (FAQ)
not-found                 404
(unchanged) /login /register /dashboard /admin/* /agent/* /buyer/* /seller/* /messages /payments …
```

Retired or merged: `/services` → its content goes into About and Home; `/members` → the team on About (301 redirects for both).

Navigation, desktop: **Buy · Rent · Built by Akristal · Agents · Finance ▾** (Mortgage, Pay Small Small) · **Interiors ▾** (Interior design, Furniture) · **Sell**, plus a phone link and WhatsApp on the right. Mobile: logo, WhatsApp icon and menu. The menu is a full-height sheet with the same groups and contact at the bottom.

---

## 6. Page-by-page sections

### Home
```
Mobile (390)                          Desktop (1440)
┌──────────────────────┐              ┌───────────────────────────────────────────┐
│ logo        ☎  ≡     │              │ logo   Buy Rent Built… Agents Finance…  ☎ │
│                      │              │                                           │
│  [aerial poster]     │              │        HOMES BUILT FOR THE HILLS          │
│  Homes built         │              │        Kigali · Abuja · Lagos · Dubai     │
│  for the hills       │              │   ┌─[Buy|Rent]──────────────────[Search]┐ │
│  [Buy|Rent]          │              │   └─ Map search ──────── Rentals ───────┘ │
│  [Area or address  ] │              │                                           │
│  [ Search          ] │              │ By area ▾  Luxury ▾  Type ▾  Price ▾   What's my home worth? │
│  Map search · Rentals│              └───────────────────────────────────────────┘
├──────────────────────┤              ┌──── OXBLOOD ──────────────────────────────┐
│▓ Built by Akristal  ▓│              │ Built by Akristal                          │
│▓ [lead project img] ▓│              │ [ lead project, 7 cols ] [ 2nd ] [ 3rd ]   │
│▓ Off-plan ━━━━━━─ 62%▓│              │  stage · progress ━━━━━── · from RWF …     │
│▓ ‹ swipe › 2 more   ▓│              └────────────────────────────────────────────┘
└──────────────────────┘
```
1. **Hero:** full-bleed poster, serif headline, tagline, centred search (Buy/Rent toggle, area/address with suggestions from DB cities and districts), *Map search* and *Rentals* links. A quick-filter rail along the bottom (desktop) or under the search (mobile): **By area** (grouped by city), **Luxury** (price bands per currency), **Property type**, **Price**. *What's my home worth?* links to `/sell`.
2. **Built by Akristal** (Oxblood band): 1 lead + 2 developments, stage, progress, from-price, "Pay Small Small available" flag, link to all.
3. **Homes listed with our agents:** 6 featured listings. Grid on desktop, horizontal snap scroll on mobile. Labelled clearly as marketplace listings.
4. **Browse by city:** Kigali, Abuja, Lagos, Dubai… photo tiles with live counts.
5. **Interiors and furniture:** two large photo halves, each with one line and one link.
6. **Finance:** Mortgage and Pay Small Small side by side. Each has a one-line live example ("A RWF 120m home from RWF 1.9m/month*"), with *Estimate* labelled.
7. **Agents:** 4–6 top agents with rating, area and WhatsApp.
8. **Sell with Akristal:** valuation CTA with a short 3-field start (address, type, phone) that continues on `/sell`.
9. **Testimonials and trust:** 3 real quotes, registration numbers (RDB / CAC) and **real** figures only.
10. **Footer:** offices per region (Rwanda / Nigeria / South Africa) with phone, WhatsApp, email, address; socials; legal links.

Sitewide: a WhatsApp button, placed so it never covers content. It sits above the sticky action bar on property pages.

### Listings / search (`/properties`)
- **Mobile:** a sticky bar with Search, *Filters (n)* (opens a bottom sheet) and a *Map/List* toggle. **Desktop:** a filter row of chips with popovers (For sale/For rent · Type · Price · Beds · Baths · Area · More); split view with list left and map right (Leaflet, price pins, clustering).
- Sort: Newest, Price ↑, Price ↓, Largest.
- Pagination: 12 per page, URL-driven so it's shareable and works with the back button.
- **Currency filter:** price filters apply within one chosen currency (Q2).
- Favourite heart on each card. Saved to `localStorage` for guests, and to `property_favorites` when logged in. A "Saved" count appears in the header.
- States: loading skeletons, empty ("widen your filters" + clear button), error with retry.

### Property detail (`/properties/[id]`)
- Gallery: 1 large + 4 thumbnails, "Show all n photos" opens a keyboard-navigable lightbox (`<dialog>`, swipe on touch). Video and virtual tour tabs when present.
- Header: price (in its own currency), title, address, beds/baths/m²/parking, status chip, share and save.
- Key facts table, description (with "Read more"), amenities checklist.
- Location map (Leaflet, approximate pin), nearby areas.
- **Cost calculator**, pre-filled with the price and currency. Tabs: **Mortgage** (deposit, rate, term → monthly, total interest) and **Pay Small Small** (deposit %, tenure → monthly, schedule). Both labelled *Estimate*.
- Assigned agent card: photo, rating, Call / WhatsApp (message pre-filled with the listing title and link) / Email.
- **Book a viewing** form: date, time window, name, phone, message.
- Similar properties: same city, similar price band.
- Mobile: a sticky bottom bar with Call · WhatsApp · Book viewing.
- JSON-LD: `RealEstateListing` + `Offer` + `BreadcrumbList`. Per-listing OG image.

### Agents directory (`/agents`)
- Search by name, filters for area / specialty (Sales, Rentals, Luxury, Off-plan, Commercial, Land) / language, sort by rating or listings.
- Card: headshot, name, title, areas, ★ average (n reviews), active listing count, WhatsApp.

### Agent profile (`/agents/[slug]`)
- Split hero (SERHANT model): portrait | name, title, licence/registration, areas served, languages, Call / WhatsApp / Email, socials, *Contact agent*.
- Counts row: **For sale (n) · For rent (n) · Sold (n) · ★ 4.8 (23)**.
- Tabs **For sale / For rent / Sold** with that agent's listings (Sold as a compact table: address, type, price, date).
- Bio, with an optional video.
- **Reviews:** average with a star distribution, a paginated list, and a *Write a review* form (rating, name, contact, text). On submit the user sees "Thanks, your review will appear after moderation"; it's stored as `pending`.
- Contact form. JSON-LD `RealEstateAgent` + `AggregateRating` (approved reviews only).

### Become an Akristal Agent (`/join`)
Following the Redfin model, sections in order:
1. Why Akristal: the stability and support story.
2. How you earn: a plain example of the commission split and how it rises with tenure. Figures come from the client (Q7), with an "illustrative" label.
3. What we cover: leads, listings from Akristal's own projects, marketing, training, CRM.
4. Who we're looking for: requirements.
5. How to join: 4 real sequential steps (apply → interview → onboarding → first listing).
6. FAQ: an accordion.
7. Application form: name, phone/WhatsApp, email, city/area, years of experience, specialties, languages, licence/ID upload (a placeholder field until storage policy is agreed), CV link, consent.

### Mortgage (`/mortgage`)
1. How it works: 4 sequential steps (check affordability → pre-qualify → choose a home → bank approval and handover).
2. **Mortgage calculator** (Redfin model):
   - Inputs: price + slider, deposit as amount and % (linked), interest rate, term in years, currency.
   - Results: monthly payment, total interest, total cost, a stacked bar of principal vs interest.
   - Collapsible amortisation table, yearly with monthly detail.
3. **Affordability calculator:** monthly income, other monthly debts, deposit available, rate, term → indicative maximum price, using a configurable debt-to-income cap.
4. Pre-qualification enquiry form.
5. Partner lenders: placeholder cards with *no real bank names or logos* until the client confirms partnerships (Q6).
6. Link across to Pay Small Small. All numbers are labelled **Estimate: not a loan offer**.

### Pay Small Small (`/pay-small-small`)
- Product explanation in plain words: Akristal's own installment plan, available on selected Akristal developments and listings.
- **Calculator:** price, initial deposit % (min set in config), tenure in months (from plan options), optional plan premium % if the client uses one (Q5) → deposit amount, monthly instalment, total payable, and a **payment schedule table** (month, date, amount, balance).
- Eligibility, terms (in plain language, plus a link to full terms), and an **Apply for Pay Small Small** form (pre-filled with the property when coming from a listing).
- Linked from Mortgage, the home page, every property page and every project page.

### Interior Design (`/interior-design`)
- Services: residential, commercial, turnkey furnishing, consultations.
- Portfolio: a filterable grid with project pages. A before/after slider where pairs exist (keyboard-operable range input).
- Process: 5 real steps (brief → concept → design and budget → execution → handover).
- Book a consultation form: space type, location, budget band, preferred date.

### Furniture (`/furniture`)
- Category chips (Living, Dining, Bedroom, Office, Outdoor, Décor).
- Product cards: image, name, price or "Price on request", made-to-order badge.
- Product detail dialog: gallery, dimensions, materials, lead time, colourways.
- **Order on WhatsApp**: opens `wa.me` with the item name, SKU, colour and quantity pre-filled. An enquiry form is the alternative.

### Sell / Home valuation (`/sell`)
Why list with Akristal, the process steps, and a valuation form (address, type, size, beds, condition, photos later, contact).

### About · Contact · Legal · 404
- **About:** story, mission, the team (from `members`), offices, registrations, real milestones.
- **Contact:** offices per region, map, form, WhatsApp, hours.
- **Privacy and Terms:** rewritten for the new forms, cookies and WhatsApp use. The client's lawyer should review them.
- **404:** search box plus links to Buy, Rent and Built by Akristal.

---

## 7. Component inventory

```
components/
  layout/      SiteHeader, MobileMenuSheet, SiteFooter, WhatsAppFab, SkipLink, Breadcrumbs
  ui/          Button (primary|secondary|ghost|link; sizes; loading), IconButton, Input, Textarea,
               Select, Combobox (area search), SegmentedToggle (Buy/Rent), Checkbox, RadioGroup,
               RangeSlider, MoneyInput (currency-aware), Chip, Badge, Tabs, Accordion, Dialog,
               Sheet (bottom drawer), Popover, Tooltip, Skeleton, EmptyState, ErrorState,
               Pagination, StarRating (display + input), Toast (keep react-hot-toast, restyled)
  media/       ResponsiveImage, Gallery, Lightbox, BeforeAfter, VideoHero (poster-first, pausable)
  search/      HeroSearch, QuickFilterRail, FilterBar, FilterSheet, SortSelect, MapView (Leaflet,
               dynamic import), ListingsGrid, SaveSearch (later)
  listings/    PropertyCard, PropertyFacts, AmenityList, LocationMap, StickyActionBar,
               ViewingForm, SimilarProperties, FavouriteButton
  projects/    ProjectFeature (Oxblood band item), ProjectCard, StageProgress, ProjectTimeline
  agents/      AgentCard, AgentHero, AgentCounts, AgentListingsTabs, SoldTable, ReviewSummary,
               ReviewList, ReviewForm
  finance/     MortgageCalculator, AffordabilityCalculator, AmortisationTable,
               InstallmentCalculator, PaymentSchedule, EstimateNote, LenderCard
  interiors/   ServiceList, PortfolioGrid, ProcessSteps, ConsultationForm
  furniture/   CategoryChips, ProductCard, ProductDialog, WhatsAppOrderButton
  forms/       FormShell (validation, submitting, success, error), LeadForm presets
  seo/         JsonLd
lib/
  finance/     mortgage.ts, affordability.ts, installment.ts (pure) + *.test.ts
  format.ts    formatMoney(amount, currency), formatArea, plural
  whatsapp.ts  buildWhatsAppLink(number, message)
  data/        listings.ts, projects.ts, agents.ts, reviews.ts, furniture.ts, interiors.ts, site.ts
config/
  site.ts      contacts, offices, socials, WhatsApp numbers, form endpoints, finance defaults
content/
  placeholder-data.ts   ← every placeholder record, each flagged `placeholder: true`
```

Every interactive component ships hover, focus-visible, active, disabled, loading, empty and error states. Each of these gets a check in the screenshot review.

---

## 8. Data model

Listings and projects already live in Supabase. New entities are typed in `types/` and served through `lib/data/*`:
- **Supabase first.** Where a table and rows exist, they're the source.
- **Placeholder fallback.** Otherwise the records come from `content/placeholder-data.ts`, each flagged `placeholder: true`.

Swapping in a CMS later only touches `lib/data/*`.

```ts
Money        { amount: number; currency: 'RWF'|'NGN'|'USD'|'ZAR'|'AED'|'UGX' }

Listing      (existing `properties`) + slug, is_featured, agent_id (exists), listing_type,
             district/city/country, lat/lng, amenities[], features[], media
Project      (existing `projects`) + slug, location{city,district,country}, stage
             'off_plan'|'under_construction'|'completed', progress_pct, completion_date,
             cover_image_url, unit_types[{type,beds,size_sqm,price:Money}],
             pay_small_small_plan_id?, brochure_url  (+ existing updates/offers/events)
Agent        (existing `profiles` role=agent) + slug, title, areas_served[], specialties[],
             languages[], whatsapp, socials{instagram,linkedin,facebook,tiktok},
             years_experience, licence_or_registration, is_featured
AgentReview  { id, agent_id, author_name, author_contact, rating 1–5, body,
               status 'pending'|'approved'|'rejected', created_at, moderated_by? }
AgentApplication { id, full_name, phone, email, city, area, years_experience,
               specialties[], languages[], id_document_path?, cv_url?, status, created_at }
Lead         (existing `inquiries`) + type 'viewing'|'valuation'|'prequalification'|
             'pay_small_small'|'consultation'|'furniture'|'contact', payload jsonb
InstallmentPlan { id, name, min_deposit_pct, tenures_months[], premium_pct_by_tenure{},
               eligibility[], terms_url, applies_to 'all'|'projects'|ids[] }
Lender       { id, name, logo_url?, countries[], rate_from?, max_term_years?,
               max_ltv_pct?, placeholder: boolean }
FurnitureItem { id, sku, name, category, images[], price?: Money, price_on_request,
               dimensions, materials[], colours[], lead_time_days, made_to_order }
InteriorProject { id, slug, title, location, type, services[], cover, images[],
               before_after[{before,after,caption}], summary }
Testimonial  { id, name, context (e.g. "Bought in Kibagabaga, 2025"), quote, consent: true }
SiteStats    { years_operating, units_delivered, … } ← client-supplied real numbers only
```

---

## 9. Backend: what needs it, and the interim

Supabase is already in production and you've authorised Supabase operations. **Decision §0: real tables, not interim mailto links.** Migrations will be numbered files in `supabase/migrations/`, reviewed in a PR-style diff, and applied only after this plan is approved.

| Feature | Recommended | Interim if migrations are deferred |
| --- | --- | --- |
| Lead forms (viewing, valuation, contact, consultation, pre-qual, Pay Small Small, furniture) | Insert into `inquiries` (extended type + `payload`) via server action; email via existing Zoho SMTP | Same server action → email only |
| Agent applications | New `agent_applications` table + private storage bucket for ID upload | Email + "send ID on WhatsApp" note; upload field disabled |
| Agent reviews | New `agent_reviews` table, insert-only for public, RLS: public reads `approved` only; moderation in admin | Form → email to moderator; reviews shown from data file |
| Saved homes | `localStorage` for guests; existing `property_favorites` when logged in, merged on login | `localStorage` only |
| Agent profile fields | `ALTER profiles` add slug, areas, languages, specialties, socials, whatsapp, title | Data file keyed by profile id |
| Projects extras | `ALTER projects` add slug, stage, progress, location, cover, unit types | Data file keyed by project id |
| Furniture / interior portfolio / plans / lenders | New tables + admin CRUD in a later phase | `content/placeholder-data.ts` (this is the brief's default) |

Every form posts through one config entry (`config/site.ts → forms.endpoint`), so a different provider can be swapped in without touching components. WhatsApp deep links are always offered alongside forms.

**Moderation UI:** the build includes a minimal admin page for pending reviews and agent applications (approve/reject). Full admin CRUD for furniture and portfolio is out of scope for this pass unless you want it (Q12).

---

## 10. Build order, verification and testing

1. Tokens, fonts, layout shell (header, footer, mobile menu, WhatsApp button), logo replacement, removal of `achievements.ts` inflation, `next` upgrade, vitest and Playwright set-up.
2. Home → Listings → Property detail → Agents + profile → Join → Mortgage + Pay Small Small → Interior Design → Furniture → Sell, About, Contact, Legal, 404 → dashboard token pass.
3. After each page: screenshots at 360/390/768/1024/1280/1440 reviewed against the quality bar, fixes made, then a commit (one commit per page).
4. Calculators: unit tests (known amortisation values, zero-rate edge case, rounding to currency minor units, schedule sums equal the total).
5. Final: `tsc`, `eslint`, `vitest`, `next build`, Lighthouse (mobile) on Home, Listings, Property, Agent and Mortgage, targeting ≥90 in all four categories. Then `HANDOVER.md`.

Known risks:
- **Lighthouse ≥90 Performance on the home page depends on the hero asset.** A poster-first image is fine; autoplay video on mobile would not be, so video is desktop-only.
- **Leaflet is ~40 KB gz**, so it loads only when the map is opened.

---

## 11. Plan review against generic defaults (frontend-design check)

| First instinct | Problem | Revised to |
| --- | --- | --- |
| Warm cream background + serif + terracotta accent | The commonest generated-site look | Cool **Mist** grey and white; accent is **Brass from the logo**, on dark surfaces only |
| Navy + gold "premium" | It's LuzonPrime, and Akristal's current palette | **Oxblood** from the badge as the brand colour |
| Eyebrow label above every section heading | Template chrome | Titles only; labels only where they carry data |
| Fade-up on every section | Reads as generated | One hero entrance + reveals on two places only |
| 01/02/03 markers everywhere | Only true for sequences | Used only for real step flows (Mortgage, Join, Interior process) |
| Big-stat banner ("389+ listings") | Default treatment, and the current numbers are invented | Removed; real registrations and delivered units in the trust strip |

---

## 12. Open questions for the client

1. **Markets:** confirm Rwanda-first with Nigeria, UAE, Uganda and South Africa listed. Should Akristal's own projects outside Rwanda (e.g. Life Camp, Abuja) appear in "Built by Akristal"?
2. **Currency:** show each listing in its own currency only, or also an approximate RWF/USD equivalent? (Approximate FX needs a rate source and a disclaimer.)
3. **Logo:** please send the original vector files. Is the round badge the main logo, or is there a horizontal wordmark?
4. **Hero:** do you have drone footage or photos of your own sites (Le Centurium City, Pearl View Cyeru)? Which development should lead?
5. **Pay Small Small:** minimum deposit %, available tenures (e.g. 6/12/18/24 months), any price premium or interest per tenure, eligibility, documents, what happens on a missed payment, and which properties it applies to.
6. **Mortgage:** which banks do you actually work with (names and logos with permission)? What typical rates and maximum terms should the calculator default to, per country?
7. **Agents:** list of agents with photos, bios, areas, languages. For "Become an Agent": commission split, any base pay, what Akristal covers, and the requirements (licence? RDB registration? experience?).
8. **Reviews:** who moderates agent reviews, and how fast?
9. **Furniture:** catalogue (photos, names, dimensions, prices or price on request), delivery areas, made-to-order lead times, and which WhatsApp number takes orders.
10. **Interior design:** portfolio photos (before/after where possible), services, and how fees are quoted.
11. **Dark mode:** OK to drop it from the public site? The search bar currently mentions "cars, businesses". Are those still offered, or should the site be property-only?
12. **Admin:** should we build admin screens for furniture, portfolio and plans now, or edit those via data files and the Supabase dashboard for the first release?
13. **Real figures for trust signals:** years operating, units delivered, registrations (RDB/CAC). The inflated counter will be removed.
14. **Languages:** English only, or Kinyarwanda and/or French as well?
15. **Housekeeping:** OK to delete `public/partners/WGU_Clinical_Schedule_old.docx` (a personal document in a public folder)? Do you have permission to display the partner logos (Elijah Osianor & Co., FYLS Global, VoltWhales)?
