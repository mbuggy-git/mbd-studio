# Impressions & CTR: Manual Import Guide

## Overview
Impressions and Click-Through Rate (CTR) data are **NOT available** through the YouTube Analytics API. These metrics can only be viewed in YouTube Studio and must be manually imported into your video database.

## Why Manual Import?
YouTube's Analytics API does not provide access to thumbnail impression data. This data is exclusively available in YouTube Studio. To track impressions and CTR in your database, you need to export this data from YouTube Studio and import it via CSV.

## How It Works

### Automated Analytics (via YouTube Analytics API)
The following metrics are automatically fetched when you click "Refresh Analytics" or take a snapshot with YouTube Analytics connected:
- ✅ Views
- ✅ Likes  
- ✅ Comments
- ✅ Average View Duration
- ✅ Average View Percentage
- ✅ Top Traffic Source
- ✅ Estimated Minutes Watched

### Manual Import Only (via CSV)
The following metrics **must** be manually imported:
- ❌ Impressions (not available via API)
- ❌ CTR (not available via API)

## How to Import Impressions & CTR

1. **Export from YouTube Studio**
   - Go to YouTube Studio Analytics
   - Navigate to the "Reach" tab
   - Export your video data including Impressions and CTR

2. **Prepare CSV File**
   Format your CSV with these columns:
   ```
   videoId, title, impressions, ctr
   ```
   
   Example:
   ```csv
   videoId, title, impressions, ctr
   dQw4w9WgXcQ, "My Amazing Video", 15234, 8.5
   abc123def45, "Another Great Video", 28901, 12.3
   ```

3. **Import in the App**
   - Click the "Import" dropdown in the Video Database
   - Select "Import Engagement Metrics (CSV)"
   - Choose your CSV file
   - The app will create snapshots with impressions/CTR data

## Important Notes

- **No API Access**: YouTube does not provide impressions/CTR through any API endpoint
- **Preserved Data**: Once imported, impressions/CTR data is preserved in your snapshots
- **Separate Tracking**: These metrics are kept separate from automated analytics
- **Manual Updates**: You need to manually re-import whenever you want to update this data

## Benefits of Separation

1. **Prevents Data Loss**: Automated analytics refreshes won't overwrite your manually imported impressions/CTR
2. **Clear Workflow**: You know exactly which metrics come from the API and which require manual input
3. **Flexible Updates**: Update impressions/CTR data on your own schedule without affecting other metrics

## CSV Template

A CSV template is available in `ENGAGEMENT_METRICS_CSV_TEMPLATE.md` for your convenience.
