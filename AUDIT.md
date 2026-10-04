# Akristal — Phase 1 Audit

Date: 2026-10-04 · Branch: `redesign` · Scope: read-only review of `akristal`, `luzonprime`, the client's reference sites and the two articles the client sent.

Evidence: screenshots taken with Playwright at 390px and 1440px of akristal.com (live), luzonprime.com (live) and the reference sites. They are stored in the session scratchpad, not in this repo. Code checks were run on the `redesign` branch.

---

## 1. Facts this audit established

| Item | Finding |
| --- | --- |
| Client | The Akristal Group Limited — real estate development, brokerage, interior design, furniture |
| HQ | KK 15 Rd, Kigali, Rwanda. Phone lines for Rwanda (primary), Nigeria ("West Africa"), South Africa |
| Markets in live data | Kigali (RWF), Abuja: Maitama, Wuse 2 (NGN), Lagos: Victoria Island (NGN), Dubai (USD), Kampala (USD), South Africa (ZAR). Akristal's own projects are in Rwamagana and Kanzenze (Rwanda), plus a completed estate in Life Camp, Abuja |
| Currency | **Multi-currency per listing.** `properties.currency` defaults to `RWF`. A single site currency would be wrong; see PLAN §1 |
| Stack | Next.js 16.0.10 (App Router, Turbopack), React 19.2, Tailwind v4, Supabase (auth, Postgres, storage), Leaflet, react-hook-form + zod, zustand, nodemailer (Zoho SMTP) |
| Health | `tsc --noEmit` passes. `eslint .` passes with no output |
| Git | Repo exists (`origin` = github.com/jimstechinnovations/akristal). Was on `main` with a clean tree apart from one untracked file (see §2.6). Branch `redesign` created; nothing committed from that file |

---

## 2. Akristal — blunt assessment

### 2.1 What works (keep it)
- **A real backend already exists.** It has listings with an admin approval workflow (`listing_status`), roles (buyer/seller/agent/admin), favourites, messaging, inquiries, payments and team members. It also has **projects with updates, offers and events**, which is strong raw material for the "our own projects first" requirement.
- **The listings page already has the right building blocks:** a list/map toggle (Leaflet), filters for type, city, price, beds and baths, and 18 approved listings with real photography.
- Typed Supabase client, server actions, and clean type checking and linting.

### 2.2 Home page — looks amateur
- **No hero.** The page opens with a bare search input whose placeholder reads "Search properties, *cars, businesses*…". That confuses what the company does in the first second.
- Three white icon tiles ("Buy / Rent / Commercial") and a row of pills. This is template furniture with no photography and no brand.
- **"Featured Videos"** are black boxes with play buttons and no poster frames. On a phone this is the first content after the fold, and it shows black rectangles.
- **Akristal's own projects aren't on the home page as a distinct section.** They're mixed into "Featured Videos" with marketplace listings, which is the opposite of the client's request.
- "Our Services" uses equal cards with 80–120-word paragraphs and is unreadable at a glance. The images are hot-linked from a Strikingly CDN (`lib/services.ts`).
- **The "Track Record" numbers are fabricated.** `lib/achievements.ts` adds a fixed base plus a daily increment to the real counts (e.g. users = real + 850 + 3.2/day). This is a trust and legal risk for a property company and must go. Only real figures should appear.
- The CTA band ("Join thousands of satisfied customers…") is a navy-to-green gradient: generic copy on a generic treatment.

### 2.3 Brand and visual system
- **The logo is a 5 MB auto-traced SVG** (`public/Akristal-svg.svg`, 1920×1765, hundreds of traced paths). It is used as the favicon, the apple-touch icon and the navbar logo (6 references). On Rwandan and Nigerian mobile data that one file outweighs the rest of the page. The original vector is needed.
- **The logo and the UI disagree.** The logo is an oxblood badge with a gold script and a copper rim. The UI uses Tailwind default blues: `bg-blue-900` ×46, `bg-blue-100` ×35, a bright blue "Sign Up" button and a blue company name. The result looks like two brands.
- **The current palette nearly matches LuzonPrime.** Akristal's `--akristal-primary #0d233e` and `--akristal-secondary #c89b3c` are within a few shades of LuzonPrime's `#091f46` and `#c9a84c`. Shipping that would make the two sites look like reskins of each other.
- **No design tokens in use.** There are 244 hard-coded hex values in `app/` and `components/`, including `[#0d233e]` ×87 and `[#1e293b]` ×53. The CSS variables in `globals.css` are mostly unused.
- **One typeface (Inter), no display face.** Headings are bold Inter, so there's no editorial hierarchy. Section titles are 18–20px on mobile.
- Shadows on everything (`shadow-sm` + `hover:shadow-md` on every card) and a 1px border everywhere.

