-- Short display names for developments (the existing titles read as press-release headlines).
BEGIN;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS name text;
UPDATE public.projects SET name = COALESCE(name, 'Le Centurium City') WHERE slug = 'le-centurium-city';
UPDATE public.projects SET name = COALESCE(name, 'Pearl View Residence') WHERE slug = 'pearl-view-residence';
UPDATE public.projects SET name = COALESCE(name, 'Le Centurium City: commercial district') WHERE slug = 'le-centurium-city-commercial-layout';
UPDATE public.projects SET name = COALESCE(name, 'Valid Dreams Estate') WHERE slug = 'valid-dreams-estate';
COMMIT;
