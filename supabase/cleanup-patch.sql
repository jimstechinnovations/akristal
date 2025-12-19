-- Project Management System - Cleanup Patch
-- Run this to remove only the project management system tables and related objects
-- Use this if you want to remove the project system without affecting other tables

-- Drop triggers
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_project_updates_updated_at ON public.project_updates;
DROP TRIGGER IF EXISTS update_project_offers_updated_at ON public.project_offers;
DROP TRIGGER IF EXISTS update_project_events_updated_at ON public.project_events;

-- Drop policies
DROP POLICY IF EXISTS "Anyone can view active projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Sellers, agents, and admins can create projects" ON public.projects;
DROP POLICY IF EXISTS "Only admins can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects or admin can update any" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects or admin can delete any" ON public.projects;

DROP POLICY IF EXISTS "Anyone can view visible updates" ON public.project_updates;
DROP POLICY IF EXISTS "Users can view all updates for own projects" ON public.project_updates;
DROP POLICY IF EXISTS "Admins can view all updates" ON public.project_updates;
DROP POLICY IF EXISTS "Sellers, agents, and admins can create updates" ON public.project_updates;
DROP POLICY IF EXISTS "Only admins can create updates" ON public.project_updates;
DROP POLICY IF EXISTS "Users can update own updates or admin can update any" ON public.project_updates;
DROP POLICY IF EXISTS "Users can delete own updates or admin can delete any" ON public.project_updates;

DROP POLICY IF EXISTS "Anyone can view visible offers" ON public.project_offers;
DROP POLICY IF EXISTS "Users can view all offers for own projects" ON public.project_offers;
DROP POLICY IF EXISTS "Admins can view all offers" ON public.project_offers;
DROP POLICY IF EXISTS "Sellers, agents, and admins can create offers" ON public.project_offers;
DROP POLICY IF EXISTS "Only admins can create offers" ON public.project_offers;
DROP POLICY IF EXISTS "Users can update own offers or admin can update any" ON public.project_offers;
DROP POLICY IF EXISTS "Users can delete own offers or admin can delete any" ON public.project_offers;

DROP POLICY IF EXISTS "Anyone can view visible events" ON public.project_events;
DROP POLICY IF EXISTS "Users can view all events for own projects" ON public.project_events;
DROP POLICY IF EXISTS "Admins can view all events" ON public.project_events;
DROP POLICY IF EXISTS "Sellers, agents, and admins can create events" ON public.project_events;
DROP POLICY IF EXISTS "Only admins can create events" ON public.project_events;
DROP POLICY IF EXISTS "Users can update own events or admin can update any" ON public.project_events;
DROP POLICY IF EXISTS "Users can delete own events or admin can delete any" ON public.project_events;

-- Drop indexes
DROP INDEX IF EXISTS idx_projects_created_by;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_project_updates_project_id;
DROP INDEX IF EXISTS idx_project_updates_schedule_visibility;
DROP INDEX IF EXISTS idx_project_updates_scheduled_at;
DROP INDEX IF EXISTS idx_project_offers_project_id;
DROP INDEX IF EXISTS idx_project_offers_start_datetime;
DROP INDEX IF EXISTS idx_project_offers_end_datetime;
DROP INDEX IF EXISTS idx_project_offers_schedule_visibility;
DROP INDEX IF EXISTS idx_project_events_project_id;
DROP INDEX IF EXISTS idx_project_events_start_datetime;
DROP INDEX IF EXISTS idx_project_events_end_datetime;
DROP INDEX IF EXISTS idx_project_events_schedule_visibility;

-- Disable RLS
ALTER TABLE IF EXISTS public.project_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_updates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS public.project_events;
DROP TABLE IF EXISTS public.project_offers;
DROP TABLE IF EXISTS public.project_updates;
DROP TABLE IF EXISTS public.projects;

-- Drop custom types
DROP TYPE IF EXISTS schedule_visibility;
DROP TYPE IF EXISTS project_status;
