# Last 28 Days Date Range Fix - October 28, 2025

## Problem Identified

The "Last 28 Days" filter was showing **75 views** instead of the correct **84 views** shown in YouTube Studio.

### Root Cause

The YouTube Analytics API was requesting the **wrong date range**:

**OLD (Buggy) Logic:**
- Calculated: 31 days ago to 3 days ago
- Example: Sept 27 to Oct 25 (trying to account for API delay)
- **Result**: Missing 3 days of recent data

**YouTube Studio's "Last 28 Days":**
- Actually: 28 days ago to yesterday  
- Example: Sept 30 to Oct 27
- **Difference**: 9 views (84 - 75 = 9) from the 3-day offset

## What Was Fixed

### 1. Date Range Calculation (Server: `/supabase/functions/server/index.tsx`)

**Before:**
```typescript
// Wrong: 31 days ago to 3 days ago
const endDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)...
const startDate = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000)...
```

**After:**
```typescript
// Correct: 28 days ago to yesterday (matches YouTube Studio)
const endDate = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)... // yesterday
const startDate = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000)... // 28 days ago
```

### 2. Realtime Data Override Logic

**Before:**
- Used realtime data for ANY video ≤31 days old in "last28" mode ❌
- This caused old videos to show incorrect "last28" data

**After:**
- "Last 28 Days" mode: **ALWAYS** uses Analytics API data ✅
- "Lifetime" mode: Uses realtime current data (since Analytics only goes to yesterday) ✅

## Expected Results

After taking a new snapshot:

### For "Last 28 Days" Filter:
- ✅ Should now match YouTube Studio's "Last 28 days" metric exactly
- ✅ Date range: 28 days ago to yesterday
- ✅ No more discrepancies from date offset

### For "Lifetime/Since Published" Filter:
- ✅ Uses current realtime data for views/likes/comments
- ✅ Uses Analytics API for advanced metrics (watch time, retention, traffic sources)
- ✅ Most accurate representation of total performance

## Testing Instructions

1. **Delete existing "last28" snapshots** for the test video
2. **Take a new snapshot** using "Last 28 Days" mode
3. **Compare** the snapshot data with YouTube Studio's "Last 28 days" metric
4. **They should now match** (within 1-2 views due to Studio's real-time updates)

## Technical Notes

- YouTube Studio shows data up to "yesterday" (not including today) for historical metrics
- The Analytics API does NOT have a 2-3 day delay for most metrics (that was a misunderstanding)
- The 1-day delay is intentional - YouTube processes analytics data daily
- Traffic source data uses the same corrected date range automatically

## Files Modified

- `/supabase/functions/server/index.tsx` - Date range calculation and realtime override logic
