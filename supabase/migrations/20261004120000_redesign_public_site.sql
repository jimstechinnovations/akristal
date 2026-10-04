-- Redesign: data the new public site needs (PLAN.md §8–9).
-- Additive only: ADD COLUMN IF NOT EXISTS / CREATE … IF NOT EXISTS. Nothing is dropped or renamed.
-- Runs in one transaction; if any statement fails, nothing is applied.

BEGIN;

-- ─── Helper ──────────────────────────────────────────────────────────────────
-- SECURITY DEFINER so policies can check the caller's role without recursing into profiles RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- ─── Properties ──────────────────────────────────────────────────────────────
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties (is_featured) WHERE is_featured;

-- ─── Projects (Akristal's own developments) ─────────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS stage text CHECK (stage IN ('off_plan', 'under_construction', 'completed')),
  ADD COLUMN IF NOT EXISTS progress_pct integer CHECK (progress_pct BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS latitude numeric(10, 8),
  ADD COLUMN IF NOT EXISTS longitude numeric(11, 8),
  ADD COLUMN IF NOT EXISTS completion_date date,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS unit_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS pay_small_small boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS brochure_url text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON public.projects (slug) WHERE slug IS NOT NULL;

-- ─── Agent profile fields ────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS areas_served text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS specialties text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS languages text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS years_experience integer CHECK (years_experience >= 0),
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles (slug) WHERE slug IS NOT NULL;

-- Public agent directory: only agents, only the columns a visitor should see.
-- A plain view runs with its owner's rights, so it exposes exactly these columns and rows.
CREATE OR REPLACE VIEW public.agent_directory AS
SELECT
  p.id, p.slug, p.full_name, p.avatar_url, p.bio, p.title, p.company_name, p.license_number,
  p.areas_served, p.specialties, p.languages, p.phone, p.whatsapp, p.email, p.socials,
  p.years_experience, p.is_featured, p.is_verified, p.created_at
FROM public.profiles p
WHERE p.role = 'agent' AND p.is_active = true;

GRANT SELECT ON public.agent_directory TO anon, authenticated;

-- ─── Agent reviews ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL CHECK (char_length(author_name) BETWEEN 2 AND 80),
  author_contact text CHECK (char_length(author_contact) <= 120),
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 2000),
  context text CHECK (char_length(context) <= 120),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agent_reviews_agent ON public.agent_reviews (agent_id, status);
ALTER TABLE public.agent_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads approved reviews" ON public.agent_reviews;
CREATE POLICY "Public reads approved reviews" ON public.agent_reviews FOR SELECT USING (status = 'approved');
DROP POLICY IF EXISTS "Anyone submits a pending review" ON public.agent_reviews;
CREATE POLICY "Anyone submits a pending review" ON public.agent_reviews FOR INSERT
  WITH CHECK (status = 'pending' AND moderated_by IS NULL AND moderated_at IS NULL);
DROP POLICY IF EXISTS "Admins manage reviews" ON public.agent_reviews;
CREATE POLICY "Admins manage reviews" ON public.agent_reviews FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE VIEW public.agent_review_stats
WITH (security_invoker = true) AS
SELECT agent_id, count(*)::int AS review_count, round(avg(rating)::numeric, 2) AS average_rating
FROM public.agent_reviews
WHERE status = 'approved'
GROUP BY agent_id;

GRANT SELECT ON public.agent_review_stats TO anon, authenticated;

-- ─── Become an agent: applications ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.agent_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) <= 200),
  phone text NOT NULL CHECK (char_length(phone) <= 40),
  city text CHECK (char_length(city) <= 80),
  areas text CHECK (char_length(areas) <= 300),
  years_experience integer CHECK (years_experience BETWEEN 0 AND 60),
  specialties text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  licence_number text CHECK (char_length(licence_number) <= 80),
  cv_url text CHECK (char_length(cv_url) <= 500),
  message text CHECK (char_length(message) <= 3000),
  id_document_path text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'interview', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone applies" ON public.agent_applications;
