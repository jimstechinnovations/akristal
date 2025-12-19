-- Members Management System - Database Patch Cleanup
-- Run this to remove the members table and related objects added by patch.sql

-- Drop trigger
DROP TRIGGER IF EXISTS update_members_updated_at ON public.members;

-- Drop policies
DROP POLICY IF EXISTS "Public can view active members" ON public.members;
DROP POLICY IF EXISTS "Admins can view all members" ON public.members;
DROP POLICY IF EXISTS "Admins can insert members" ON public.members;
DROP POLICY IF EXISTS "Admins can update members" ON public.members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.members;

-- Drop indexes
DROP INDEX IF EXISTS idx_members_display_order;
DROP INDEX IF EXISTS idx_members_is_active;

-- Disable RLS
ALTER TABLE IF EXISTS public.members DISABLE ROW LEVEL SECURITY;

-- Drop table
DROP TABLE IF EXISTS public.members;
