-- Script to create or update an admin user
-- Replace 'admin@akristal.com' with the actual admin email

-- Option 1: Update existing user to admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@akristal.com';

-- Option 2: Create admin profile if user exists in auth.users but not in profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
  'admin'
FROM auth.users
WHERE email = 'admin@akristal.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);

-- Verify the admin was created/updated
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE email = 'admin@akristal.com';