CREATE POLICY "Anyone applies" ON public.agent_applications FOR INSERT WITH CHECK (status = 'new' AND id_document_path IS NULL);
DROP POLICY IF EXISTS "Admins manage applications" ON public.agent_applications;
CREATE POLICY "Admins manage applications" ON public.agent_applications FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── Leads from public forms ─────────────────────────────────────────────────
-- (public.inquiries requires a signed-in buyer and a property, so anonymous leads live here.)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN (
    'viewing', 'property_enquiry', 'valuation', 'prequalification', 'pay_small_small',
    'consultation', 'furniture', 'project_enquiry', 'agent_contact', 'contact'
  )),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  email text CHECK (char_length(email) <= 200),
  phone text CHECK (char_length(phone) <= 40),
  message text CHECK (char_length(message) <= 5000),
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_path text CHECK (char_length(source_path) <= 300),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'spam')),
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_agent ON public.leads (agent_id);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone submits a lead" ON public.leads;
CREATE POLICY "Anyone submits a lead" ON public.leads FOR INSERT WITH CHECK (status = 'new' AND assigned_to IS NULL);
DROP POLICY IF EXISTS "Agents see their leads" ON public.leads;
CREATE POLICY "Agents see their leads" ON public.leads FOR SELECT USING (agent_id = auth.uid() OR assigned_to = auth.uid());
DROP POLICY IF EXISTS "Admins manage leads" ON public.leads;
CREATE POLICY "Admins manage leads" ON public.leads FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── Pay Small Small plans ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.installment_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  min_deposit_pct numeric(5, 2) NOT NULL CHECK (min_deposit_pct BETWEEN 0 AND 100),
  tenures_months integer[] NOT NULL,
  -- e.g. {"6": 0, "12": 0, "24": 8} — premium % on the balance per tenure
  premium_pct_by_tenure jsonb NOT NULL DEFAULT '{}'::jsonb,
  eligibility text[] NOT NULL DEFAULT '{}',
  terms_url text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.installment_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads active plans" ON public.installment_plans;
CREATE POLICY "Public reads active plans" ON public.installment_plans FOR SELECT USING (is_active);
DROP POLICY IF EXISTS "Admins manage plans" ON public.installment_plans;
CREATE POLICY "Admins manage plans" ON public.installment_plans FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── Partner lenders ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lenders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  logo_url text,
  countries text[] NOT NULL DEFAULT '{}',
  rate_from_pct numeric(5, 2),
  max_term_years integer,
  max_ltv_pct numeric(5, 2),
  notes text,
  website_url text,
  is_published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lenders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads published lenders" ON public.lenders;
CREATE POLICY "Public reads published lenders" ON public.lenders FOR SELECT USING (is_published);
DROP POLICY IF EXISTS "Admins manage lenders" ON public.lenders;
CREATE POLICY "Admins manage lenders" ON public.lenders FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── Furniture catalogue ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.furniture_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku text UNIQUE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('living', 'dining', 'bedroom', 'office', 'outdoor', 'lighting', 'decor')),
  description text,
  image_urls text[] NOT NULL DEFAULT '{}',
  price numeric(14, 2),
  currency text NOT NULL DEFAULT 'RWF',
  price_on_request boolean NOT NULL DEFAULT false,
  dimensions text,
  materials text[] NOT NULL DEFAULT '{}',
  colours text[] NOT NULL DEFAULT '{}',
  lead_time_days integer,
  made_to_order boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.furniture_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads published furniture" ON public.furniture_items;
CREATE POLICY "Public reads published furniture" ON public.furniture_items FOR SELECT USING (is_published);
DROP POLICY IF EXISTS "Admins manage furniture" ON public.furniture_items;
CREATE POLICY "Admins manage furniture" ON public.furniture_items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── Interior design portfolio ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interior_projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  location text,
  space_type text CHECK (space_type IN ('residential', 'commercial', 'hospitality')),
  services text[] NOT NULL DEFAULT '{}',
  summary text,
  cover_image_url text,
  image_urls text[] NOT NULL DEFAULT '{}',
  -- [{ "before": url, "after": url, "caption": text }]
  before_after jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_on date,
  is_published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.interior_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads published interiors" ON public.interior_projects;
CREATE POLICY "Public reads published interiors" ON public.interior_projects FOR SELECT USING (is_published);
DROP POLICY IF EXISTS "Admins manage interiors" ON public.interior_projects;
CREATE POLICY "Admins manage interiors" ON public.interior_projects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── Client testimonials (published with the client's consent) ───────────────
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  context text,
  quote text NOT NULL CHECK (char_length(quote) <= 600),
  consent_given boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT is_published OR consent_given)
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads published testimonials" ON public.testimonials;
CREATE POLICY "Public reads published testimonials" ON public.testimonials FOR SELECT USING (is_published);
DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ─── updated_at triggers (reuses the existing helper from schema.sql) ────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['agent_applications', 'leads', 'installment_plans', 'lenders', 'furniture_items', 'interior_projects']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
  END LOOP;
END $$;

COMMIT;
