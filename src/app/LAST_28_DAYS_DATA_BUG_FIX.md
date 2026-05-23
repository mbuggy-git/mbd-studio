# Last 28 Days Data Bug Fix - November 5, 2025

## Problem Summary

When viewing "Last 28 Days" data, the application was showing **incorrect view counts** that didn't match YouTube Analytics. For example:
- YouTube showed: **525 views** (last 28 days)  
- App showed: **1,143 views** (labeled as "28 day" snapshot)

This was causing **all 28-day snapshots to have wrong data**.

## Root Causes

### Bug #1: CSV Importer Using Lifetime Data for 28-Day Snapshots
**File:** `/components/EngagementMetricsImporter.tsx`

When importing 28-day reach metrics (Impressions/CTR) from CSV, the code was:
```javascript
views: video.currentViews,  // ❌ BUG: This is LIFETIME data!
likes: video.currentLikes,
comments: video.currentComments,
```

Even though the snapshot was labeled `dateRange: 'last28'`, it was saving LIFETIME views/likes/comments instead of actual 28-day data.

**Fix:** Now fetches actual 28-day data from YouTube Analytics API before creating the snapshot:
```javascript
const analyticsResponse = await fetch(
  `...analytics/${videoId}?dateRange=last28`,
  ...
);
if (analyticsResponse.ok) {
  const analyticsData = await analyticsResponse.json();
  viewsForSnapshot = analyticsData.analytics.views; // ✅ Actual 28-day data
  likesForSnapshot = analyticsData.analytics.likes;
  commentsForSnapshot = analyticsData.analytics.comments;
}
```

### Bug #2: Realtime Data Override for Last 28 Days
**File:** `/components/VideoDatabase.tsx` (takeSnapshot function)

The code was overriding Analytics API data with realtime data even for "last28" snapshots:
```javascript
if (analyticsData.useRealtimeViews) {
  advancedAnalytics.views = stats.currentViews;  // ❌ BUG: Lifetime data for 28-day snapshot!
}
```

**Fix:** Only use realtime data override for LIFETIME snapshots, never for 28-day snapshots:
```javascript
if (analyticsData.useRealtimeViews && effectiveDateRange === 'sincePublished') {
  // ✅ Only override for lifetime snapshots
  advancedAnalytics.views = stats.currentViews;
} else if (analyticsData.useRealtimeViews && effectiveDateRange === 'last28') {
  // ✅ Keep Analytics API 28-day data, don't override
  console.log("NOT using realtime data because realtime = lifetime, not 28-day");
}
```

### Bug #3: Confusing Snapshot Display
**File:** `/components/VideoDatabase.tsx` (Analytics tab)

When viewing "Last 28 Days", the Analytics tab was showing:
- Milestone snapshots (which are lifetime data)
- Mixed with 28-day snapshots
- Creating confusion about which data was which

**Fix:** Now filters out milestone/lifetime snapshots when viewing "Last 28 Days":
```javascript
if (dateRangeFilter === 'sincePublished') {
  // Lifetime view: Show lifetime snapshots AND milestone snapshots
  return !snapshot.dateRange || snapshot.dateRange === 'lifetime';
} else {
  // Last 28 Days view: ONLY show 'last28' snapshots
  return snapshot.dateRange === 'last28';
}
```

## Impact

These bugs affected:
- ✅ **All 28-day snapshots created via CSV import** - Were using lifetime data
- ✅ **"Refresh Analytics" for young videos** - Could have mixed data
- ✅ **Analytics tab display** - Showed confusing mixed snapshots

## How to Fix Existing Bad Data

### Option 1: Delete and Recreate
1. Go to each video's Analytics tab
2. Delete the incorrect 28-day snapshots
3. Make sure date range is set to "Last 28 Days"
4. Click "Refresh Analytics" to create new correct snapshots
5. Re-import reach metrics CSV if needed

### Option 2: Keep and Be Aware
- Old snapshots labeled "28 day" may contain lifetime data
- Look for the snapshot note to identify origin:
  - "28-day reach metrics (Impressions/CTR) imported from CSV" = Likely has wrong views/likes/comments
  - "Auto snapshot" or manual snapshots = Should be correct if created via Refresh Analytics

## Prevention

Going forward, the fixed code ensures:
1. ✅ CSV imports fetch actual 28-day data from Analytics API
2. ✅ Realtime override only applies to lifetime snapshots
3. ✅ Snapshot filtering hides irrelevant snapshots per date range
4. ✅ Enhanced logging to debug any future issues

## Testing

To verify the fix works:
1. Set date range filter to "Last 28 Days"
2. Open a video that's >28 days old
3. Check console logs - should see:
   ```
   📊 Using 28-day API data for "Video Title...":
     views: 525
     snapshotDate: "11/5/2025"
     source: 'YouTube Analytics API (last28 snapshot)'
   ```
4. Compare with YouTube Analytics - numbers should match exactly
5. Import a CSV with 28-day reach metrics - views should match YouTube, not lifetime totals

## Related Files
- `/components/EngagementMetricsImporter.tsx` - CSV import logic
- `/components/VideoDatabase.tsx` - Snapshot creation and display
- `/components/VideoMetricsHelper.tsx` - Metrics calculation
- `/supabase/functions/server/index.tsx` - Server-side Analytics API calls
