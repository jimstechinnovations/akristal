-- Client feedback round 2 (5 Oct 2026): partners, insights, broker companies, contact and sales
-- tracking for Brokers & Agents, build stage on listings, longer Pay Small Small, editable contacts.
-- Additive only. Seeds insert only when the target is empty or the key is missing.

BEGIN;

-- ─── Partners and brands ("Trusted by leading brands and partners") ──────────
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website_url text,
  kind text NOT NULL DEFAULT 'partner' CHECK (kind IN ('partner', 'brand')),
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads published partners" ON public.partners;
CREATE POLICY "Public reads published partners" ON public.partners FOR SELECT USING (is_published OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage partners" ON public.partners;
CREATE POLICY "Admins manage partners" ON public.partners FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.partners (name, website_url, kind, display_order)
SELECT 'Luzon Prime Realtors', 'https://luzonprime.com', 'partner', 1
WHERE NOT EXISTS (SELECT 1 FROM public.partners);

-- ─── Insights (articles) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  body text NOT NULL,
  cover_image_url text,
  category text,
  author_name text NOT NULL DEFAULT 'The Akristal Group',
  published_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads published articles" ON public.articles;
CREATE POLICY "Public reads published articles" ON public.articles FOR SELECT USING ((is_published AND published_at <= now()) OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage articles" ON public.articles;
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.articles (slug, title, excerpt, category, cover_image_url, published_at, body)
SELECT * FROM (VALUES
(
  'buying-off-plan-what-to-check',
  'Buying off-plan: what to check before you pay a deposit',
  'Off-plan homes cost less and let you pay as the building rises. Here is what to confirm before any money changes hands.',
  'Buying',
  '/images/projects/construction-crane.webp',
  '2026-10-01 09:00:00+00'::timestamptz,
  E'Buying off-plan means agreeing to buy a home before it is finished, often before the foundations are poured. The price is usually lower than for the finished home, and the payments are spread across the build. In return, you take on the risk that the project is late or changes. These checks keep that risk small.\n\n## The land and the permits\n\nAsk to see proof that the developer owns the land or has the right to build on it, and the building permit for the project. The names and plot numbers on those documents should match the sale agreement you are asked to sign.\n\n## The developer''s record\n\nVisit a project the developer has already finished. Look at the quality of the finishes, talk to people who live there, and ask whether the homes were handed over on the date promised.\n\n## The agreement\n\nRead the sale agreement before you pay anything. It should state:\n\n- the exact unit, its size and its floor plan\n- the total price and what it includes\n- the payment schedule and what each payment is linked to\n- the expected completion date, and what happens if it is missed\n- when and how the title passes to you\n\n## Payments tied to progress\n\nThe safest schedules link each payment to a visible stage of the build: the foundation, the frame, the roof, the finishes. Ask for progress photos or a site visit before each instalment.\n\n## Ask for everything in writing\n\nA show flat, a brochure or a conversation is not a promise. If a finish, a view or a parking space matters to you, make sure it is written into the agreement.'
),
(
  'pay-small-small-or-mortgage',
  'Pay Small Small or a mortgage: how to choose',
  'Two ways to buy a home without paying the full price at once. They suit different buyers, and you can sometimes combine them.',
  'Finance',
  '/images/homes/villa-2.webp',
  '2026-09-24 09:00:00+00'::timestamptz,
  E'Most people buy a home with a mix of savings and borrowed money. With Akristal there are two main routes, and the right one depends on your income, your savings and how long you want to pay.\n\n## Pay Small Small\n\nYou pay a deposit, then spread the rest in monthly instalments paid directly to Akristal, from six months up to five years. There is no bank application, so it suits buyers who are self-employed, who earn in more than one currency, or who simply want a fixed, short plan.\n\n## A bank mortgage\n\nA bank lends you most of the price and you repay it, with interest, over many years. Monthly payments are lower because the term is longer, but the total you pay is higher, and the bank will check your income and credit history.\n\n## Questions that help you decide\n\n- How much can you put down today?\n- How much can you pay every month without strain?\n- Do you want the home paid off in a few years, or spread over many?\n- Can you show the steady income a bank will ask for?\n\n## Combining the two\n\nIf you can borrow part of the price from your bank, tell us when you apply. We can work with your bank so the loan covers part of the balance and Pay Small Small covers the rest.\n\nOur calculators on the Mortgage and Pay Small Small pages give estimates for both routes. Your agreement or loan offer sets the final figures.'
),
(
  'questions-to-ask-at-a-viewing',
  'Ten questions to ask at a property viewing',
  'A viewing is your chance to find what the photos leave out. Take this list with you.',
  'Buying',
  '/images/interiors/living-arches.webp',
  '2026-09-17 09:00:00+00'::timestamptz,
  E'Photos show a home at its best. A viewing is where you find out how it really works. Bring this list, and do not be shy about asking every question on it.\n\n## About the home\n\n- How old is the building, and when was it last renovated?\n- Is there a reliable water supply, and is there a tank or borehole?\n- How is power supplied, and is there a backup?\n- Which way do the main rooms face, and how much light do they get?\n\n## About the costs\n\n- What are the service charges or estate fees each year?\n- Which fixtures and fittings are included in the price?\n\n## About the paperwork\n\n- Is the title in the seller''s name, and is it free of disputes?\n- Are there approved plans for any extensions?\n\n## About the area\n\n- How long is the drive to work or school at rush hour?\n- What is planned nearby: roads, buildings, markets?\n\nVisit twice if you can, once in daylight and once in the evening. Your Akristal broker or agent can arrange both.'
)
) AS v(slug, title, excerpt, category, cover_image_url, published_at, body)
WHERE NOT EXISTS (SELECT 1 FROM public.articles);

-- ─── Broker companies ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.brokers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text NOT NULL,
  logo_url text,
  about text,
  contact_name text,
  phone text,
  whatsapp text,
  email text,
  website_url text,
  address text,
  city text,
  country text,
  areas text[] NOT NULL DEFAULT '{}',
  registration_number text,
  is_verified boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads published brokers" ON public.brokers;
CREATE POLICY "Public reads published brokers" ON public.brokers FOR SELECT USING (is_published OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage brokers" ON public.brokers;
CREATE POLICY "Admins manage brokers" ON public.brokers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- One unpublished example so the admin can see every field filled in; it never shows on the site.
INSERT INTO public.brokers (slug, name, about, contact_name, city, country, areas, is_published)
SELECT 'example-broker', 'Example Brokers Ltd (edit or delete me)',
  'This is a sample record that shows how a broker company appears. Replace it with a real broker that has registered with Akristal, then tick Published.',
  'Contact person', 'Abuja', 'Nigeria', ARRAY['Maitama', 'Wuse 2'], false
WHERE NOT EXISTS (SELECT 1 FROM public.brokers);

-- Applications now come from agents and from broker companies.
ALTER TABLE public.agent_applications
  ADD COLUMN IF NOT EXISTS applicant_type text NOT NULL DEFAULT 'agent' CHECK (applicant_type IN ('agent', 'broker')),
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS team_size integer;

-- ─── Contact clicks on Brokers & Agents (WhatsApp, call, email) ──────────────
CREATE TABLE IF NOT EXISTS public.contact_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  broker_id uuid REFERENCES public.brokers(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp', 'call', 'email')),
  source_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (agent_id IS NOT NULL OR broker_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_contact_events_agent ON public.contact_events (agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_events_broker ON public.contact_events (broker_id, created_at DESC);
ALTER TABLE public.contact_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone records a contact click" ON public.contact_events;
CREATE POLICY "Anyone records a contact click" ON public.contact_events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Agents and admins read contact clicks" ON public.contact_events;
CREATE POLICY "Agents and admins read contact clicks" ON public.contact_events FOR SELECT USING (agent_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage contact clicks" ON public.contact_events;
CREATE POLICY "Admins manage contact clicks" ON public.contact_events FOR DELETE USING (public.is_admin());

-- ─── Sales closed by Brokers & Agents ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  broker_id uuid REFERENCES public.brokers(id) ON DELETE SET NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  description text,
  buyer_name text,
  sale_price numeric,
  currency text NOT NULL DEFAULT 'USD',
  commission_amount numeric,
  closed_on date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('reported', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agent_sales_agent ON public.agent_sales (agent_id, closed_on DESC);
ALTER TABLE public.agent_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Agents read their sales" ON public.agent_sales;
CREATE POLICY "Agents read their sales" ON public.agent_sales FOR SELECT USING (agent_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Agents report a sale" ON public.agent_sales;
CREATE POLICY "Agents report a sale" ON public.agent_sales FOR INSERT WITH CHECK ((agent_id = auth.uid() AND status = 'reported') OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage sales" ON public.agent_sales;
CREATE POLICY "Admins manage sales" ON public.agent_sales FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── Listings: where the building is in its life ─────────────────────────────
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS build_stage text CHECK (build_stage IN ('off_plan', 'under_construction', 'completed'));

-- ─── Testimonials: star rating, source, and submissions from the website ────
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS rating smallint CHECK (rating BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'site' CHECK (source IN ('site', 'google'));
DROP POLICY IF EXISTS "Anyone submits a testimonial for review" ON public.testimonials;
CREATE POLICY "Anyone submits a testimonial for review" ON public.testimonials FOR INSERT WITH CHECK (is_published = false AND consent_given = true);

-- ─── Pay Small Small: 10–50% deposit, six months to five years ───────────────
ALTER TABLE public.installment_plans ADD COLUMN IF NOT EXISTS max_deposit_pct numeric NOT NULL DEFAULT 50;
UPDATE public.installment_plans
SET min_deposit_pct = 10,
    max_deposit_pct = 50,
    tenures_months = ARRAY[6, 12, 18, 24, 36, 48, 60],
    premium_pct_by_tenure = '{"6":0,"12":0,"18":0,"24":0,"36":0,"48":0,"60":0}'::jsonb
WHERE name = 'Pay Small Small' AND tenures_months = ARRAY[6, 12, 18, 24] AND min_deposit_pct = 30;

-- ─── Settings: wording, figures, contacts ────────────────────────────────────
-- Home: new headline and tagline (only where the admin has not changed them), ticker, stats, reviews.
UPDATE public.site_settings
SET value = value
  || CASE WHEN value->>'heroTitle' = 'Kigali & beyond' THEN '{"heroTitle": "Africa & beyond"}'::jsonb ELSE '{}'::jsonb END
  || CASE WHEN value->>'tagline' = 'Homes we build, furnish and hand over' THEN '{"tagline": "We build, furnish and hand over"}'::jsonb ELSE '{}'::jsonb END
WHERE key = 'home';

UPDATE public.site_settings
SET value = jsonb_build_object(
  'tickerItems', '["Off-plan homes", "Pay Small Small, up to 5 years", "Interior design", "Furniture", "Mortgage support", "Kigali", "Abuja", "Lagos", "Dubai", "Brokers & Agents across Africa"]'::jsonb,
  'stats', '[
    {"label": "Akristal and partner development projects", "source": "developments"},
    {"label": "Properties sold", "source": "sold"},
    {"label": "Properties for sale and for rent", "source": "available"},
    {"label": "Countries where we sell and let properties globally", "source": "countries"}
  ]'::jsonb,
  'googleRating', null, 'googleReviewCount', null, 'googleReviewsUrl', ''
) || value
WHERE key = 'home' AND NOT value ? 'stats';

-- Agent programme: 40 / 50 / 60% of a 10% commission, i.e. 4 / 5 / 6% of the sale price.
UPDATE public.site_settings
SET value = jsonb_set(jsonb_set(value, '{commissionPct}', '10'::jsonb), '{tiers}', '[
  {"name": "Associate agent", "share": 40, "requirement": "Your first sales with Akristal"},
  {"name": "Senior agent", "share": 50, "requirement": "Ten or more completed sales"},
  {"name": "Partner agent", "share": 60, "requirement": "By invitation, for top performers"}
]'::jsonb)
WHERE key = 'agent_programme' AND value->'tiers'->0->>'share' = '50';

-- Contacts shown in the header, footer and Contact page.
INSERT INTO public.site_settings (key, value) VALUES
  ('contact', '{
    "email": "info@akristal.com",
    "whatsapp": "250734994909",
    "headerPhones": [
      {"label": "Rwanda", "number": "+250 791 900 316"},
      {"label": "Nigeria", "number": "+234 813 238 3836"}
    ],
    "offices": [
      {"region": "Rwanda", "label": "Head office, East Africa", "address": "KK 15 Rd, Kigali, Rwanda", "phones": "+250 791 900 316\n+250 788 357 819"},
      {"region": "Nigeria", "label": "Head office, West Africa", "address": "Abuja, Nigeria", "phones": "+234 813 238 3836"},
      {"region": "South Africa", "label": "Southern Africa", "address": "South Africa", "phones": "+27 67 684 6945"}
    ]
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

COMMIT;
