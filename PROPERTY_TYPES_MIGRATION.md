# Property Types Migration Guide

## Overview
This migration converts the property system from fixed ENUM types to a dynamic table-based system with the following improvements:

1. **Dynamic Property Types**: Admin can now manage property types (House, Apartment, Commercial, Land, etc.) through the UI
2. **Listing Type**: New field to distinguish between "Sale" and "Rent" properties
3. **Backward Compatible**: Old `property_type` column is preserved during migration for safety

## Migration Steps

### 1. Run the Patch SQL
Execute `supabase/property-types-patch.sql` in your Supabase SQL editor:
- Creates `property_types` table
- Adds `listing_type` enum (sale/rent)
- Adds new columns to `properties` table
- Migrates existing data
- Sets up RLS policies

### 2. Verify Migration
- Check that all existing properties have `property_type_id` and `listing_type` set
- Verify property types appear in admin panel at `/admin/property-types`

### 3. Update Application Code
The following files need updates to use the new system:
- Property forms (create/edit)
- Property search/filters
- Property display components

### 4. Complete Cleanup (After Verification)
Once everything works, uncomment steps 10-11 in `property-types-patch.sql` to:
- Drop old `property_type` column
- Drop old `property_type` enum

## New Database Structure

### property_types Table
```sql
- id (UUID)
- name (VARCHAR) - Display name (e.g., "House", "Apartment")
- slug (VARCHAR) - URL-friendly identifier
- description (TEXT)
- icon (TEXT) - Icon name or URL
- display_order (INTEGER)
- is_active (BOOLEAN)
- created_by (UUID)
- created_at, updated_at (TIMESTAMP)
```

### properties Table Changes
```sql
-- New columns
- property_type_id (UUID) - References property_types.id
- listing_type (ENUM) - 'sale' or 'rent'

-- Old column (to be removed after verification)
- property_type (ENUM) - Keep temporarily for rollback
```

## Admin Features

### Property Types Management (`/admin/property-types`)
- Create new property types
- Edit existing types
- Set display order
- Activate/deactivate types
- Delete unused types

### Default Property Types
The migration creates these default types:
1. House - Single-family houses and villas
2. Apartment - Apartments and condos
3. Commercial - Office spaces, retail, and commercial buildings
4. Land - Vacant land and plots

## Data Migration Logic

### Old → New Mapping
```
residential → House (sale)
commercial → Commercial (sale)
land → Land (sale)
rental → Apartment (rent)
```

### Listing Type Assignment
- `rental` → `listing_type = 'rent'`
- All others → `listing_type = 'sale'`
- NULL values → Admin must update manually

## Rollback Plan

If issues occur, run `supabase/property-types-cleanup-patch.sql` to:
- Remove new columns
- Drop property_types table
- Revert to old enum system

## TypeScript Types Updated

### Before
```typescript
export type PropertyType = 'residential' | 'commercial' | 'land' | 'rental'
```

### After
```typescript
export type ListingType = 'sale' | 'rent'

// Property types are now fetched from database
interface PropertyType {
  id: string
  name: string
  slug: string
  // ... other fields
}
```

## Next Steps

1. ✅ Run `property-types-patch.sql`
2. ⏳ Update property forms to use new fields
3. ⏳ Update property search/filters
4. ⏳ Update property display components
5. ⏳ Test thoroughly
6. ⏳ Complete cleanup (drop old columns)

## Files Created/Modified

### New Files
- `supabase/property-types-patch.sql` - Migration script
- `supabase/property-types-cleanup-patch.sql` - Rollback script
- `app/admin/property-types/page.tsx` - Admin management page
- `components/property-type-form.tsx` - Create/edit form
- `components/delete-property-type-button.tsx` - Delete button

### Modified Files
- `supabase/schema.sql` - Updated with new structure
- `supabase/cleanup.sql` - Updated cleanup script
- `types/database.ts` - Updated TypeScript types
- `app/admin/page.tsx` - Added property types link

## Benefits

✅ Flexible property type management
✅ Clear distinction between sale and rent
✅ Admin can add custom types without code changes
✅ Better data organization
✅ Backward compatible migration
✅ Easy rollback if needed
