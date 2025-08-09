# 🎯 LIQUOR INVENTORY APP - TRACKING FILE
**Last Updated**: December 19, 2024
**Purpose**: Critical tracking document to prevent issues and maintain app stability

## ⚠️ CRITICAL - READ FIRST
This file tracks all important changes, fixes, and potential problems in the Liquor Inventory App. 
**ALWAYS CHECK THIS FILE BEFORE MAKING CHANGES**

## 🔴 CURRENT STATE SUMMARY

### ✅ Working Features (DO NOT BREAK THESE!)
- User authentication & signup (30-day trial period)
- Organization creation and multitenancy 
- Dashboard with all tabs functional
- Inventory management (CRUD operations)
- Import/Export functionality with CSV
- Room counting interface
- Activity dashboard with enhanced reports
- Admin panel with analytics
- Manager email saving functionality

### ⚠️ Recently Fixed Issues (BE CAREFUL!)
1. **Import Data Component** - Fixed validation and processing
   - Now processes ALL CSV data, not just preview
   - Categories auto-created if missing
   - Suppliers auto-created with default email
   - Proper organization context handling

2. **Organization Context** - Fixed data leakage
   - All components now use organizationId prop
   - Removed hardcoded organization_id: 1 references
   - Proper RLS policies implemented

3. **Color Contrast** - Fixed visibility issues
   - Changed from dark theme to light theme
   - Fixed white text on white backgrounds
   - All modals and components now readable

## 🚨 CRITICAL WARNINGS - DO NOT CHANGE

### 1. Database Schema
```sql
-- DO NOT CHANGE THESE COLUMNS!
organizations: id (UUID), created_by (UUID) -- NOT owner_id!
user_profiles: organization_id (UUID) -- NOT INTEGER!
activity_logs: organization_id (UUID) -- NOT INTEGER!
```

### 2. Import Paths
```typescript
// CORRECT - Use these:
import { useAuth } from '@/lib/auth-context'  // NOT '../app/lib/auth-context'
import { supabase } from '@/lib/supabase'     // NOT '../app/lib/supabase'
```

### 3. Organization Context Pattern
```typescript
// ALWAYS get organization like this:
const getCurrentOrganization = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('user_profiles')  // NOT 'profiles'!
    .select('organization_id')
    .eq('id', user.id)
    .single()
    
  return profile?.organization_id || null
}
```

## 📋 RECENT FIXES & CHANGES

### December 19, 2024
1. **ImportData.tsx Fixes**
   - Fixed: Import only processing preview data (5 items) instead of all data
   - Fixed: Categories not being reused, creating duplicates
   - Fixed: Suppliers failing to create, blocking import
   - Added: Auto-creation of categories and suppliers
   - Added: Better error handling and progress tracking
   
   **Technical Details:**
   - Line 163-175: Changed to store ALL data in `previewData`, not just first 5 rows
   - Line 175: `setPreviewData(allData)` - stores complete dataset
   - Line 176: `validateCSVData(headers, allData)` - validates all data
   - Line 386-556: Process loop iterates through ALL items in previewData
   - Line 399-454: Category auto-creation with retry logic
   - Line 459-499: Supplier auto-creation with default email
   - Debug logs added for troubleshooting (lines 29, 189, 287, 394, etc.)
   
   **Current Debug Points:**
   ```javascript
   // Line 29: Tracks import type changes
   console.log('🔄 ImportData render - activeImportType:', activeImportType)
   
   // Line 186-194: Validation debugging
   console.log('🔍 Validation Debug:', {
     activeImportType,
     currentImportType,
     activeType: activeType?.id,
     // ... validation details
   })
   ```

2. **Enhanced Reports Integration**
   - Merged enhanced reports into Activity tab
   - Added CSV export functionality
   - Added manager email saving to user_profiles
   - Fixed 400 error in complex queries

3. **Dashboard Layout Fixes**
   - Fixed sidebar disappearing when collapsed
   - Fixed scrolling issues hiding content
   - Added proper responsive design

## 🔧 COMMON ISSUES & SOLUTIONS

