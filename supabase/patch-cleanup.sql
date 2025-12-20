-- Akristal Group Limited - Database Patch Cleanup
-- Removes the new fields added in patch.sql from projects table
-- Use this to rollback the patch if needed

-- Remove columns from projects table
ALTER TABLE public.projects
  DROP COLUMN IF EXISTS type,
  DROP COLUMN IF EXISTS pre_selling_price,
  DROP COLUMN IF EXISTS pre_selling_currency,
  DROP COLUMN IF EXISTS main_price,
  DROP COLUMN IF EXISTS main_currency;

-- Drop Project Type Enum (only if no other tables use it)
-- Note: Check for dependencies before dropping
DO $$ 
BEGIN
  -- Only drop if no columns are using this type
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE udt_name = 'project_type'
  ) THEN
    DROP TYPE IF EXISTS project_type;
  END IF;
END $$;
