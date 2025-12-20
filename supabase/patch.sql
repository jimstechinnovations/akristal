-- Akristal Group Limited - Database Patch
-- Adds new fields to projects table: type, pre_selling_price, pre_selling_currency, main_price, main_currency
-- Run this on existing databases to add the new fields

-- Create Project Type Enum
DO $$ BEGIN
  CREATE TYPE project_type AS ENUM ('bungalow', 'duplex', 'terresse', 'town_house', 'apartment', 'high_rising', 'block', 'flat');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to projects table
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS type project_type,
  ADD COLUMN IF NOT EXISTS pre_selling_price DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS pre_selling_currency TEXT DEFAULT 'RWF',
  ADD COLUMN IF NOT EXISTS main_price DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS main_currency TEXT DEFAULT 'RWF';

-- Add comments for documentation
COMMENT ON COLUMN public.projects.type IS 'Project type: Bungalow, Duplex, Terresse, Town House, Apartment, High rising, Block or Flat';
COMMENT ON COLUMN public.projects.pre_selling_price IS 'Pre-selling price for the project';
COMMENT ON COLUMN public.projects.pre_selling_currency IS 'Currency for pre-selling price (default: RWF)';
COMMENT ON COLUMN public.projects.main_price IS 'Main price for the project';
COMMENT ON COLUMN public.projects.main_currency IS 'Currency for main price (default: RWF)';
