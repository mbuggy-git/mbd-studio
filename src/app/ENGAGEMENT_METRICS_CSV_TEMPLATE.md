# Engagement Metrics CSV Import Guide

## Overview
This guide explains how to import Impressions and CTR (Click-Through Rate) data for your YouTube videos.

## Why Import Engagement Metrics?
- **Thumbnail Impressions** and **CTR** are NOT available via ANY YouTube API
- The **YouTube Analytics API** (OAuth) provides watch time and traffic sources for the **last 30 days**, but NOT impressions/CTR
- The **only way** to get impressions/CTR data is through:
  1. Manual CSV import from YouTube Studio (described below)

## CSV Format

### Required Format
Your CSV file must have exactly **4 columns** in this order:

```csv
videoId,title,impressions,ctr
dQw4w9WgXcQ,My Video Title,12500,8.5
aB3cD4e5F6g,Another Video,8200,6.2
xY9zW8v7U6t,Third Video,5300,4.1
```

### Column Descriptions
1. **videoId** - The 11-character YouTube video ID (e.g., `dQw4w9WgXcQ`)
2. **title** - The video title (for your reference)
3. **impressions** - Number of times your thumbnail was shown (integer)
4. **ctr** - Click-through rate as a percentage (e.g., `8.5` for 8.5%)

### Important Notes
- The first row should be the header: `videoId,title,impressions,ctr`
- Video must already exist in your database (sync from YouTube first)
- If a video is not found, it will be skipped with a warning
- CTR can include or exclude the `%` symbol - both work

## How to Get This Data from YouTube Studio

### Method 1: Manual Entry
1. Go to YouTube Studio → Analytics
2. Click on each video to see impressions and CTR
3. Create a CSV file with the format above

### Method 2: Export and Format
1. Go to YouTube Studio → Analytics → Content
2. Click the download icon to export CSV
3. The YouTube export has many columns - you'll need to extract:
   - Column A: Video ID (usually labeled "Content" or "Video")
   - Column B: Video title
   - Find "Impressions" column (usually around column E)
   - Find "CTR" column (usually around column F)
4. Copy these 4 columns into a new CSV file
5. Add the header row: `videoId,title,impressions,ctr`
6. Save and import

## How to Import

1. Make sure your videos are already in the database (click "Sync from YouTube" first)
2. Click the **"Import Engagement"** button (green button with trending icon)
3. Select your CSV file
4. The system will:
   - Match videos by ID
   - Add engagement metrics as an analytics snapshot
   - Skip any videos not found in your database
   - Show you a summary of what was imported

## Example CSV Template

Save this as `engagement_metrics.csv`:

```csv
videoId,title,impressions,ctr
rUEQgg1nh48,How to Use ChatGPT for Coding,15234,7.8
abc123XYZ99,My Tutorial Video,8567,5.4
def456UVW88,Another Great Video,12890,9.2
```

## Troubleshooting

### "Video not found in database"
- Make sure you've synced your videos from YouTube first
- Check that the video ID is correct (11 characters)
- The video might have been deleted or made private

### "Invalid data"
- Make sure impressions is a number (no commas: use `12500` not `12,500`)
- CTR can be a decimal (e.g., `8.5` for 8.5%)
- Check for missing columns or extra commas

### "Failed to import"
- Check the browser console (F12) for detailed error messages
- Verify your CSV file format matches the template exactly
- Make sure there are no special characters or formatting issues

## About YouTube Analytics API

The **"Connect Analytics"** button provides:
- ✅ Watch time and average view duration (last 30 days)
- ✅ Traffic sources
- ❌ **NOT** impressions or CTR (these are not available via API)

For impressions/CTR, you **must** use the CSV import method described above.