### 2.4 Inner pages
- **Projects** (`/projects`) is the client's priority content and it's the weakest page:
  - Cards have **no images**.
  - A stray **`0`** renders on three cards: a `{value && …}` bug with a numeric 0.
  - Title styles are inconsistent: ALL CAPS on one, sentence case on another, and a misspelling ("Akrystal").
  - Prices show a `$` symbol on a project stored in RWF/USD with no currency code.
- **Listings** (`/properties`): solid function but generic presentation.
  - Mixed currencies sit side by side (NGN 2.5bn next to $464k next to ZAR 3m) with no way to compare.
  - Titles are truncated mid-word. There's no favourite button on cards.
  - Every card says "For Sale" in identical blue chips.
  - The filters are a desktop sidebar; on mobile they stack above the results.
- **Property detail**: a gallery and contact block exist. Missing: mortgage and installment calculators, structured key facts, similar properties, agent card with WhatsApp, and viewing booking.
- **Missing entirely:** agent directory, agent profiles, agent reviews, Become an Agent, Mortgage, Pay Small Small, Interior Design, Furniture, Home valuation / List with us, and a 404 page (`app/not-found.tsx` doesn't exist).

### 2.5 Engineering, SEO, accessibility
- `components/navbar.tsx` is **999 lines**, and `app/page.tsx` is 578 lines with data shaping inline. Both are hard to change safely.
- SEO: one static `metadata` in the layout and 8 files with metadata in total. **No `sitemap.ts`, no `robots.ts`, no JSON-LD** (0 occurrences), and no Open Graph images.
- Accessibility: only 2 references to `focus-visible` or `prefers-reduced-motion` across `app/` and `components/`. There are 8 raw `<img>` tags (no responsive sizes, no lazy-loading discipline) and inline `<video>` elements with no poster.
- Images: `next.config.ts` only allows `**.supabase.co`, so hot-linked CDN images bypass optimisation.
- `reactStrictMode: false`, plus a console-patching inline script in the root layout to hide WebCrypto warnings. That's a workaround, not a fix.
- No tests of any kind.

### 2.6 Housekeeping risks
- `public/partners/WGU_Clinical_Schedule_old.docx` is a **personal document inside `public/`**, so it's publicly downloadable from the live domain if deployed. It's untracked in git; I did not commit it. Recommend deleting it from the server/deploy and the folder (owner to confirm).
- `.env.local` holds the Supabase service key, an access token, a Vercel token and SMTP credentials. It is correctly git-ignored (`.gitignore: .env*`) and not tracked. Keep it that way, and rotate any key that has ever been shared in chat or screenshots.

---

## 3. LuzonPrime — what makes it look professional (benchmark, read-only)

Studied from code and the live site only. Nothing in `luzonprime/` was modified, and its dev server wasn't started, because `next dev` rewrites `.next` and `next-env.d.ts`.

| Area | What LuzonPrime does well | Take for Akristal |
| --- | --- | --- |
| Tokens | Colour roles as CSS variables (`--color-primary/accent/bg/bg-muted/surface/border/text/text-muted/heading`) mapped into Tailwind `@theme inline`. Components reference roles, never hex values | **Adopt the method**, with a different palette |
| Type | Two families: Playfair Display (headings) + Plus Jakarta Sans (body) via `next/font`, `font-heading` utility | Adopt the two-family method with **different faces** |
| Hero | `min-h-[100svh]` full-bleed photo, two-direction dark scrim for legibility, slow 24s scale, text parallax, search overlaid | Adopt the scrim and `svh`. Skip parallax and constant zoom (motion budget) |
| Section rhythm | A reusable `SectionHeader` (eyebrow + serif title + description + "See all") gives every section the same skeleton | Adopt a header component, but **without** an eyebrow on every section |
| Cards | `PropertyCard`: 4:3 image, hover image scrub across gallery, favourite button, badges, price-first, icon row of beds/baths/m², `sizes` set correctly | Adopt the structure (price-first, `sizes`, favourite). Restyle |
| Motion | `AnimatedSection` / `AnimatedStagger` (Framer Motion), page fade in `template.tsx`, marquee with a reduced-motion override | Use far less. See PLAN §2.6 |
| A11y | Global `:focus-visible` ring, 16px inputs on mobile (prevents iOS zoom), reduced-motion override | Adopt as-is |
| SEO | `metadataBase`, title template, OG and Twitter, Organization + WebSite JSON-LD with SearchAction, `sitemap.ts`, `robots.ts`, per-listing OG image | Adopt all of it |
| Code organisation | `components/{home,listings,agents,shared,ui,layout}`, `lib/` utilities, typed `types/index.ts`, Supabase migrations numbered | Adopt this layout |
| Weak spots | Pills and rounded-2xl on everything, an eyebrow on every section, Framer fade-ups on every block, a very long home page (17 sections), no map search, a placeholder `₦` in the hero search | Avoid these |

---

## 4. Reference sites — patterns to learn (no assets, copy or code taken)

**Sand Piper Realty** (the client's visual reference)
- Full-bleed aerial video hero with a pause control. The place name is the headline, in large serif caps, with a small tracked tagline.
- A centred search box ("Search by address or town") sits directly below, with **Map Search** and **Search Rentals** as two secondary actions attached under it.
- A bottom rail of quick filters (By Town, Luxury, Property Type) as dropdowns of curated links. **Home Valuation** sits on the right of the same rail.
- Then: Featured Properties (with List With Us), buyer content, a neighbourhood grid, seller content, rentals, and contact.
- The article critique's verdict: lifestyle imagery and one-click search work, but thin text hurts SEO.
- *Lesson:* the beauty comes from one great aerial image, one serif headline and very little else above the fold.

**Zillow:** a search-first header; a split map/list view on desktop and a toggle on mobile; filter chips (For sale/For rent · Price · Beds & baths · Home type · More); "Save search"; a heart on every card. The property page has a grid gallery (1 large + 4) with a lightbox, sticky contact/price card, facts table, estimated monthly payment, and nearby homes.

**Redfin**
- *Mortgage calculator:* inputs on the left (home price with slider, down payment as amount and % linked, loan type, rate). A result card on the right shows a big "$X per month", a stacked bar breaking the payment down (principal & interest / taxes / HOA / insurance), and a "Get prequalified" CTA, plus an "ask an agent" card.
- *Agent careers:* sells **stability and support** before money. It explains the pay model in plain numbers (base pay + per-transaction bonus, ratio shifting with tenure), lists the costs the company covers, says how many leads an agent gets per year, and states benefits, requirements and a short application. → model for Become an Akristal Agent.

**SERHANT. agent page:**
- A split hero: portrait left, then name, title and licence, direct phone and email, socials, and a "Contact agent" button.
- Next a long bio and a video, then **Active Listings** (grid, with sort and a Buy/Rent filter, pagination).
- After that, **Past Sales** and **Past Rentals** as compact tables, then press, then a "Get in touch" form.
- The directory filters by market.
- → model for Akristal agent profiles, adding counts, tabs and reviews the client asked for.

**Client's articles:**
- *Best Real Estate Website Design: 9 Sites Critiqued (2026)*, wpresidence.net. Its principles:
  - sell lifestyle before listings
  - put search where intent lives
  - use navigation to signal intent
  - put lead capture on every page, not only the home page
  - pick one performance risk and manage it
  - use a static poster frame as the LCP element, not video
  - keep listing detail within two clicks
  - don't let floating CTAs cover copy
- The second article ("14 Best… 2026") could not be opened from the share link. Related 2026 roundups agree on:
  - "quiet luxury" minimalism
  - warm, earthy palettes
  - high-contrast serif display + clean sans
  - mobile-first with thumb-reachable filters and sticky call buttons
  - verified listings as a trust signal

---

## 5. Brand assets — what exists vs what's missing

| Exists | Missing (client to supply) |
| --- | --- |
| Badge logo, raster-traced SVG, 5 MB | **Original vector logo** (AI/EPS/PDF/SVG), plus a one-colour version and a horizontal wordmark if one exists |
| One 520×331 background JPG (too small for a hero) | **Hero media:** a drone photo or 15–30s clip of an Akristal project or Kigali skyline, ≥2400px wide |
| Listing photos in Supabase storage (18 listings) | Project renders/photos per development, construction-stage photos, brochures |
| 3 partner logos (JPEG) | Permission to show partner logos; real lender partners |
| Team members in DB (`members`) | Agent headshots (consistent background), bios, areas, languages |
| — | Interior design portfolio (before/after), furniture catalogue photos and prices |
| — | Real trust figures (years operating, units delivered, RDB/CAC registration numbers), genuine client testimonials with consent |
