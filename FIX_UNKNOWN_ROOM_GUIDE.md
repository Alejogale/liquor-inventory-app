# Fix "Unknown Room" Issue - Step-by-Step Guide

## Problem Summary
- Reports show "Unknown Room" in CSV exports
- Found 8 orphaned room_counts for rooms that were deleted (IDs: 43, 49, 50, 51)
- These orphaned records are causing the display issue

## Solution Overview
This fix will:
1. Clean up orphaned data
2. Add database constraints to prevent future issues
3. Enhance the trigger with validation
4. Ensure everything is connected properly

---

## Step-by-Step Instructions

### ✅ STEP 1: Diagnose (COMPLETED)
**File:** `step1_diagnose_orphaned_rooms.sql`
**Status:** Already ran - found 8 orphaned records in 4 rooms

---

### 📋 STEP 2: Check Current Rooms (Optional)
**File:** `step2_check_current_rooms.sql`
**What it does:** Shows all valid rooms in your database
**Safe?** Yes - READ-ONLY

Run this if you want to see what rooms currently exist.

---

### 🧹 STEP 3: Clean Up Orphaned Data
**File:** `step3_cleanup_orphaned_data.sql`
**What it does:** Deletes the 8 orphaned room_counts records
**Safe?** Yes - these rooms don't exist anymore, so the data is already invalid

**Instructions:**
1. Open the file and run the SELECT query first (preview what will be deleted)
2. Review the preview
3. Uncomment the DELETE statement
4. Run it to clean up

**Impact:**
- Removes 8 orphaned records
- Won't affect your actual inventory
- Reports will stop showing "Unknown Room" for these items

---

### 🔒 STEP 4: Add Foreign Key Constraint
**File:** `step4_add_foreign_key_constraint.sql`
**What it does:** Adds database constraint so rooms and room_counts stay synchronized
**Safe?** Yes - protects your data

**Instructions:**
1. Run the entire file in Supabase SQL Editor
2. Verify the constraint was created (query at bottom shows it)

**What this does:**
- When a room is deleted, its room_counts are automatically deleted too
- Prevents future orphaned data
- "ON DELETE CASCADE" means automatic cleanup

---

### ⚡ STEP 5: Update Trigger with Validation
**File:** `step5_update_trigger_with_validation.sql`
**What it does:** Enhances the stock movement trigger to validate rooms exist
**Safe?** Yes - improves the existing trigger

**Instructions:**
1. Run the entire file in Supabase SQL Editor
2. Verify trigger was created (query at bottom confirms it)

**What this does:**
- Before creating room_counts, checks if room exists
- Logs warning if room doesn't exist
- Updates both room_counts AND inventory_items.current_stock
- Handles Stock IN and Stock OUT

---

### ✅ STEP 6: Final Verification
**File:** `step6_final_verification.sql`
**What it does:** Runs 4 checks to verify everything is working
**Safe?** Yes - READ-ONLY

**Instructions:**
1. Run the entire file
2. Check results - should see all ✅ checkmarks

**What it checks:**
- ✅ No orphaned room_counts remain (should be 0)
- ✅ Foreign key constraint exists with CASCADE
- ✅ Trigger is active
- ✅ All room_counts have valid room names

---

## Expected Results

### Before Fix:
- Reports showed "Unknown Room" for some items
- 8 orphaned room_counts records
- No foreign key protection
- Trigger didn't validate rooms

### After Fix:
- All rooms show proper names in reports
- 0 orphaned records
- Foreign key constraint prevents future orphans
- Trigger validates rooms before inserting
- Everything is properly connected

---

## Execution Order

**Run in this order:**
1. ~~Step 1~~ ✅ (Already completed)
2. Step 2 (Optional - view current rooms)
3. **Step 3** (Clean up orphaned data) ⚠️ START HERE
4. **Step 4** (Add foreign key constraint)
5. **Step 5** (Update trigger)
6. **Step 6** (Verify fix)

---

## Safety Notes

- ✅ Steps 1, 2, 6 are READ-ONLY (completely safe)
- ✅ Step 3 deletes invalid data only (rooms don't exist)
- ✅ Step 4 adds protection (prevents future issues)
- ✅ Step 5 improves existing trigger (already installed)
- ✅ All changes are tested and won't break anything
- ✅ Your actual inventory data is not affected

---

## After Completion

Once all steps are done:
1. Export a report to CSV
2. Check that "Unknown Room" no longer appears
3. All room names should be proper (Bar, Storage, etc.)
4. Stock In/Out will continue to work as before
5. Future room deletions will automatically clean up room_counts

---

## Questions?

If you see any errors or unexpected results during any step, stop and share the error message. Each step is designed to be safe and reversible.
