-- Cleanup: Revert property_types migration
-- This script removes the property_types table and related changes

-- Drop policies
DROP POLICY IF EXISTS "Anyone can view active property types" ON public.property_types;
DROP POLICY IF EXISTS "Admins can view all property types" ON public.property_types;
DROP POLICY IF EXISTS "Admins can manage property types" ON public.property_types;

-- Drop trigger
DROP TRIGGER IF EXISTS update_property_types_updated_at ON public.property_types;

-- Drop indexes
DROP INDEX IF EXISTS idx_property_types_slug;
DROP INDEX IF EXISTS idx_property_types_display_order;
DROP INDEX IF EXISTS idx_property_types_is_active;
DROP INDEX IF EXISTS idx_properties_property_type_id;
DROP INDEX IF EXISTS idx_properties_listing_type;

-- Remove new columns from properties table
ALTER TABLE public.properties DROP COLUMN IF EXISTS property_type_id;
ALTER TABLE public.properties DROP COLUMN IF EXISTS listing_type;

-- Disable RLS
ALTER TABLE IF EXISTS public.property_types DISABLE ROW LEVEL SECURITY;

-- Drop table
DROP TABLE IF EXISTS public.property_types;

-- Drop listing_type enum
DROP TYPE IF EXISTS listing_type;