### Issue: "Cannot read properties of undefined"
**Solution**: Check organizationId prop is passed to component

### Issue: "invalid input syntax for type uuid"
**Solution**: Ensure organization_id is UUID, not integer

### Issue: "User already registered" 
**Solution**: Check for existing profile before creating new one

### Issue: Import fails silently
**Solution**: Check console logs, ensure organization context exists

### Issue: White text on white background
**Solution**: Use text-slate-800 instead of text-white

## ⚠️ POTENTIAL ISSUES TO WATCH

### 1. Import Data Component
- **Issue**: Validation errors when switching import types
  - **Cause**: useEffect re-validates with new type requirements
  - **Fix**: This is expected behavior, validation will update automatically

- **Issue**: "Required field has empty values" error
  - **Cause**: CSV has empty cells in required columns
  - **Fix**: Fill all required fields in CSV before import

- **Issue**: Import creates duplicate categories/suppliers
  - **Cause**: Name mismatch (case sensitive, extra spaces)
  - **Fix**: Use exact names, trim whitespace in CSV

### 2. Organization Context
- **Issue**: Components show no data or wrong organization data
  - **Check**: Is organizationId prop being passed?
  - **Check**: Is getCurrentOrganization() returning correct UUID?
  - **Check**: Are queries using .eq('organization_id', organizationId)?

### 3. Database Errors
- **Issue**: "column does not exist" errors
  - **Common**: 'size' column removed from inventory_items
  - **Common**: 'owner_id' doesn't exist (use 'created_by')
  - **Fix**: Check actual database schema, not assumptions

### 4. Performance Issues
- **Issue**: Import hangs with large CSV files
  - **Cause**: Processing items one by one
  - **Current Limit**: Tested with ~100 items
  - **Workaround**: Split large files into smaller batches

### 5. UI/UX Gotchas
- **Issue**: Sidebar menu button disappears
  - **Status**: FIXED - sidebar now always visible when collapsed
  - **Don't**: Use -translate-x-full
  - **Do**: Use width changes for collapse

- **Issue**: Content hidden below screen
  - **Status**: FIXED - proper scrolling implemented
  - **Key**: overflow-y-auto on main content areas

## 📁 KEY FILE LOCATIONS

### Components (Check these for organization context)
- `/src/components/ImportData.tsx` - Import functionality
- `/src/components/ActivityDashboard.tsx` - Reports & activity
- `/src/components/RoomCountingInterface.tsx` - Room counts
- `/src/components/InventoryTable.tsx` - Main inventory display
- `/src/app/(app)/dashboard/page.tsx` - Main dashboard

### Database Scripts (Run these if needed)
- `comprehensive_database_fix.sql` - Complete schema fix
- `fix_organization_uuid_schema.sql` - UUID migration
- `add_manager_email_column.sql` - Manager email field
- `fix_rls_policies_for_data_access.sql` - Security policies

### Auth & Context
- `/src/lib/auth-context.tsx` - Main auth context (USE THIS ONE!)
- `/src/lib/supabase.ts` - Supabase client

## 🚫 DO NOT DO THESE

