# YouTube Analytics OAuth Troubleshooting Guide

## Error: "invalid_client" / "Unauthorized"

This error means there's a mismatch between your app's OAuth configuration and what's set up in Google Cloud Console.

---

## ✅ Step-by-Step Fix

### 1. **Get Your Exact Redirect URI**

Your app is running at: `https://www.mbd.studio`

Your **exact** redirect URI must be:
```
https://www.mbd.studio/oauth/callback
```

⚠️ **IMPORTANT**: This must match EXACTLY:
- Include `https://` (not `http://`)
- Include `www.` if your domain uses it
- Include `/oauth/callback` at the end
- NO trailing slash

---

### 2. **Configure Google Cloud Console**

#### A. Go to Credentials Page
1. Visit: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click on it to edit

#### B. Add the Redirect URI
1. Scroll to **"Authorized redirect URIs"**
2. Click **"+ ADD URI"**
3. Paste: `https://www.mbd.studio/oauth/callback`
4. Click **"SAVE"** at the bottom

#### C. Copy Your Client Secret
1. While still on that page, find **"Client secret"**
2. Click the copy icon to copy it
3. Keep this secret safe - you'll need it in step 3

---

### 3. **Enter Client Secret in Your App**

1. Go to your Video Database page
2. A popup will appear asking for `YOUTUBE_OAUTH_CLIENT_SECRET`
3. Paste the Client Secret you copied from step 2C
4. Submit

---

### 4. **Add Test User (If Not Done)**

1. In Google Cloud Console, go to: https://console.cloud.google.com/apis/credentials/consent
2. Click the **"Audience"** tab
3. Under **"Test users"**, click **"+ ADD USERS"**
4. Enter your Google email (the one that owns your YouTube channel)
5. Click **"SAVE"**

---

### 5. **Verify OAuth Consent Screen Settings**

1. Still on the OAuth consent screen page
2. Click **"Overview"** tab
3. Verify:
   - ✅ Publishing status: **Testing** (NOT published)
   - ✅ User type: **External**
   - ✅ Your email is in the test users list

---

### 6. **Test the Connection**

1. Go back to your Video Database page
2. Click **"Connect Analytics"**
3. Sign in with the Google account you added as a test user
4. You may see: *"Google hasn't verified this app"*
   - This is normal for Testing mode
   - Click **"Advanced"** → **"Go to mbd.studio (unsafe)"**
5. Grant the requested permissions
6. You should be redirected back with "Analytics Connected ✓"

---

## 🔍 Common Issues

### Issue: "Access blocked: App not verified"
**Solution**: Make sure your email is added as a test user (see step 4)

### Issue: "Redirect URI mismatch"
**Solution**: The redirect URI in Google Console must EXACTLY match `https://www.mbd.studio/oauth/callback`

### Issue: "invalid_client"
**Solution**: 
- Verify the Client Secret is correct
- Verify the redirect URI matches exactly
- Try deleting and re-entering the Client Secret

### Issue: Still not working after all steps
**Solution**: 
1. Check browser console (F12) for detailed error logs
2. Verify you're using the correct Google account (the one added as test user)
3. Try in an incognito window to clear any cached OAuth state

---

## 📋 Configuration Checklist

Before trying "Connect Analytics", verify:

- ☐ Redirect URI in Google Console: `https://www.mbd.studio/oauth/callback`
- ☐ Client ID: `430888277505-u2rj0hok39fd0nh3t2n83hrkfovosim1.apps.googleusercontent.com`
- ☐ Client Secret entered in app (via the secret popup)
- ☐ Your Google email added as Test User
- ☐ OAuth consent screen in "Testing" mode
- ☐ Scopes enabled:
  - `https://www.googleapis.com/auth/youtube.readonly`
  - `https://www.googleapis.com/auth/yt-analytics.readonly`

---

## 🆘 Still Having Issues?

Check the browser console (F12 → Console tab) for detailed logs:
- Look for "=== OAuth Callback Debug ===" messages
- Look for the redirect URI being sent
- Compare it with what's in Google Cloud Console

The app now includes an OAuth Diagnostics panel that shows:
- Your current redirect URI
- Your Client ID
- Step-by-step instructions

Follow the diagnostics panel for the most up-to-date troubleshooting!
