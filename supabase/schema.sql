-- Akristal Group Limited - Real Estate Marketplace Database Schema
-- PostgreSQL Schema for Supabase
--
-- Authentication & Profile Flow:
-- 1. Registration Flow:
--    - User signs up → Service role (SUPABASE_SERVICE_ROLE_KEY) creates profile → Redirect to verification → After verification → Dashboard
--
-- 2. Login Flow (not verified):
--    - User logs in → If not verified → Redirect to verification → After verification → If no profile → Complete profile page → Dashboard
--
-- 3. Login Flow (verified, no profile):
--    - User logs in → If no profile → Complete profile page (uses authenticated role via RLS policy) → Dashboard
--
-- Profile Creation:
-- - During registration: Uses service role (bypasses RLS) via app/actions/profile.ts createProfile()
-- - During complete-profile: Uses authenticated client (RLS policy "Users can insert own profile" allows this)
-- - Profile creation is handled entirely from the application code, not via database triggers
--

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For spatial/geographic data types

-- NOTE (Storage):
-- The app uploads bank statements to a Supabase Storage bucket named `documents` (see `app/payments/new/page.tsx`).
-- Storage buckets and their policies are not created via this SQL file; create the bucket in the Supabase dashboard.

-- User Roles Enum
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'agent', 'admin');

-- Property Types Enum
CREATE TYPE property_type AS ENUM ('residential', 'commercial', 'land', 'rental');

-- Property Status Enum
CREATE TYPE property_status AS ENUM ('available', 'sold', 'rented', 'pending', 'suspended');

-- Listing Status Enum (for admin approval)
CREATE TYPE listing_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'suspended');

-- Payment Status Enum
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Payment Method Enum
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'card', 'mobile_money', 'other');

-- Users table (extends Supabase auth.users)
-- Must be created before categories since categories references profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  avatar_url TEXT,
  bio TEXT,
  company_name TEXT, -- For agents/sellers
  license_number TEXT, -- For agents
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Categories table (for property categorization)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name or URL
  color TEXT, -- Hex color code
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL, -- For subcategories
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Optional agent
  title TEXT NOT NULL,
  description TEXT,
  property_type property_type NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL, -- Link to category
  status property_status NOT NULL DEFAULT 'available',
  listing_status listing_status NOT NULL DEFAULT 'draft',
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  province TEXT,
  country TEXT DEFAULT 'Rwanda',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_point GEOGRAPHY(POINT, 4326), -- For spatial queries
  
  -- Property Details
  price DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'RWF',
  size_sqm DECIMAL(10, 2), -- Total size in square meters
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking_spaces INTEGER,
  year_built INTEGER,
  
  -- Features & Amenities (stored as JSONB for flexibility)
  amenities JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  
  -- Media
  cover_image_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  video_urls TEXT[] DEFAULT '{}',
  document_urls TEXT[] DEFAULT '{}',
  
  -- Metadata
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT
);

-- Property Favorites (Buyer bookmarks)
CREATE TABLE IF NOT EXISTS public.property_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, property_id)
);

