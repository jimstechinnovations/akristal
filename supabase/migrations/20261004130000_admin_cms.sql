-- Admin-editable website: media bucket, settings table, inbox notes, and the current content seeded as live rows.
-- Seeds insert only when the target is empty (or the key is missing): re-running never duplicates or overwrites.

BEGIN;

-- Public bucket for images uploaded from the admin; only admins can write.
INSERT INTO storage.buckets (id, name, public) VALUES ('site-media', 'site-media', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "site-media public read" ON storage.objects;
CREATE POLICY "site-media public read" ON storage.objects FOR SELECT USING (bucket_id = 'site-media');
DROP POLICY IF EXISTS "site-media admin insert" ON storage.objects;
CREATE POLICY "site-media admin insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-media' AND public.is_admin());
DROP POLICY IF EXISTS "site-media admin update" ON storage.objects;
CREATE POLICY "site-media admin update" ON storage.objects FOR UPDATE USING (bucket_id = 'site-media' AND public.is_admin());
DROP POLICY IF EXISTS "site-media admin delete" ON storage.objects;
CREATE POLICY "site-media admin delete" ON storage.objects FOR DELETE USING (bucket_id = 'site-media' AND public.is_admin());

-- Key/value settings edited in the admin (home hero, agent programme).
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public reads settings" ON public.site_settings;
CREATE POLICY "Public reads settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage settings" ON public.site_settings;
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Internal notes on inbox items.
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.agent_applications ADD COLUMN IF NOT EXISTS admin_notes text;

INSERT INTO public.site_settings (key, value) VALUES
  ('home', '{"heroTitle": "Kigali & beyond", "tagline": "Homes we build, furnish and hand over", "heroImageUrl": "/images/hero/kigali-aerial.webp", "heroImageAlt": "Aerial view of a green park and wetlands in Kigali with the city on the hills behind"}'::jsonb),
  ('agent_programme', '{"commissionPct": 3, "tiers": [{"name": "Associate agent", "share": 50, "requirement": "Your first year with Akristal"}, {"name": "Senior agent", "share": 60, "requirement": "Ten or more completed sales"}, {"name": "Partner agent", "share": 70, "requirement": "By invitation, for top performers"}], "faqs": [{"q": "Do I need a licence to apply?", "a": "Tell us what registration you hold in your country. Where a licence is required by law, you must hold it before you list homes with us."}, {"q": "Can I work part-time?", "a": "Yes. You are paid on completed sales, so you can start part-time and grow from there."}, {"q": "Which areas do you need agents in?", "a": "Kigali first, then Abuja and Lagos. We also take applications for Dubai, Kampala and South Africa."}, {"q": "Will I sell Akristal’s own developments?", "a": "Yes. Agents sell our developments alongside homes listed by private owners."}, {"q": "How long does the application take?", "a": "The form takes about five minutes. Our team reviews each application and contacts shortlisted applicants for an interview."}]}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.installment_plans (name, description, min_deposit_pct, tenures_months, premium_pct_by_tenure, eligibility, is_active, display_order)
SELECT 'Pay Small Small', 'Pay a deposit, then spread the balance in equal monthly instalments, paid directly to Akristal.', 30, ARRAY[6,12,18,24],
  '{"6":0,"12":0,"18":0,"24":0}'::jsonb,
  ARRAY['Valid national ID or passport','Proof of income or a guarantor','Signed sale agreement for an eligible home'], true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.installment_plans);

INSERT INTO public.interior_projects (slug, title, location, space_type, services, cover_image_url, image_urls, is_published, display_order)
SELECT * FROM (VALUES
  ('warm-living-room', 'Warm family living room', 'Kigali', 'residential', ARRAY['Interior design','Furniture','Lighting']::text[], '/images/interiors/living-warm.webp', ARRAY['/images/interiors/living-warm.webp','/images/interiors/dining.webp']::text[], true, 1),
  ('timber-kitchen', 'Timber kitchen and island', 'Kigali', 'residential', ARRAY['Kitchen design','Joinery']::text[], '/images/interiors/kitchen-wood.webp', ARRAY['/images/interiors/kitchen-wood.webp','/images/interiors/kitchen-bright.webp']::text[], true, 2),
  ('quiet-bedroom', 'Main bedroom suite', 'Abuja', 'residential', ARRAY['Interior design','Furniture']::text[], '/images/interiors/bedroom-dark.webp', ARRAY['/images/interiors/bedroom-dark.webp','/images/interiors/bedroom-light.webp']::text[], true, 3),
  ('arched-lounge', 'Lounge with arched windows', 'Kigali', 'hospitality', ARRAY['Styling','Furniture']::text[], '/images/interiors/living-arches.webp', ARRAY['/images/interiors/living-arches.webp']::text[], true, 4),
  ('garden-kitchen', 'Kitchen opening to the garden', 'Kigali', 'residential', ARRAY['Kitchen design']::text[], '/images/interiors/kitchen-bright.webp', ARRAY['/images/interiors/kitchen-bright.webp']::text[], true, 5),
  ('timber-living', 'Short-let apartment living area', 'Kigali', 'hospitality', ARRAY['Turnkey furnishing']::text[], '/images/interiors/living-wood.webp', ARRAY['/images/interiors/living-wood.webp']::text[], true, 6)
) AS v(slug, title, location, space_type, services, cover_image_url, image_urls, is_published, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.interior_projects);

INSERT INTO public.furniture_items (sku, name, category, image_urls, price_on_request, dimensions, materials, colours, made_to_order, is_published, display_order)
SELECT * FROM (VALUES
  ('AK-F001', 'Velvet three-seater sofa', 'living', ARRAY['/images/furniture/sofa-velvet.webp']::text[], true, 'W 210 × D 90 × H 80 cm', ARRAY['Velvet','Solid wood legs']::text[], ARRAY['Bottle green','Rust','Charcoal']::text[], true, true, 1),
  ('AK-F002', 'Tufted leather sofa', 'living', ARRAY['/images/furniture/sofa-leather.webp']::text[], true, 'W 200 × D 95 × H 78 cm', ARRAY['Leather','Hardwood frame']::text[], ARRAY['Tan','Chocolate']::text[], true, true, 2),
  ('AK-F003', 'Rounded bouclé armchair', 'living', ARRAY['/images/furniture/sofa-boucle.webp']::text[], true, 'W 85 × D 80 × H 72 cm', ARRAY['Bouclé fabric']::text[], ARRAY['Cream']::text[], false, true, 3),
  ('AK-F004', 'Mid-century lounge chair', 'living', ARRAY['/images/furniture/armchair-amber.webp']::text[], true, 'W 70 × D 78 × H 80 cm', ARRAY['Fabric','Oak frame']::text[], ARRAY['Amber','Olive']::text[], false, true, 4),
  ('AK-F005', 'Wingback reading chair', 'living', ARRAY['/images/furniture/armchair-wing.webp']::text[], true, 'W 80 × D 85 × H 105 cm', ARRAY['Woven fabric']::text[], ARRAY['Mustard','Grey']::text[], true, true, 5),
  ('AK-F006', 'Six-seat dining set', 'dining', ARRAY['/images/furniture/dining-set.webp']::text[], true, 'Table L 180 × W 90 cm', ARRAY['Solid timber','Black-painted chairs']::text[], ARRAY['Natural','Black']::text[], true, true, 6),
  ('AK-F007', 'Rattan dining chair', 'dining', ARRAY['/images/furniture/dining-rattan.webp']::text[], true, 'W 52 × D 55 × H 80 cm', ARRAY['Rattan','Timber']::text[], ARRAY['Natural']::text[], false, true, 7),
  ('AK-F008', 'Timber bed with upholstered headboard', 'bedroom', ARRAY['/images/furniture/bed.webp']::text[], true, 'King, 180 × 200 cm', ARRAY['Solid timber','Linen']::text[], ARRAY['Walnut','Natural']::text[], true, true, 8),
  ('AK-F009', 'Six-drawer chest', 'bedroom', ARRAY['/images/furniture/dresser.webp']::text[], true, 'W 140 × D 45 × H 80 cm', ARRAY['Teak veneer']::text[], ARRAY['Teak']::text[], false, true, 9),
  ('AK-F010', 'Mid-century sideboard', 'living', ARRAY['/images/furniture/sideboard.webp']::text[], true, 'W 160 × D 45 × H 75 cm', ARRAY['Walnut veneer']::text[], ARRAY['Walnut']::text[], false, true, 10),
  ('AK-F011', 'Round side table and pouf', 'decor', ARRAY['/images/furniture/side-table.webp']::text[], true, 'Ø 45 × H 50 cm', ARRAY['Timber','Leather']::text[], ARRAY['Natural','Cognac']::text[], false, true, 11),
  ('AK-F012', 'Copper dome pendant', 'lighting', ARRAY['/images/furniture/pendant-copper.webp']::text[], true, 'Ø 30 cm', ARRAY['Spun copper']::text[], ARRAY['Copper']::text[], false, true, 12),
  ('AK-F013', 'Slatted timber pendant', 'lighting', ARRAY['/images/furniture/pendant-timber.webp']::text[], true, 'Ø 25 × H 45 cm', ARRAY['Timber slats']::text[], ARRAY['Natural']::text[], true, true, 13)
) AS v(sku, name, category, image_urls, price_on_request, dimensions, materials, colours, made_to_order, is_published, display_order)
WHERE NOT EXISTS (SELECT 1 FROM public.furniture_items);

COMMIT;
