# Analytics Data Cleanup Tool

## Overview

A new "Clean Analytics" button has been added to remove all basic analytics data (views, likes, comments) while preserving reach metrics (impressions, CTR) and advanced analytics. This allows you to start fresh with correct data after fixing the Last 28 Days bug.

## Location

**Header Actions Bar** (Purple section at top)
- Located between "Export CSV" and other action buttons
- Icon: 🗑️ Trash2
- Label: "Clean Analytics"

## What It Does

### AGGRESSIVE Two-Step Cleanup:

**Step 1: Remove Basic Analytics from EVERY Snapshot**
- ✅ Deletes `views` field from ALL snapshots
- ✅ Deletes `likes` field from ALL snapshots  
- ✅ Deletes `comments` field from ALL snapshots
- ⚠️ This happens to EVERY snapshot, even ones with reach data

**Step 2: Delete Empty Snapshots**
- ✅ Deletes snapshots that have NO valuable data left after Step 1
- ✅ Keeps snapshots that still have impressions, CTR, or advanced metrics

### Preserves (if present):
- ✅ Impressions (from CSV imports)
- ✅ CTR % (from CSV imports)
- ✅ Average View Duration
- ✅ Average View Percentage (Retention)
- ✅ Top Traffic Source
- ✅ All Traffic Sources
- ✅ Watch Time estimates

## How to Use

### Step 1: Clean the Data
1. Click "Clean Analytics" button in header
2. Review the confirmation dialog
3. Click "Clean Analytics Data" to confirm
4. Wait for cleanup to complete (shows progress in console)

### Step 2: Rebuild with Correct Data
After cleanup, follow this sequence:

1. **Lifetime Sync**
   - Set date range filter to "Lifetime"
   - Click "YouTube Sync"
   - This fetches current lifetime stats for all videos

2. **Last 28 Days Sync**
   - Set date range filter to "Last 28 Days"
   - Click "YouTube Sync"
   - This fetches correct 28-day stats for all videos

3. **Backfill Milestones**
   - Click "Backfill Snapshots 4/7/28"
   - This creates historical snapshots at 4, 7, and 28 days after publish

4. **Re-import Reach Data** (Optional)
   - If you had CSV-imported reach metrics, re-import them
   - Click "Import Reach" and select your CSV file
   - Choose the appropriate date range (Lifetime or Last 28 Days)

## Dialog Details

The cleanup dialog shows:
- **Warning** (Orange): What will be removed/deleted
- **Next Steps** (Blue): What to do after cleanup
- **Statistics**: Number of videos and snapshots affected

## Technical Details

### Function: `cleanupBasicAnalytics()`
**Location:** `/components/VideoDatabase.tsx` (lines ~4900-4990)

**Logic:**
```typescript
For each video:
  // Step 1: Clean ALL snapshots
  For each snapshot in video.analyticsHistory:
    → Delete snapshot.views (if exists)
    → Delete snapshot.likes (if exists)
    → Delete snapshot.comments (if exists)
    → Count fields removed
  
  // Step 2: Filter out empty snapshots
  Keep snapshot only if it has:
    - impressions OR
    - ctr OR
    - averageViewDuration OR
    - averageViewPercentage OR
    - topTrafficSource OR
    - allTrafficSources OR
    - totalWatchTimeMinutes
  
  Otherwise: Delete the entire snapshot
```

**API Call:**
```
PUT /videos/{videoId}/analytics-history
Body: { analyticsHistory: [cleaned snapshots] }
```

### What Gets Deleted Completely
Snapshots that have:
- ❌ Only views, likes, comments
- ❌ No impressions or CTR
- ❌ No advanced analytics (watch time, traffic, retention)
- ❌ No milestone markers

### What Gets Cleaned But Kept
Snapshots that have:
- ✅ Impressions or CTR (reach data)
- ✅ Average view duration or percentage
- ✅ Traffic source data
- ✅ All traffic sources array

The views/likes/comments are removed from these snapshots, but the snapshot itself is preserved.

## Console Output

During cleanup, you'll see detailed logs:
```
🧹 Starting AGGRESSIVE basic analytics cleanup...
  - Step 1: Remove views, likes, comments from EVERY snapshot
  - Step 2: Delete snapshots that become empty (no reach/advanced data)
  - Step 3: Keep only snapshots with impressions, CTR, or advanced metrics

  📺 "Video Title...":
     - Snapshots before: 5
     - Snapshots deleted: 3
     - Snapshots kept: 2
    🗑️  Deleting empty snapshot from 11/1/2025
    🗑️  Deleting empty snapshot from 11/2/2025
  
  📺 "Another Video...":
     - Snapshots before: 8
     - Snapshots deleted: 6
     - Snapshots kept: 2

✅ Cleanup complete!
  - Videos processed: 15
  - Total fields removed (views/likes/comments): 126
  - Total snapshots deleted: 42
  - Videos with preserved reach data: 8
```

## Why This Is Needed

Due to the Last 28 Days bug discovered on Nov 5, 2025:
1. CSV imports were using lifetime data for 28-day snapshots
2. "Refresh Analytics" was mixing data in some cases
3. Some snapshots labeled "last28" actually contain lifetime data

The cleanup tool removes all this potentially incorrect data so you can rebuild with accurate data from YouTube.

## Safety Features

1. **Confirmation Dialog**: Requires explicit user confirmation
2. **Preserves Reach Data**: Never deletes manually imported impressions/CTR
3. **Console Logging**: Detailed logs of what's being removed
4. **No Database Deletion**: Only removes snapshots, never deletes videos
5. **Reversible**: You can rebuild all data from YouTube after cleanup

## Recommendations

- ✅ **DO** use this after discovering incorrect data
- ✅ **DO** follow the 4-step rebuild process after cleanup
- ✅ **DO** check console logs to verify what was removed
- ⚠️ **DON'T** use unless you suspect data issues
- ⚠️ **DON'T** forget to re-import reach CSVs if you had them

## Related Files

- `/components/VideoDatabase.tsx` - Main component with cleanup function
- `/components/EngagementMetricsImporter.tsx` - Fixed CSV importer
- `/LAST_28_DAYS_DATA_BUG_FIX.md` - Details on the bug that was fixed
