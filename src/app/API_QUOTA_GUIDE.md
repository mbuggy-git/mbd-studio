# YouTube API Quota & Error Guide

## Understanding YouTube API Quotas

The YouTube Data API has daily quota limits to prevent abuse. When you hit these limits, you'll need to wait for them to reset.

### Quota Reset Time
- **Daily quota resets:** Midnight Pacific Time (PST/PDT)
- **Time zones:**
  - PST: UTC-8 (Winter)
  - PDT: UTC-7 (Summer)

### What Counts Against Your Quota

Different operations cost different amounts:

| Operation | Quota Cost | What It Does |
|-----------|-----------|--------------|
| Sync from YouTube | ~100-200 units | Fetches channel info + video list + stats |
| Add Video Manually | ~3 units | Fetches single video details |
| Take Snapshot | ~1 unit | Fetches video statistics |
| Check for Updates | ~1 unit per video | Updates video metadata |

**Default daily quota:** 10,000 units per day (for most API keys)

## Common Errors & Solutions

### 1. "YouTube API quota exceeded"

**What it means:** You've used up your daily API quota.

**Solutions:**
- ✅ **Wait until midnight Pacific Time** for quota to reset
- ✅ **Use "Add Video" button** to add individual videos (uses less quota)
- ✅ **Import CSV** from YouTube Studio (doesn't use API quota!)
- ✅ **Work with existing videos** in your database
- ❌ Don't use "Sync from YouTube" or "Check All Updates" when quota is low

### 2. "Analytics API error: Internal error encountered (500)"

**What it means:** Google's Analytics API is experiencing temporary issues on their end.

**Solutions:**
- ✅ **Wait 30-60 minutes** and try again
- ✅ **Use "Take Analytics Snapshot"** for basic stats (views, likes, comments)
- ✅ **Manually add advanced data** using the "Add Advanced Data" button
- ✅ **Import CSV** from YouTube Studio Analytics

### 3. "Failed to fetch videos"

**What it means:** Could be quota exceeded or network issue.

**Solutions:**
- Check if you've exceeded quota
- Check your internet connection
- Verify your API key is still valid
- Try refreshing the page

## Workarounds When Quota is Exceeded

### Option 1: Import Data from YouTube Studio CSV
1. Go to YouTube Studio → Analytics → Content tab
2. Click the download icon at the top-right of the video table
3. Export as CSV
4. Use "Import CSV (Simple)" button in the app
5. **No API quota used!** ✨

### Option 2: Manual Data Entry
1. Use "Add Video" to add videos by ID (low quota cost)
2. Use "Add Advanced Data" in Analytics tab to manually enter metrics
3. Takes more time but doesn't use much quota

### Option 3: Work Offline
1. Export your current database as CSV
2. Work with the data in Excel/Google Sheets
3. Import back when quota resets

## Best Practices

### Daily Routine (Morning)
- Check quota status
- Run "Sync from YouTube" once per day (uses ~100-200 units)
- Use "Fetch All Analytics" if connected (uses ~50-100 units per video)

### Throughout the Day
- Use "Add Video" for individual videos (uses ~3 units each)
- Use "Take Analytics Snapshot" sparingly (uses ~1 unit per video)
- Import CSV for bulk analytics updates (uses 0 quota!)

### When Running Low on Quota
- Stop using "Sync from YouTube"
- Stop using "Check All Updates"
- Switch to CSV imports
- Manually add advanced analytics data

## Increasing Your Quota

If you consistently run out of quota, you can request a quota increase:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Quotas
3. Find "YouTube Data API v3"
4. Click "Edit Quotas"
5. Request an increase (explain your use case)

**Note:** Quota increases are reviewed by Google and may take several days to approve.

## Error Messages Reference

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "quota exceeded" | Daily API limit reached | Wait until midnight PT |
| "quotaExceeded" | Daily API limit reached | Wait until midnight PT |
| "backendError" | Google's servers issue | Wait 30-60 min, try again |
| "Internal error encountered" | Analytics API issue | Use manual data entry |
| "Video not found" | Invalid video ID | Check the video ID is correct |
| "Channel not found" | Invalid channel handle | Verify channel handle in settings |

## Monitoring Your Quota Usage

You can check your quota usage in Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to APIs & Services → Dashboard
4. Click on "YouTube Data API v3"
5. View quota usage graphs

## Questions?

If you continue to experience issues:
1. Check the browser console for detailed error logs
2. Verify your API key is active in Google Cloud Console
3. Ensure the YouTube Data API v3 is enabled
4. Check if billing is enabled on your Google Cloud project (required for higher quotas)
