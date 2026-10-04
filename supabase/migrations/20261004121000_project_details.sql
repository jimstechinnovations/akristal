-- Fill the new project fields from facts already published in each project's description.
-- COALESCE keeps anything an admin has already set. Progress % is left empty: no source states it.

BEGIN;

UPDATE public.projects SET
  slug          = COALESCE(slug, 'le-centurium-city'),
  city          = COALESCE(city, 'Rwamagana'),
  district      = COALESCE(district, 'Karenge Sector, Rwamagana District'),
  country       = COALESCE(country, 'Rwanda'),
  stage         = COALESCE(stage, 'off_plan'),
  summary       = COALESCE(summary, 'A mixed-use satellite city in the Karenge Sector of Rwamagana: homes, commercial streets and green space. Ground-breaking is scheduled for 20 February 2027.'),
  is_featured   = true,
  display_order = CASE WHEN display_order = 0 THEN 1 ELSE display_order END
WHERE id = '679dbe3e-2bb3-439a-813f-c0505892d6c3';

UPDATE public.projects SET
  slug          = COALESCE(slug, 'pearl-view-residence'),
  city          = COALESCE(city, 'Kanzenze'),
  district      = COALESCE(district, 'Cyeru, Kanzenze'),
  country       = COALESCE(country, 'Rwanda'),
  stage         = COALESCE(stage, 'off_plan'),
  summary       = COALESCE(summary, '3 to 5-bedroom homes with penthouses, and 1 to 3-bedroom apartments, with a pool, spa, gym and shopping centre. Building from December 2027 to 2030.'),
  is_featured   = true,
  display_order = CASE WHEN display_order = 0 THEN 2 ELSE display_order END
WHERE id = '2fbe0748-28e7-40c6-a71c-74859de51a86';

UPDATE public.projects SET
  slug          = COALESCE(slug, 'le-centurium-city-commercial-layout'),
  city          = COALESCE(city, 'Rwamagana'),
  district      = COALESCE(district, 'Karenge Sector, Rwamagana District'),
  country       = COALESCE(country, 'Rwanda'),
  stage         = COALESCE(stage, 'off_plan'),
  summary       = COALESCE(summary, 'The planned layout of Le Centurium City''s commercial district in Rwanda''s Eastern Province.'),
  display_order = CASE WHEN display_order = 0 THEN 3 ELSE display_order END
WHERE id = 'da80ece3-ab34-4526-a629-6f602b3a1a8a';

UPDATE public.projects SET
  slug            = COALESCE(slug, 'valid-dreams-estate'),
  city            = COALESCE(city, 'Abuja'),
  district        = COALESCE(district, 'Life Camp'),
  country         = COALESCE(country, 'Nigeria'),
  stage           = COALESCE(stage, 'completed'),
  progress_pct    = COALESCE(progress_pct, 100),
  completion_date = COALESCE(completion_date, '2021-12-31'),
  summary         = COALESCE(summary, '38 four-bedroom duplexes in Life Camp, Abuja, delivered between 2017 and 2021 and fully sold.'),
  is_featured     = true,
  display_order   = CASE WHEN display_order = 0 THEN 4 ELSE display_order END
WHERE id = '41424b44-fef5-4cb9-9492-f36040a3fc75';

COMMIT;
