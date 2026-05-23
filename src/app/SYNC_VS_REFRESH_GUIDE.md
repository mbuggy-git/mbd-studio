# Understanding "Sync from YouTube" vs "Refresh Analytics"

## Quick Answer

- **"Sync from YouTube"** → Discovers and adds NEW videos from your channel
- **"Refresh Analytics"** → Updates stats for EXISTING videos already in your database

## Detailed Breakdown

### 🔄 Sync from YouTube

**What it does:**
1. Fetches the complete list of videos from your YouTube channel
2. Compares with your database
3. **Adds any NEW videos** that aren't already tracked
4. Updates basic info (title, description, thumbnail) for existing videos
5. Filters out YouTube Shorts (≤60 seconds)

**When to use:**
- ✅ First time setup (to import all your videos)
- ✅ After publishing a new video (to add it to database)
- ✅ Weekly/monthly to catch any new uploads
- ✅ When you suspect videos are missing from database

**What it fetches (YouTube Data API v3):**
- Video ID
- Title
- Description
- Thumbnail URL
- Publish date
- Duration
- Current views, likes, comments

**API Quota Cost:** ~3-5 units per video

---

### 📊 Refresh Analytics

**What it does:**
1. Takes ALL videos already in your database
2. Fetches fresh stats from YouTube for each one
3. Updates the video records with current numbers
4. **Attempts to fetch advanced analytics** (watch time, traffic sources, etc.)
5. **Creates analytics snapshots** to track changes over time

**When to use:**
- ✅ Daily/weekly to track performance changes
- ✅ After a video has been live for a while
- ✅ To update views/likes/watch time for existing videos
- ✅ To capture analytics snapshots for your history

**What it fetches:**

*From YouTube Data API v3:*
- Current views
- Current likes
- Current comments
- Title/thumbnail updates (if changed)

*From YouTube Analytics API (OAuth required):*
- Watch time
- Average view duration
- Average view percentage
- Top traffic source
- ~~Impressions~~ ❌ NOT AVAILABLE
- ~~CTR~~ ❌ NOT AVAILABLE

**API Quota Cost:** ~1-2 units per video (Data API) + Analytics API calls

---

## Key Differences at a Glance

| Feature | Sync from YouTube | Refresh Analytics |
|---------|------------------|-------------------|
| **Discovers NEW videos** | ✅ Yes | ❌ No |
| **Updates EXISTING videos** | ✅ Yes | ✅ Yes |
| **Creates snapshots** | ❌ No | ✅ Yes |
| **Requires OAuth** | ❌ No | ⚠️ Optional (for advanced analytics) |
| **Filters Shorts** | ✅ Yes | ❌ No (only updates existing) |
| **When nothing in DB** | ✅ Works (imports all) | ❌ Error ("sync first") |
| **Typical frequency** | Weekly/Monthly | Daily/Weekly |

---

## What Happened to Impressions & CTR?

**The Reality:**
- ❌ YouTube Data API v3 → Does NOT provide impressions/CTR
- ❌ YouTube Analytics API → Does NOT provide impressions/CTR via API
- ✅ YouTube Studio UI → ONLY place to get impressions/CTR

**The Solution:**
We implemented **manual CSV import** for engagement metrics:
1. Go to YouTube Studio
2. Export impressions/CTR data
3. Format as CSV: `videoId,title,impressions,ctr`
4. Click "Import Engagement" button
5. System creates snapshots with your engagement data

**Protection:**
- Your manually imported impressions/CTR are **preserved** when you click "Refresh Analytics"
- The system won't overwrite engagement data with undefined values
- Both manual imports and API data coexist peacefully

---

## Recommended Workflow

### 📅 Weekly Routine (Recommended)

**Monday Morning:**
1. Click **"Sync from YouTube"** (if you published new videos last week)
2. Click **"Refresh Analytics"** (to update stats for all videos)

**Friday Afternoon:**
1. Export impressions/CTR from YouTube Studio (last 7/28 days)
2. Click **"Import Engagement"** to add the data
3. Review your analytics in the database

### 📅 Daily Routine (Power Users)

**Every Morning:**
1. Click **"Refresh Analytics"** (to track daily performance)
2. Take manual snapshots for videos you're monitoring closely

**Once a Week:**
1. Import fresh engagement data from YouTube Studio
2. Click **"Sync from YouTube"** to catch new videos

---

## Troubleshooting

### "No videos in database. Click 'Sync from YouTube' first."
- **Cause:** You clicked "Refresh Analytics" but have no videos yet
- **Fix:** Click "Sync from YouTube" first to import your videos

### "Impressions/CTR are missing after refresh"
- **Cause:** These metrics can only be imported from CSV
- **Fix:** This is expected! Import them manually via "Import Engagement"
- **Note:** They should be **preserved** from previous snapshots (not overwritten)

### "Sync didn't add my new video"
- **Check:** Is it a Short? (≤60 seconds are filtered out)
- **Check:** Is it published? (Private/unlisted might not appear)
- **Fix:** Use "Add Video" button to manually add by video ID

### "Refresh is slow / failing"
- **Cause:** API quota exceeded or rate limiting
- **Fix:** Wait a few hours or use "Take Snapshot" for individual videos

---

## API Quota Impact

### YouTube Data API v3 Quota (10,000 units/day)

**Sync from YouTube:**
- Search/list: ~100 units per request
- Video details: 1 unit per video
- **Total for 50 videos:** ~150 units
- **Can sync ~65 times per day** (but you rarely need to)

**Refresh Analytics:**
- Video stats: 1 unit per video
- **Total for 50 videos:** ~50 units
- **Can refresh ~200 times per day** (but once or twice is plenty)

**Import Engagement (CSV):**
- ✅ **0 quota cost** (no API calls, direct upload)

### YouTube Analytics API Quota
- Separate quota from Data API
- More generous limits
- Only used if OAuth connected
- Provides watch time, traffic sources (but not impressions/CTR)

---

## When to Use Each Button

### Use "Sync from YouTube" when:
- 🎬 You published a new video
- 🆕 First time setting up the database
- 🔍 You think videos are missing
- 📅 Once a week as maintenance

### Use "Refresh Analytics" when:
- 📈 You want to track performance changes
- 📊 You want to create analytics snapshots
- 🔄 Daily or weekly to update all stats
- 🎯 Before reviewing video performance

### Use "Import Engagement" when:
- 📥 You exported impressions/CTR from YouTube Studio
- 📊 You want to add engagement metrics to your history
- 🗓️ Once a week or month (as often as you export from Studio)

---

## Summary

Think of it this way:

- **"Sync from YouTube"** = 🔍 Discover new videos
- **"Refresh Analytics"** = 🔄 Update existing videos
- **"Import Engagement"** = 📥 Add impressions/CTR from Studio

All three work together to give you a complete picture of your YouTube analytics! 🎉
