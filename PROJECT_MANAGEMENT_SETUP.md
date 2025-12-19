# Project Management System - Setup Guide

## Overview
A comprehensive project management system that allows sellers, agents, and admins to create projects and post updates, offers, and events with media support and scheduling controls.

## Database Setup

### 1. Run the Schema
If you're setting up a fresh database, run `supabase/schema.sql` which includes all project tables.

If you're adding to an existing database, run `supabase/patch.sql` to add only the project management tables.

### 2. Storage Bucket
Create a storage bucket named `project-media` in your Supabase dashboard:
- Go to Storage in Supabase dashboard
- Create new bucket: `project-media`
- Set it to public (or configure RLS policies as needed)
- This bucket stores images and videos for project updates, offers, and events

### 3. Database Types
After running the schema, regenerate TypeScript types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

Or use the Supabase dashboard to generate types.

## Features Implemented

### ✅ Projects
- Create, edit, delete projects
- Status management (draft, active, completed, archived)
- Only sellers, agents, and admins can create projects
- Admins can manage all projects

### ✅ Project Updates
- Description field
- Multiple image/video uploads
- Schedule visibility control (immediate, scheduled, hidden)
- Scheduled datetime for delayed visibility

### ✅ Project Offers
- Title and description
- Multiple image/video uploads
- Start and end datetime
- Schedule visibility control
- Only visible when within date range and scheduled time has passed

### ✅ Project Events
- Title and description
- Multiple image/video uploads
- Start and end datetime
- Schedule visibility control

### ✅ Navigation
- "Projects" link in navbar when logged out
- "Projects" in "More" dropdown when logged in

### ✅ Permissions
- **Public users**: Can view active projects and visible content
- **Admins**: Can create, edit, delete projects and all content (updates/offers/events)
- **Note**: Currently only admins can manage projects. Sellers and agents will be enabled later.

## Pages Created

1. `/projects` - Projects listing page
2. `/projects/[id]` - Project detail page with updates/offers/events
3. `/projects/new` - Create new project
4. `/projects/[id]/edit` - Edit project

## Components Created

1. `components/project-form.tsx` - Project creation/editing form
2. `components/project-update-form.tsx` - Add update form with media uploads
3. `components/project-offer-form.tsx` - Add offer form with media uploads
4. `components/project-event-form.tsx` - Add event form with media uploads
5. `components/delete-project-item-button.tsx` - Delete button for updates/offers/events

## Server Actions

All CRUD operations are in `app/actions/projects.ts`:
- `createProject()` - Create new project
- `updateProject()` - Update existing project
- `deleteProject()` - Delete project
- `createProjectUpdate()` - Add update to project
- `createProjectOffer()` - Add offer to project
- `createProjectEvent()` - Add event to project
- `deleteProjectUpdate()` - Delete update
- `deleteProjectOffer()` - Delete offer
- `deleteProjectEvent()` - Delete event

## Usage

### Creating a Project
1. Navigate to `/projects/new` (requires admin role)
2. Fill in title, description, and status
3. Submit to create project

### Adding Content to Projects
1. Navigate to a project detail page (`/projects/[id]`)
2. If you're an admin, you'll see three forms:
   - Add Update
   - Add Offer
   - Add Event
3. Fill in the form, upload media (optional), set schedule visibility
4. Submit to add content

### Managing Content
- Only admins can create, edit, and delete projects and all content
- Delete buttons appear on each item for admins

## Schedule Visibility

- **Immediate**: Content is visible right away
- **Scheduled**: Content becomes visible at the specified `scheduled_at` datetime
- **Hidden**: Content is not visible to public (only to project owners/admins)

## Notes

- Media files are uploaded to `project-media` storage bucket
- RLS policies automatically filter visible content based on schedule visibility
- Offers are only visible when current datetime is between start and end datetime
- All datetime fields use ISO format and are stored in UTC
