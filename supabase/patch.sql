-- Project Management System - Database Patch
-- Run this after the main schema.sql

-- Project Status Enum
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('draft', 'active', 'completed', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Schedule Visibility Enum (controls when content is visible)
DO $$ BEGIN
  CREATE TYPE schedule_visibility AS ENUM ('immediate', 'scheduled', 'hidden');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status project_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Project Updates table
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  media_urls TEXT[], -- Array of URLs for images and videos
  schedule_visibility schedule_visibility DEFAULT 'immediate',
  scheduled_at TIMESTAMP WITH TIME ZONE, -- When to make visible (if scheduled)
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Project Offers table
CREATE TABLE IF NOT EXISTS public.project_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  media_urls TEXT[], -- Array of URLs for images and videos
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  schedule_visibility schedule_visibility DEFAULT 'immediate',
  scheduled_at TIMESTAMP WITH TIME ZONE, -- When to make visible (if scheduled)
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT valid_offer_dates CHECK (end_datetime > start_datetime)
);

-- Project Events table
CREATE TABLE IF NOT EXISTS public.project_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  media_urls TEXT[], -- Array of URLs for images and videos
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  schedule_visibility schedule_visibility DEFAULT 'immediate',
  scheduled_at TIMESTAMP WITH TIME ZONE, -- When to make visible (if scheduled)
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT valid_event_dates CHECK (end_datetime > start_datetime)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON public.project_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_schedule_visibility ON public.project_updates(schedule_visibility);
CREATE INDEX IF NOT EXISTS idx_project_updates_scheduled_at ON public.project_updates(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_project_offers_project_id ON public.project_offers(project_id);
CREATE INDEX IF NOT EXISTS idx_project_offers_start_datetime ON public.project_offers(start_datetime);
CREATE INDEX IF NOT EXISTS idx_project_offers_end_datetime ON public.project_offers(end_datetime);
CREATE INDEX IF NOT EXISTS idx_project_offers_schedule_visibility ON public.project_offers(schedule_visibility);
CREATE INDEX IF NOT EXISTS idx_project_events_project_id ON public.project_events(project_id);
CREATE INDEX IF NOT EXISTS idx_project_events_start_datetime ON public.project_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_project_events_end_datetime ON public.project_events(end_datetime);
CREATE INDEX IF NOT EXISTS idx_project_events_schedule_visibility ON public.project_events(schedule_visibility);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_updates_updated_at
  BEFORE UPDATE ON public.project_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_offers_updated_at
  BEFORE UPDATE ON public.project_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_events_updated_at
  BEFORE UPDATE ON public.project_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Projects
-- Anyone can view active projects
CREATE POLICY "Anyone can view active projects"
  ON public.projects FOR SELECT
  USING (status = 'active');

-- Admins can view all projects
CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can create projects (for now)
CREATE POLICY "Only admins can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can update their own projects, admins can update any
CREATE POLICY "Users can update own projects or admin can update any"
  ON public.projects FOR UPDATE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can delete their own projects, admins can delete any
CREATE POLICY "Users can delete own projects or admin can delete any"
  ON public.projects FOR DELETE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Project Updates
-- Anyone can view visible updates (immediate or scheduled and past scheduled time)
CREATE POLICY "Anyone can view visible updates"
  ON public.project_updates FOR SELECT
  USING (
    schedule_visibility = 'immediate' OR
    (schedule_visibility = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= NOW())
  );

-- Admins can view all updates
CREATE POLICY "Admins can view all updates"
  ON public.project_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_updates.project_id AND
      projects.created_by = auth.uid()
    )
  );

-- Only admins can create updates (for now)
CREATE POLICY "Only admins can create updates"
  ON public.project_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) AND
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_updates.project_id
    )
  );

-- Users can update their own updates, admins can update any
CREATE POLICY "Users can update own updates or admin can update any"
  ON public.project_updates FOR UPDATE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can delete their own updates, admins can delete any
CREATE POLICY "Users can delete own updates or admin can delete any"
  ON public.project_updates FOR DELETE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Project Offers
-- Anyone can view visible offers (immediate or scheduled and past scheduled time, and within date range)
CREATE POLICY "Anyone can view visible offers"
  ON public.project_offers FOR SELECT
  USING (
    (schedule_visibility = 'immediate' OR
     (schedule_visibility = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= NOW())) AND
    NOW() >= start_datetime AND NOW() <= end_datetime
  );

-- Admins can view all offers
CREATE POLICY "Admins can view all offers"
  ON public.project_offers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_offers.project_id AND
      projects.created_by = auth.uid()
    )
  );

-- Only admins can create offers (for now)
CREATE POLICY "Only admins can create offers"
  ON public.project_offers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) AND
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_offers.project_id
    )
  );

-- Users can update their own offers, admins can update any
CREATE POLICY "Users can update own offers or admin can update any"
  ON public.project_offers FOR UPDATE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can delete their own offers, admins can delete any
CREATE POLICY "Users can delete own offers or admin can delete any"
  ON public.project_offers FOR DELETE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Project Events
-- Anyone can view visible events (immediate or scheduled and past scheduled time)
CREATE POLICY "Anyone can view visible events"
  ON public.project_events FOR SELECT
  USING (
    schedule_visibility = 'immediate' OR
    (schedule_visibility = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= NOW())
  );

-- Admins can view all events
CREATE POLICY "Admins can view all events"
  ON public.project_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_events.project_id AND
      projects.created_by = auth.uid()
    )
  );

-- Only admins can create events (for now)
CREATE POLICY "Only admins can create events"
  ON public.project_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) AND
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_events.project_id
    )
  );

-- Users can update their own events, admins can update any
CREATE POLICY "Users can update own events or admin can update any"
  ON public.project_events FOR UPDATE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can delete their own events, admins can delete any
CREATE POLICY "Users can delete own events or admin can delete any"
  ON public.project_events FOR DELETE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
