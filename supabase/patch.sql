-- Members Management System - Database Patch
-- Run this after the main schema.sql

-- Members table (for team/company members page)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  image_url TEXT,
  details TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_members_display_order ON public.members(display_order);
CREATE INDEX IF NOT EXISTS idx_members_is_active ON public.members(is_active);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Members policies
-- Public can view active members
CREATE POLICY "Public can view active members" ON public.members FOR SELECT
  USING (is_active = true);

-- Admins can view all members
CREATE POLICY "Admins can view all members" ON public.members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert, update, or delete members
CREATE POLICY "Admins can insert members" ON public.members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update members" ON public.members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete members" ON public.members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to auto-update updated_at
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert current member data
INSERT INTO public.members (name, role, image_url, details, display_order, is_active)
VALUES
  (
    'Prince Ibunkun Adetayo Oyekunle',
    'Engineer, Developer & Real Estate Innovator',
    'https://bhiaowmjscvgxxbiqzhe.supabase.co/storage/v1/object/public/teams/user2.jpg',
    'Prince Ibunkun Adetayo Oyekunle embodies the synergy between technology and real estate. As a computer/civil engineer and real estate developer, he has carved a unique path that integrates digital innovation with physical development. His work in tech security & guard, home automation, construction, and real estate financing reflects a holistic approach to modern challenges, while his leadership and vision inspire those around him. From his academic roots up to his current stature as a professional of distinction, his journey illustrates the power of versatility, determination, and foresight. In every endeavor, he demonstrates that excellence is not confined to one field but can be achieved across disciplines when driven by passion and purpose. Prince Ibunkun Adetayo Oyekunle is not only a developer and engineer—he is a visionary shaping the future of living and technology.',
    1,
    true
  ),
  (
    'Dr. Valentino Heavens (Ph.D Honoris Causa, B.TECH, DFCILMMD, FIMC, NBDSP, CMS, CMC®, CIL)',
    'Executive Coach & Transformational Leadership Expert',
    'https://bhiaowmjscvgxxbiqzhe.supabase.co/storage/v1/object/public/teams/user1.jpg',
    'Dr. Valentino Heavens is the MD/CEO of Black Belt Global Consulting and the visionary behind the BlackBeltCEO Network. He is a distinguished Executive Coach, Certified Management Consultant (CMC®), and Transformational Leadership Expert with decades of experience empowering businesses and leaders across Africa and beyond. He holds a B.Tech in Computer Science. He is a Fellow of the Institute of Management Consultants (FIMC), Doctoral Research Fellow of The Chartered Institute of Leadership, Manpower and Management Development (DFCILMMD) Nigeria/USA, Certified Management Specialist (CMS) from London Graduate School, a Fellow of The Academy of Management Executives (AME-USA), Faculty Member at Kaduna Business School (Nigeria), and a licensed National BDSP. Dr. Heavens brings an uncommon blend of strategic insight, leadership development, and spiritual clarity to organizational transformation.',
    2,
    true
  )
ON CONFLICT DO NOTHING;
