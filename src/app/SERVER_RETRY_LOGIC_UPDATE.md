# Server Retry Logic Update (v2.8.0)

## What Changed

**Fixed YouTube Analytics API 500 errors** by adding automatic retry logic at the server level.

## The Problem

YouTube's Analytics API occasionally returns 500 Internal Server errors:
```json
{
  "error": {
    "code": 500,
    "message": "Internal error encountered.",
    "status": "INTERNAL"
  }
}
```

Previously, the server would immediately return these errors to the frontend, causing:
- Failed CSV imports
- Failed analytics snapshots
- User frustration

## The Solution

### Server-Side Retry Function

Added `retryYouTubeApiCall()` helper function in `/supabase/functions/server/index.tsx`:

```typescript
async function retryYouTubeApiCall(
  url: string,
  options: RequestInit,
  maxRetries = 2,
  initialDelay = 2000
): Promise<Response>
```

**Features:**
- ✅ Automatically retries 500/503 errors
- ✅ Exponential backoff (2s, 4s delays)
- ✅ Only retries temporary errors (not 400, 403, etc.)
- ✅ Detailed console logging
- ✅ No changes needed in frontend code

### All Endpoints Protected

Applied retry logic to **every YouTube API call** in the server:

| Endpoint | Purpose | Protected |
|----------|---------|-----------|
| `/analytics/:videoId` | Get video analytics + traffic | ✅ |
| `/analytics/top-videos` | Top performing videos | ✅ |
| `/analytics/channel/watch-time` | Channel watch time | ✅ |
| `/analytics/historical/:videoId` | Historical milestone data | ✅ |
| `/backfill-snapshots/:videoId` | Backfill 4/7/28 day snapshots | ✅ |
| `/test-impressions/:videoId` | Test impressions endpoint | ✅ |

## How It Works

### Before (No Retry)
```
Frontend → Server → YouTube API (500 error) → Server → Frontend ❌
```

### After (With Retry)
```
Frontend → Server → YouTube API (500 error)
                 ↓ Wait 2s, retry
                 → YouTube API (500 error)
                 ↓ Wait 4s, retry
                 → YouTube API (200 success) ✅
                 → Server → Frontend
```

## Console Output

When a retry occurs, the server logs show:

```
📡 FULL Analytics API URL: https://youtubeanalytics.googleapis.com/v2/reports?...
⚠️ YouTube API temporarily unavailable (500): Internal error encountered.
⏳ Will retry YouTube API call (1/2 attempts so far)...
🔄 YouTube API retry attempt 1/2 after 2000ms delay...
✅ YouTube API call succeeded on retry attempt 1
Analytics API response status: 200
```

## Benefits

### For Users
- 📈 **Higher success rate** for analytics operations
- 🔄 **Automatic recovery** from temporary YouTube issues
- ⏱️ **No manual retries** needed
- 🎯 **Seamless experience** - retries happen in background

### For Developers
- 🛡️ **Centralized error handling** at server level
- 📊 **Better logging** of retry attempts
- 🔧 **Easy to maintain** - one function protects all endpoints
- 🚀 **Reduced network calls** - retries happen server-side

## Impact on Performance

- **Best case**: No impact (successful first try)
- **Retry case**: +2-6 seconds delay (still faster than manual retry)
- **Worst case**: Same as before (all retries fail, returns error)

**Net result**: Significantly better success rate with minimal performance impact.

## Testing

To test the retry logic:
1. Import a reach CSV with videos needing 28-day analytics
2. Watch the server logs in Supabase Edge Function logs
3. Look for retry messages if YouTube API is having issues
4. Verify that imports complete successfully even if initial calls fail

## Configuration

Retry parameters can be adjusted in the `retryYouTubeApiCall()` function:

```typescript
maxRetries = 2,        // Number of retry attempts (default: 2)
initialDelay = 2000    // Initial delay in ms (default: 2000)
// Delay grows exponentially: 2s, 4s, 8s...
```

## When Retries Won't Help

The retry logic **will not retry** these errors (they're not temporary):

- ❌ 400 Bad Request (invalid parameters)
- ❌ 403 Forbidden (API not enabled, quota exceeded)
- ❌ 404 Not Found (video doesn't exist)
- �� 401 Unauthorized (invalid credentials)

For these errors, the server returns them immediately without retry.

## Related Documentation

- `/YOUTUBE_API_ERROR_HANDLING.md` - Comprehensive error handling guide
- `/utils/analyticsRetry.ts` - Frontend retry utility (for direct frontend usage)

## Version History

- **v2.8.0** (Nov 5, 2025) - Added server-side retry logic for all YouTube API calls
- **v2.7.1** - Previous version (no retry logic)
