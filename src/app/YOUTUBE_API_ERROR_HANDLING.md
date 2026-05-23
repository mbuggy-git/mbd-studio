# YouTube API Error Handling & Retry Logic

## Overview

The application now includes robust error handling for YouTube Analytics API calls, with automatic retry logic for temporary failures (500/503 errors).

## Problem

YouTube's Analytics API occasionally returns 500 Internal Server errors:

```json
{
  "error": {
    "code": 500,
    "message": "Internal error encountered.",
    "errors": [
      {
        "message": "Internal error encountered.",
        "domain": "global",
        "reason": "backendError"
      }
    ],
    "status": "INTERNAL"
  }
}
```

These are **temporary issues on Google's side** and usually resolve within seconds to minutes.

## Solution

### Automatic Retry with Exponential Backoff

The app now automatically retries failed analytics requests using exponential backoff **at the server level**:

- **Max Retries**: 2 attempts (3 total tries including the initial request)
- **Delays**: 2 seconds, 4 seconds
- **Retryable Errors**: HTTP 500 and 503 status codes only

### How It Works

1. **First Attempt**: Server makes the YouTube Analytics API request
2. **If 500/503 Error**: Server waits 2 seconds, tries again
3. **If Still Failing**: Server waits 4 seconds, tries again
4. **If All Retries Fail**: Server returns error to frontend, which falls back gracefully

**Important**: The retry logic happens on the **server**, not the frontend. This is more efficient because:
- Reduces network round-trips between frontend and server
- Server logs show all retry attempts
- Consistent error handling across all endpoints

### Fallback Behavior

When analytics API calls fail even after retries:

#### During CSV Import
- Falls back to **lifetime data** for views/likes/comments
- Still imports impressions and CTR from the CSV
- Logs a warning in console
- Import continues successfully

#### During Snapshots
- Creates snapshot with basic metrics (views, likes, comments)
- Advanced metrics are skipped
- User is notified via toast message

## Implementation Details

### Server-Side Retry Function

The retry logic is implemented in `/supabase/functions/server/index.tsx` via the `retryYouTubeApiCall()` helper function:

```typescript
const analyticsResponse = await retryYouTubeApiCall(
  analyticsUrl.toString(),
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);
```

This function wraps ALL YouTube Analytics API calls throughout the server, including:
- Video analytics endpoint (`/analytics/:videoId`)
- Traffic source data
- Historical/milestone snapshots
- Backfill operations
- Top videos endpoint
- Channel watch time

### Frontend Utilities

For direct frontend usage (rare), utilities are available at `/utils/analyticsRetry.ts`:

```typescript
import { fetchAnalyticsWithRetry, parseAnalyticsResponse } from '../utils/analyticsRetry';

const response = await fetchAnalyticsWithRetry(url, token);
const result = await parseAnalyticsResponse(response);
```

## Console Logging

The retry logic provides detailed **server-side** console logs (visible in Supabase Edge Function logs):

```
📡 FULL Analytics API URL: https://youtubeanalytics.googleapis.com/v2/reports?...
⚠️ YouTube API temporarily unavailable (500): Internal error encountered.
⏳ Will retry YouTube API call (1/2 attempts so far)...
🔄 YouTube API retry attempt 1/2 after 2000ms delay...
⚠️ YouTube API temporarily unavailable (500): Internal error encountered.
⏳ Will retry YouTube API call (2/2 attempts so far)...
🔄 YouTube API retry attempt 2/2 after 4000ms delay...
✅ YouTube API call succeeded on retry attempt 2
Analytics API response status: 200
```

**Frontend logs** will show the final result:
```
📊 Fetching ACTUAL 28-day data from YouTube Analytics API...
✅ Using 28-day data from API: 1234 views, 56 likes, 12 comments
```

## User Experience

### During CSV Import

Users see:
1. **Info Toast**: "Importing reach metrics... This may take a moment. Temporary YouTube API errors will be automatically retried."
2. **Success Toast**: "✅ Imported reach metrics for X video(s)"
3. **Console Logs**: Detailed information about retries and fallbacks

### During Analytics Refresh

Users see:
1. Progress indicators
2. Toast notifications for temporary failures
3. Detailed console logs for debugging

## When to Worry

### ✅ Normal (Don't Worry)
- Single 500 error that resolves on retry
- Occasional API unavailability
- Fallback to lifetime data during import

### ⚠️ Attention Needed
- Persistent 500 errors for >30 minutes
- All videos failing consistently
- 403 errors (API not enabled or quota exceeded)

## Related Error Types

### 500 Internal Server Error
- **Cause**: Temporary YouTube API issue
- **Action**: Automatic retry with fallback
- **User Action**: None needed, may retry manually after 30-60 minutes

### 503 Service Unavailable
- **Cause**: YouTube API maintenance or overload
- **Action**: Automatic retry with fallback
- **User Action**: Wait 30-60 minutes, try again

### 403 Forbidden
- **Cause**: API not enabled or quota exceeded
- **Action**: Return error to user
- **User Action**: Enable API or wait for quota reset

### 400 Bad Request
- **Cause**: Invalid parameters (e.g., video too new)
- **Action**: Return error to user
- **User Action**: Check video age and date range

## Best Practices

1. **Check Console Logs**: Always check browser console for detailed error information
2. **Don't Panic on 500s**: These are usually temporary
3. **Use Manual Entry**: If API is consistently failing, use "Add Advanced Data" to manually enter metrics
4. **Check YouTube Status**: Visit [YouTube API Status](https://www.google.com/appsstatus) if issues persist
5. **Wait Before Retry**: If manual retry is needed, wait 30-60 minutes for best results

## Configuration

Retry settings can be adjusted in `/utils/analyticsRetry.ts`:

```typescript
const options: RetryOptions = {
  maxRetries: 2,        // Number of retry attempts
  initialDelayMs: 2000, // Initial delay in milliseconds
  maxDelayMs: 8000      // Maximum delay between retries
};
```

## Files Modified

- `/supabase/functions/server/index.tsx` - **Added `retryYouTubeApiCall()` function** and applied it to all YouTube API calls
- `/utils/analyticsRetry.ts` - Frontend retry utility (created, for rare direct frontend usage)
- `/components/EngagementMetricsImporter.tsx` - Uses frontend retry utility for CSV import fallback
- `/components/VideoDatabase.tsx` - Added user-friendly toast messages

### All Server Endpoints Now Protected

Every YouTube Analytics API call in the server now has automatic retry:
- ✅ GET `/analytics/:videoId` - Video analytics with traffic sources
- ✅ GET `/analytics/top-videos` - Top performing videos
- ✅ GET `/analytics/channel/watch-time` - Channel watch time
- ✅ POST `/analytics/historical/:videoId` - Historical milestone data
- ✅ POST `/backfill-snapshots/:videoId` - Backfill 4/7/28 day snapshots
- ✅ GET `/test-impressions/:videoId` - Test impressions endpoint

## Future Improvements

Potential enhancements:
- Circuit breaker pattern to prevent cascading failures
- Rate limiting awareness
- Batch retry with jitter to avoid thundering herd
- User-configurable retry settings
- Retry queue for failed requests