1. **NEVER hardcode organization_id: 1**
2. **NEVER use 'profiles' table** (use 'user_profiles')
3. **NEVER remove organizationId props** from components
4. **NEVER change UUID columns to INTEGER**
5. **NEVER use owner_id** (use created_by)
6. **NEVER import from /app/lib/** (use /lib/)
7. **NEVER change trial period** from 30 days without updating all pages

## ✅ TESTING CHECKLIST

Before committing any changes:
- [ ] Dashboard loads without errors
- [ ] Can add new inventory items
- [ ] Can import CSV data (test with 10+ items)
- [ ] Room counting saves properly
- [ ] Reports generate without 400 errors
- [ ] Admin panel accessible to admin users only
- [ ] No data leakage between organizations
- [ ] All text is readable (no color contrast issues)

## 📊 CURRENT STATISTICS

- **Completion**: 98% (39/40 major issues fixed)
- **Trial Period**: 30 days
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with RLS
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4 (light blue theme)

## 🎯 NEXT PRIORITIES

1. **API Endpoints** (Optional)
   - QuickBooks integration
   - Stripe webhooks
   - Email service

2. **Performance** (Optional)
   - Image optimization
   - Bundle size reduction
   - Caching implementation

3. **Features** (Planned)
   - Logo/image uploads
   - Advanced analytics
   - Mobile app

## 💡 IMPORTANT NOTES

### Import Functionality
- CSV must have headers matching field names
- Required fields vary by import type
- Categories/suppliers auto-created if missing
- Import processes ALL rows, not just preview
- **Debug Mode Active**: Console logs show validation and processing details
- **Validation Re-runs**: When switching import types (useEffect hook line 32-41)

**Import Type Requirements:**
- **Inventory**: brand, category_name, supplier_name (required)
- **Suppliers**: name, email (required)
- **Categories**: name (required)
- **Rooms**: name (required)

**Auto-Creation Logic:**
- Categories: Created if not found, retry on failure
- Suppliers: Created with 'imported@example.com' if not found
- Duplicate Check: Items checked before creation to avoid duplicates

### Organization Context
- Every component needs organizationId prop
- Get from user_profiles table, not metadata
- Pass down through component hierarchy
- Check in useEffect hooks

### Color Scheme
- Primary: Blue gradient (from-blue-600 to-purple-600)
- Text: slate-800 on light backgrounds
- Backgrounds: white, blue-50, slate-50
- Avoid: text-white on light backgrounds

### Database Relationships
```
organizations (1) -> (many) user_profiles
organizations (1) -> (many) categories
organizations (1) -> (many) suppliers
organizations (1) -> (many) inventory_items
organizations (1) -> (many) rooms
organizations (1) -> (many) activity_logs
```

## 🔄 UPDATE HISTORY

- **2024-12-19**: Initial tracking file created
- **2024-12-19**: Added import fixes documentation
- **2024-12-19**: Added critical warnings section
- **2024-12-19**: Added common issues & solutions
- **2024-12-19**: Added potential issues section
- **2024-12-19**: Added emergency fixes section

## 🚑 EMERGENCY FIXES

### Quick Recovery Commands

#### 1. Fix Organization UUID Issues
```bash
# Run this if getting UUID errors
psql $DATABASE_URL < fix_organization_uuid_schema.sql
```

#### 2. Fix Missing Manager Email Column
```bash
# If reports fail with manager_email error
psql $DATABASE_URL < add_manager_email_column.sql
```

#### 3. Fix RLS Policies
```bash
# If data not showing or cross-org leakage
psql $DATABASE_URL < fix_rls_policies_for_data_access.sql
```

#### 4. Complete Database Fix
```bash
# Nuclear option - fixes everything
psql $DATABASE_URL < comprehensive_database_fix.sql
```

#### 5. Clear Next.js Cache
```bash
# If seeing old code after changes
rm -rf .next
npm run build
npm run dev
```

#### 6. Reset Import State
```javascript
// Add this to ImportData component if stuck
const resetImport = () => {
  setUploadedFile(null)
  setPreviewData([])
  setValidationErrors([])
  setImportResults(null)
  setIsProcessing(false)
  setImportProgress('')
}
```

### Common SQL Fixes

```sql
-- Fix activity_logs organization_id type
ALTER TABLE activity_logs 
ALTER COLUMN organization_id TYPE UUID USING organization_id::UUID;

-- Add missing foreign keys
ALTER TABLE inventory_items
ADD CONSTRAINT fk_inventory_org 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) ON DELETE CASCADE;

-- Fix user_profiles organization link
UPDATE user_profiles 
SET organization_id = (
  SELECT id FROM organizations 
  WHERE created_by = user_profiles.id
  LIMIT 1
)
WHERE organization_id IS NULL;
```

### Component Quick Fixes

```typescript
// Add to any component missing org context
import { supabase } from '@/lib/supabase'

const [organizationId, setOrganizationId] = useState<string | null>(null)

useEffect(() => {
  const getOrg = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()
      setOrganizationId(data?.organization_id)
    }
  }
  getOrg()
}, [])
```

---

**Remember**: This file is your safety net. Check it before making changes!