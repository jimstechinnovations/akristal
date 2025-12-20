-- Akristal Group Limited - Database Cleanup Script
-- WARNING: This script will delete all data and schema objects
-- Use with caution! This is for development/testing purposes only.
--
-- This script drops all database objects in the correct order to avoid dependency errors.
-- Run this before applying schema.sql to ensure a clean slate.

-- Drop all triggers first
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
DROP TRIGGER IF EXISTS update_site_content_updated_at ON public.site_content;
DROP TRIGGER IF EXISTS update_favorites_count ON public.property_favorites;
DROP TRIGGER IF EXISTS update_conversation_timestamp ON public.messages;
-- Note: on_auth_user_created trigger removed from schema (profile creation handled in app code)
-- Keeping drop here to clean up existing databases that might have this trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_location_point ON public.properties;
-- Project management triggers
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_project_updates_updated_at ON public.project_updates;
DROP TRIGGER IF EXISTS update_project_offers_updated_at ON public.project_offers;
DROP TRIGGER IF EXISTS update_project_events_updated_at ON public.project_events;
DROP TRIGGER IF EXISTS update_members_updated_at ON public.members;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_property_favorites_count();
DROP FUNCTION IF EXISTS update_conversation_last_message();
DROP FUNCTION IF EXISTS public.mark_conversation_read(UUID);
DROP FUNCTION IF EXISTS public.set_user_active(UUID, BOOLEAN);
-- Note: handle_new_user() function removed from schema (profile creation handled in app code)
-- Keeping drop here to clean up existing databases that might have this function
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_property_location_point();

-- Drop all policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

DROP POLICY IF EXISTS "Anyone can view approved properties" ON public.properties;
DROP POLICY IF EXISTS "Sellers can view own properties" ON public.properties;
DROP POLICY IF EXISTS "Agents can view assigned properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Sellers can create properties" ON public.properties;
DROP POLICY IF EXISTS "Sellers can update own properties" ON public.properties;
DROP POLICY IF EXISTS "Agents can update assigned properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update any property" ON public.properties;
DROP POLICY IF EXISTS "Sellers can delete own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can delete any property" ON public.properties;

DROP POLICY IF EXISTS "Users can view own favorites" ON public.property_favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.property_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.property_favorites;

DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
DROP POLICY IF EXISTS "Buyers can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can delete any conversation" ON public.conversations;

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can delete any message" ON public.messages;

DROP POLICY IF EXISTS "Sellers can view inquiries for own properties" ON public.inquiries;
DROP POLICY IF EXISTS "Buyers can view own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Buyers can create inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Sellers can update inquiries for own properties" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can update any inquiry" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiries;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update any payment" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;

DROP POLICY IF EXISTS "Anyone can view site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can manage site content" ON public.site_content;

DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;

-- Members policies
DROP POLICY IF EXISTS "Public can view active members" ON public.members;
DROP POLICY IF EXISTS "Admins can view all members" ON public.members;
DROP POLICY IF EXISTS "Admins can insert members" ON public.members;
DROP POLICY IF EXISTS "Admins can update members" ON public.members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.members;

-- Project management policies
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

-- Drop all indexes
DROP INDEX IF EXISTS idx_properties_seller_id;
DROP INDEX IF EXISTS idx_properties_agent_id;
DROP INDEX IF EXISTS idx_properties_category_id;
DROP INDEX IF EXISTS idx_properties_type;
DROP INDEX IF EXISTS idx_properties_status;
DROP INDEX IF EXISTS idx_properties_listing_status;
DROP INDEX IF EXISTS idx_properties_city;
DROP INDEX IF EXISTS idx_properties_price;
DROP INDEX IF EXISTS idx_properties_location;
DROP INDEX IF EXISTS idx_properties_created_at;
DROP INDEX IF EXISTS idx_properties_search;

DROP INDEX IF EXISTS idx_categories_parent_id;
DROP INDEX IF EXISTS idx_categories_slug;
DROP INDEX IF EXISTS idx_categories_display_order;

DROP INDEX IF EXISTS idx_favorites_user_id;
DROP INDEX IF EXISTS idx_favorites_property_id;

DROP INDEX IF EXISTS idx_conversations_buyer_id;
DROP INDEX IF EXISTS idx_conversations_seller_id;
DROP INDEX IF EXISTS idx_conversations_property_id;

DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_messages_created_at;

DROP INDEX IF EXISTS idx_inquiries_property_id;
DROP INDEX IF EXISTS idx_inquiries_buyer_id;
DROP INDEX IF EXISTS idx_inquiries_seller_id;

DROP INDEX IF EXISTS idx_payments_user_id;
DROP INDEX IF EXISTS idx_payments_property_id;
DROP INDEX IF EXISTS idx_payments_status;

DROP INDEX IF EXISTS idx_activity_logs_user_id;
DROP INDEX IF EXISTS idx_activity_logs_action;
DROP INDEX IF EXISTS idx_activity_logs_created_at;

DROP INDEX IF EXISTS idx_members_display_order;
DROP INDEX IF EXISTS idx_members_is_active;

-- Project management indexes
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

-- Disable RLS on all tables before dropping
ALTER TABLE IF EXISTS public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.property_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
-- Project management tables
ALTER TABLE IF EXISTS public.project_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_updates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members DISABLE ROW LEVEL SECURITY;

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS public.members;
DROP TABLE IF EXISTS public.activity_logs;
DROP TABLE IF EXISTS public.site_content;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.inquiries;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.conversations;
DROP TABLE IF EXISTS public.property_favorites;
DROP TABLE IF EXISTS public.properties;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.profiles;
-- Project management tables
DROP TABLE IF EXISTS public.project_events;
DROP TABLE IF EXISTS public.project_offers;
DROP TABLE IF EXISTS public.project_updates;
DROP TABLE IF EXISTS public.projects;

-- Drop custom types
DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS listing_status;
DROP TYPE IF EXISTS property_status;
DROP TYPE IF EXISTS property_type;
DROP TYPE IF EXISTS user_role;
-- Project management types
DROP TYPE IF EXISTS schedule_visibility;
DROP TYPE IF EXISTS project_status;
DROP TYPE IF EXISTS project_type;

-- Note: Extensions are not dropped as they may be used by other schemas
-- If you need to drop extensions, uncomment the following:
-- DROP EXTENSION IF EXISTS "pg_trgm";
-- DROP EXTENSION IF EXISTS "uuid-ossp";

