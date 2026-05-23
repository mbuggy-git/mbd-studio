# Engagement Data Protection

## Overview
This document explains how your manually imported engagement metrics (impressions, CTR) are protected from being overwritten by automated analytics refreshes.

## The Problem
- **YouTube Analytics API does NOT provide impressions or CTR data** - these metrics are only available through YouTube Studio
- When you click "Refresh Analytics", the system fetches analytics from the YouTube API
- Without protection, this could overwrite your manually imported impressions/CTR with `undefined` values

## The Solution
We've implemented **multi-layer protection** to ensure your manually imported engagement data is never lost:

### 1. Client-Side Protection (VideoDatabase.tsx)
All functions that create analytics snapshots now check if impressions/CTR have actual values before sending them:

```typescript
// Only add impressions/CTR if they exist
if (data.analytics.impressions !== undefined && data.analytics.impressions !== null) {
  analyticsPayload.impressions = data.analytics.impressions;
}
if (data.analytics.ctr !== undefined && data.analytics.ctr !== null) {
  analyticsPayload.ctr = data.analytics.ctr;
}
```

**Protected Functions:**
- `refreshAllData()` - Refresh Analytics button
- `fetchBulkAnalytics()` - Bulk analytics fetch
- `takeSnapshot()` - Take Analytics Snapshot button
- `createMilestoneSnapshots()` - Auto-milestone snapshots

### 2. Server-Side Protection (index.tsx)
The `/advanced-snapshot` endpoint preserves existing impressions/CTR values when new values are undefined:

```typescript
impressions: impressions !== undefined ? impressions : latestSnapshot?.impressions,
ctr: ctr !== undefined ? ctr : latestSnapshot?.ctr,
```

This means:
- If new impressions/CTR values exist → use them
- If new impressions/CTR are undefined → keep the previous values from the last snapshot

## How It Works

### When You Import Engagement Data (CSV)
1. You export impressions/CTR from YouTube Studio
2. Format it as CSV: `videoId,title,impressions,ctr`
3. Click "Import Engagement" button
4. System creates snapshots with your manually imported data
5. ✅ Data is saved to analytics history

### When You Click "Refresh Analytics"
1. System fetches analytics from YouTube API
2. API returns: views, likes, watch time, traffic sources
3. API does **NOT** return: impressions, CTR (undefined)
4. Client-side check: "Are impressions/CTR defined? No → don't include them in payload"
5. Server receives snapshot **without** impressions/CTR fields
6. Server-side check: "No new impressions/CTR? Keep the existing values from last snapshot"
7. ✅ Your manually imported engagement data is preserved!

## Testing
To verify the protection works:

1. **Import engagement data** for a video (e.g., impressions: 10,000, CTR: 5.5%)
2. View the video details and confirm the data appears in analytics history
3. **Click "Refresh Analytics"** (this fetches from YouTube API which has no impressions/CTR)
4. View the video details again
5. ✅ **Verify**: The new snapshot should still show your original impressions/CTR values

## What Gets Updated vs Protected

### ✅ Always Updated (from YouTube API):
- Views
- Likes
- Comments
- Watch time
- Average view duration
- Traffic sources

### 🛡️ Protected (preserved from manual import):
- Impressions (not in YouTube API)
- CTR (not in YouTube API)

### 🔄 Mixed (depends on data source):
- If you manually enter these values, they're protected
- Average view percentage
- Top traffic source

## Workflow Recommendation

### Weekly Routine:
1. **Monday**: Click "Refresh Analytics" to update views, watch time, traffic sources
2. **Friday**: Export impressions/CTR from YouTube Studio and import via CSV
3. Both datasets coexist peacefully in your analytics history!

### Important Notes:
- Impressions/CTR in YouTube Studio update 24-48 hours behind real-time
- YouTube Analytics API has a 2-3 day delay for watch time metrics
- Your CSV imports are instant and won't be overwritten

## CSV Import Format

```csv
videoId,title,impressions,ctr
rUEQgg1nh48,How to Use Figma,15234,7.8
abc123XYZ99,Photoshop Tutorial,8567,5.4
def456UVW88,Design System Guide,12890,9.2
```

## Troubleshooting

### "My engagement data disappeared!"
- Check the analytics history timeline - it should still be in an earlier snapshot
- The latest snapshot might not show it if it was created before the import
- Solution: Import engagement data again

### "Refresh Analytics created a duplicate snapshot"
- This is expected - each refresh creates a new snapshot with current data
- Your manually imported engagement data is preserved in the new snapshot
- The timeline shows all snapshots chronologically

### "I want to update engagement data"
- Simply import a new CSV with updated values
- This creates a new snapshot with the new impressions/CTR
- Previous snapshots remain unchanged (historical record)

## Summary

**You can safely click "Refresh Analytics" as often as you want** - your manually imported engagement metrics (impressions, CTR) will be preserved thanks to our dual-layer protection system. The system intelligently merges data from multiple sources:
- YouTube Data API → views, likes, comments
- YouTube Analytics API → watch time, traffic sources  
- CSV Import → impressions, CTR (protected)

All data sources contribute to a complete analytics picture without conflicts! 📊✨
