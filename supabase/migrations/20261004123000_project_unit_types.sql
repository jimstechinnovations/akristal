-- Unit mixes as stated in each project's published description (counts only where stated).
BEGIN;
UPDATE public.projects SET unit_types = '[{"type":"Four-bedroom duplex","beds":4,"units":38}]'::jsonb
WHERE slug = 'valid-dreams-estate' AND unit_types = '[]'::jsonb;
UPDATE public.projects SET unit_types = '[{"type":"3 to 5-bedroom homes with penthouses","bedsMin":3,"bedsMax":5},{"type":"1 to 3-bedroom apartments","bedsMin":1,"bedsMax":3}]'::jsonb
WHERE slug = 'pearl-view-residence' AND unit_types = '[]'::jsonb;
COMMIT;
