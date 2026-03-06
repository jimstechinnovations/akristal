-- Migration: Convert property_type from ENUM to dynamic table-based system
-- Add listing_type (rent/sale) field
-- This allows admin to manage property types dynamically

-- Step 1: Create property_types table
CREATE TABLE IF NOT EXISTS public.property_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 2: Create listing_type enum
DO $$ BEGIN
  CREATE TYPE listing_type AS ENUM ('sale', 'rent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 3: Add new columns to properties table
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS property_type_id UUID REFERENCES public.property_types(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS listing_type listing_type;

-- Step 4: Insert default property types from old enum values
INSERT INTO public.property_types (name, slug, description, display_order, is_active) VALUES
  ('House', 'house', 'Single-family houses and villas', 1, true),
  ('Apartment', 'apartment', 'Apartments and condos', 2, true),
  ('Commercial', 'commercial', 'Office spaces, retail, and commercial buildings', 3, true),
  ('Land', 'land', 'Vacant land and plots', 4, true)
ON CONFLICT (slug) DO NOTHING;

-- Step 5: Migrate existing data
-- Map old property_type enum to new property_type_id
UPDATE public.properties p
SET property_type_id = pt.id
FROM public.property_types pt
WHERE 
  (p.property_type = 'residential' AND pt.slug = 'house') OR
  (p.property_type = 'commercial' AND pt.slug = 'commercial') OR
  (p.property_type = 'land' AND pt.slug = 'land') OR
  (p.property_type = 'rental' AND pt.slug = 'apartment');

-- Set listing_type based on old property_type
UPDATE public.properties
SET listing_type = CASE
  WHEN property_type = 'rental' THEN 'rent'::listing_type
  ELSE 'sale'::listing_type
END
WHERE listing_type IS NULL;

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_property_types_slug ON public.property_types(slug);
CREATE INDEX IF NOT EXISTS idx_property_types_display_order ON public.property_types(display_order);
CREATE INDEX IF NOT EXISTS idx_property_types_is_active ON public.property_types(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_property_type_id ON public.properties(property_type_id);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);

-- Step 7: Add trigger for updated_at
CREATE TRIGGER update_property_types_updated_at
  BEFORE UPDATE ON public.property_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Enable RLS
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for property_types
CREATE POLICY "Anyone can view active property types"
  ON public.property_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all property types"
  ON public.property_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage property types"
  ON public.property_types FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Step 10: Drop old property_type column (commented out for safety - uncomment after verification)
-- ALTER TABLE public.properties DROP COLUMN IF EXISTS property_type;

-- Step 11: Drop old property_type enum (commented out for safety - uncomment after verification)
-- DROP TYPE IF EXISTS property_type;

-- Note: Keep the old column and enum for now to allow rollback if needed
-- After verifying the migration works, uncomment steps 10 and 11 to complete cleanup