-- Messages/Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(property_id, buyer_id, seller_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Inquiries (Contact requests)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'new', -- new, contacted, closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'RWF',
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  
  -- Bank account details (for bank transfer)
  bank_name TEXT,
  account_number TEXT,
  account_holder_name TEXT,
  bank_statement_url TEXT, -- Uploaded proof
  
  -- Payment provider details (for future card/mobile money)
  provider TEXT,
  provider_transaction_id TEXT,
  provider_response JSONB,
  
  -- Metadata
  description TEXT,
  notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Site Content (for admin-managed static pages)
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL, -- about, contact, support, privacy, terms
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Activity Log (for admin analytics)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- view_property, create_listing, send_message, etc.
  resource_type TEXT, -- property, message, payment, etc.
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_seller_id ON public.properties(seller_id);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON public.properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_category_id ON public.properties(category_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_listing_status ON public.properties(listing_status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties USING GIST(location_point);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_properties_search ON public.properties USING GIN(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(address, ''))
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.property_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON public.property_favorites(property_id);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON public.conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_property_id ON public.conversations(property_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON public.inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer_id ON public.inquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_seller_id ON public.inquiries(seller_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON public.payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Allow authenticated users to insert their own profile (used in complete-profile flow)
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories policies
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all categories" ON public.categories FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Properties policies
CREATE POLICY "Anyone can view approved properties" ON public.properties FOR SELECT 
  USING (listing_status = 'approved' AND status IN ('available', 'pending'));
CREATE POLICY "Sellers can view own properties" ON public.properties FOR SELECT 
  USING (auth.uid() = seller_id);
CREATE POLICY "Agents can view assigned properties" ON public.properties FOR SELECT 
  USING (auth.uid() = agent_id);
CREATE POLICY "Admins can view all properties" ON public.properties FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Sellers can create properties" ON public.properties FOR INSERT 
  WITH CHECK (
    auth.uid() = seller_id AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('seller', 'agent', 'admin')
    )
  );
CREATE POLICY "Sellers can update own properties" ON public.properties FOR UPDATE 
  USING (auth.uid() = seller_id);
CREATE POLICY "Agents can update assigned properties" ON public.properties FOR UPDATE 
  USING (auth.uid() = agent_id);
CREATE POLICY "Admins can update any property" ON public.properties FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Sellers can delete own properties" ON public.properties FOR DELETE 
  USING (auth.uid() = seller_id);
CREATE POLICY "Admins can delete any property" ON public.properties FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.property_favorites FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.property_favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.property_favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Admins can view all conversations" ON public.conversations FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Buyers can create conversations" ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Admins can delete any conversation" ON public.conversations FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Messages policies
CREATE POLICY "Users can view messages in own conversations" ON public.messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );
CREATE POLICY "Users can send messages in own conversations" ON public.messages FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE 
  USING (auth.uid() = sender_id);
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE 
  USING (auth.uid() = sender_id);
CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can delete any message" ON public.messages FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Inquiries policies
CREATE POLICY "Sellers can view inquiries for own properties" ON public.inquiries FOR SELECT 
  USING (auth.uid() = seller_id);
CREATE POLICY "Buyers can view own inquiries" ON public.inquiries FOR SELECT 
  USING (auth.uid() = buyer_id);
CREATE POLICY "Admins can view all inquiries" ON public.inquiries FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Buyers can create inquiries" ON public.inquiries FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers can update inquiries for own properties" ON public.inquiries FOR UPDATE 
  USING (auth.uid() = seller_id);
CREATE POLICY "Admins can update any inquiry" ON public.inquiries FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can delete inquiries" ON public.inquiries FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payments" ON public.payments FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Admins can update any payment" ON public.payments FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Admins can delete payments" ON public.payments FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Site content policies
CREATE POLICY "Anyone can view site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage site content" ON public.site_content FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Activity logs policies
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "System can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update favorites count
CREATE OR REPLACE FUNCTION update_property_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.properties 
    SET favorites_count = favorites_count + 1 
    WHERE id = NEW.property_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.properties 
    SET favorites_count = GREATEST(favorites_count - 1, 0) 
    WHERE id = OLD.property_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_favorites_count AFTER INSERT OR DELETE ON public.property_favorites
  FOR EACH ROW EXECUTE FUNCTION update_property_favorites_count();

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_timestamp AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Mark all messages in a conversation as read for the current user.
-- We use a SECURITY DEFINER function because the recipient is not the sender, and the default RLS
-- policy only allows message updates by the sender.
CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT buyer_id, seller_id INTO conv
  FROM public.conversations
  WHERE id = p_conversation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  -- Allow only participants or admins
  IF auth.uid() <> conv.buyer_id
     AND auth.uid() <> conv.seller_id
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
     )
  THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.messages
  SET is_read = true
  WHERE conversation_id = p_conversation_id
    AND sender_id <> auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_conversation_read(UUID) TO authenticated;

-- Admin helper: set a user's active status (used by admin UI)
CREATE OR REPLACE FUNCTION public.set_user_active(p_user_id UUID, p_is_active BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.profiles
  SET is_active = p_is_active
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_user_active(UUID, BOOLEAN) TO authenticated;

-- Profile creation is handled entirely from the application code:
-- - During registration: app/actions/profile.ts createProfile() uses service role
-- - During profile completion: app/actions/profile.ts completeProfile() uses authenticated role
-- No database triggers are used for profile creation

-- Function to update location_point from latitude/longitude
CREATE OR REPLACE FUNCTION update_property_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_point = ST_SetSRID(
      ST_MakePoint(NEW.longitude, NEW.latitude),
      4326
    )::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_location_point
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW
  WHEN (NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL)
  EXECUTE FUNCTION update_property_location_point();

-- Insert default categories
INSERT INTO public.categories (name, slug, description, display_order, is_active) VALUES
  ('Residential', 'residential', 'Houses, apartments, and residential properties', 1, true),
  ('Commercial', 'commercial', 'Office spaces, retail, and commercial buildings', 2, true),
  ('Land', 'land', 'Vacant land and plots', 3, true),
  ('Rental', 'rental', 'Properties available for rent', 4, true)
ON CONFLICT (slug) DO NOTHING;

