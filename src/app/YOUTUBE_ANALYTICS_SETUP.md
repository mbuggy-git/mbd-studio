# YouTube Analytics OAuth Setup

## ✅ Setup Complete

Your YouTube Analytics integration is now ready! Follow these final steps to enable it:

---

## 🔐 Google Cloud Console Configuration

### Step 1: Enable YouTube Analytics API ⚠️ REQUIRED
1. Go to [Enable YouTube Analytics API](https://console.developers.google.com/apis/api/youtubeanalytics.googleapis.com/overview?project=430888277505)
2. Click **"ENABLE"** button
3. Wait 2-3 minutes for it to activate

### Step 2: Access Your OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID: `430888277505-u2rj0hok39fd0nh3t2n83hrkfovosim1.apps.googleusercontent.com`

### Step 3: Add Authorized JavaScript Origins
Add these two origins:
```
https://www.mbd.studio
https://mbd.studio
```

### Step 4: Add Authorized Redirect URIs
Add these two redirect URIs:
```
https://www.mbd.studio/oauth/callback
https://mbd.studio/oauth/callback
```

### Step 5: Save Changes
- Click **SAVE** at the bottom
- Wait 1-2 minutes for changes to propagate

---

## 🚀 How to Use

### Connecting YouTube Analytics

1. Navigate to the **Video Database** page in your app
2. Click the **"Connect Analytics"** button in the top action bar
3. You'll be redirected to Google to authorize access
4. Grant permissions for YouTube Analytics and YouTube Data API
5. You'll be redirected back to your app with a success message

### Fetching Analytics Data

Once connected, for any video in your database:

1. Click on a video to open its details
2. Navigate to the **Analytics** tab
3. Click **"Add Advanced Metrics"**
4. In the dialog, click **"Auto-Fetch from YouTube Analytics"**
5. The system will automatically populate:
   - Impressions
   - Click-Through Rate (CTR %)
   - Average View Duration
   - Average Percentage Viewed
   - Top Traffic Source
   - Traffic Source Percentage
6. Review the data and click **"Save Snapshot"**

### Disconnecting

Click the green **"Analytics Connected"** button to disconnect at any time.

---

## 📊 What Data is Fetched

The integration fetches the following metrics from YouTube Analytics API for the last 30 days:

- **Views, Likes, Comments** - Basic engagement metrics
- **Impressions** - How many times your thumbnail was shown
- **CTR (Click-Through Rate)** - Percentage of impressions that led to views
- **Average View Duration** - How long viewers watched (in seconds)
- **Average Percentage Viewed** - What % of your video was watched on average
- **Top Traffic Source** - Where your views came from (YouTube Search, Suggested, etc.)
- **Traffic Source Percentage** - What % of views came from the top source

---

## 🔒 Security

- Your OAuth tokens are securely stored in the Supabase backend
- Tokens are automatically refreshed when they expire
- The Client Secret is stored as an environment variable and never exposed to the frontend

---

## ⚠️ Troubleshooting

### "YouTube Analytics API has not been used" or 403 Error
- **You need to enable the YouTube Analytics API first!**
- Go to: [Enable YouTube Analytics API](https://console.developers.google.com/apis/api/youtubeanalytics.googleapis.com/overview?project=430888277505)
- Click the **ENABLE** button
- Wait 2-3 minutes for the API to activate
- Try fetching analytics again

### "redirect_uri_mismatch" Error
- Make sure you've added **both** `www.mbd.studio` and `mbd.studio` URIs
- Verify the URIs match exactly (including `/oauth/callback`)
- Wait 1-2 minutes after saving changes in Google Cloud Console

### "No analytics data available for this video"
- Make sure the video has been published for at least a few days
- The YouTube Analytics API only returns data for videos with some activity
- Try fetching data for a different, more popular video

### Connection Status Shows "Not Connected"
- Try refreshing the page
- Check if you completed the OAuth flow
- Try disconnecting and reconnecting

---

## 📝 Notes

- Analytics data is fetched for the **last 30 days** by default
- You can still manually enter analytics data if auto-fetch doesn't work for a specific video
- The connection persists across sessions - you only need to connect once
- Each time you fetch analytics, it creates a new snapshot in your video's history
