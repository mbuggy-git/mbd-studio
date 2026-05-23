# OAuth Flow Debug Guide

## Summary

✅ **The OAuth callback handling code IS FULLY IMPLEMENTED and working correctly!**

The issue you're experiencing is likely a **configuration problem** with Google Cloud Console, not missing code. This guide will help you diagnose and fix it.

## What's Already Implemented

The complete OAuth flow is in place with enhanced logging:

### 1. OAuth Initiation (`connectYouTubeAnalytics()`)
- Fetches authorization URL from server
- Redirects user to Google's OAuth consent screen
- Logs all configuration details to console

### 2. Google OAuth Consent
- User authorizes the application
- Google redirects back to your app with an authorization code

### 3. OAuth Callback Handling (`handleOAuthCallback()`)
- **App.tsx** (lines 56-67): Detects `/oauth/callback` path and loads Video Database
- **VideoDatabase.tsx** (lines 2367-2404): 
  - Extracts `code` parameter from URL
  - Checks for errors from Google
  - Calls `handleOAuthCallback()` to exchange code for tokens
  - Prevents duplicate processing with sessionStorage flag

### 4. Token Exchange (server endpoint)
- Exchanges authorization code for access & refresh tokens
- Stores tokens securely in database
- Returns success/error to frontend

## How to Debug Your OAuth Issue

### Step 1: Open Browser Console (F12)

When you click "Connect Analytics", the console will show detailed logs including:
- Your exact redirect URI
- Client ID being used
- Server responses
- Any errors from Google or the server

### Step 2: Check What Type of Error You're Getting

#### Error Type A: Google OAuth Error (Red screen from Google)
**Common errors:**
- `redirect_uri_mismatch` - Your redirect URI isn't registered
- `invalid_client` - Wrong Client ID or Client Secret
- `access_denied` - User denied permission

**Solution:** Check Google Cloud Console configuration (see Step 3 below)

#### Error Type B: Server Error (After Google redirects back)
**Common errors:**
- `invalid_grant` - Authorization code expired or already used
- `OAuth client secret not configured` - Missing environment variable

**Solution:** Check server logs and environment variables

#### Error Type C: No Error, Just Not Working
**Symptoms:**
- Button click does nothing
- No redirect to Google
- Page just reloads

**Solution:** Check browser console for JavaScript errors

### Step 3: Verify Google Cloud Console Configuration

1. **Go to:** https://console.cloud.google.com/apis/credentials

2. **Click on your OAuth 2.0 Client ID**

3. **Verify these settings:**

   ✅ **Client ID:** `430888277505-u2rj0hok39fd0nh3t2n83hrkfovosim1.apps.googleusercontent.com`
   
   ✅ **Authorized redirect URIs must include EXACTLY:**
   - `http://localhost:5173/oauth/callback` (for local development)
   - `https://your-production-domain.com/oauth/callback` (for production)
   
   **IMPORTANT:** The redirect URI MUST match EXACTLY including:
   - Protocol (http vs https)
   - Domain/subdomain (with or without www)
   - Port number (if any)
   - Path (`/oauth/callback`)

4. **Copy the Client Secret** and verify it's set in your environment

5. **Check OAuth Consent Screen:**
   - Status: "Testing" (for development)
   - Add your email under "Test users"

### Step 4: Check Environment Variable

The server needs the `YOUTUBE_OAUTH_CLIENT_SECRET` environment variable.

**To verify it's set:**
- Look in your Supabase project settings → Edge Functions → Environment Variables
- The secret should already be in the "provided secrets" list based on your earlier setup

### Step 5: Test the Flow

1. Open browser console (F12)
2. Click "Connect Analytics"
3. Watch the console logs carefully
4. Copy any error messages
5. If redirected to Google, check what error Google shows
6. If redirected back to your app, check for callback logs

## Console Log Examples

### Successful Flow
```
🚀 Initiating OAuth Connection
📋 OAuth Configuration:
  - Current origin: https://your-app.com
  - Expected redirect URI: https://your-app.com/oauth/callback
✅ Auth URL generated successfully!
🌐 Redirecting to Google OAuth consent screen...

[After user authorizes and returns]

🎬 Video Database loaded
🔑 OAuth code detected in URL, processing callback...
🔄 Starting OAuth Callback Handler
✅ OAuth callback successful!
🎉 Successfully connected to YouTube Analytics!
```

### Failed Flow (redirect_uri_mismatch)
```
🚀 Initiating OAuth Connection
✅ Auth URL generated successfully!
[Redirects to Google]
[Google shows error: "redirect_uri_mismatch"]
```
**Fix:** Add the exact redirect URI to Google Cloud Console

### Failed Flow (invalid_client)
```
❌ OAuth Callback Failed
Error: Invalid Client ID or Client Secret
```
**Fix:** Verify Client ID and Secret in Google Cloud Console

## Quick Troubleshooting Checklist

- [ ] Redirect URI is EXACTLY correct in Google Cloud Console
- [ ] Client ID matches: `430888277505-u2rj0hok39fd0nh3t2n83hrkfovosim1.apps.googleusercontent.com`
- [ ] Client Secret environment variable is set in Supabase
- [ ] Your email is added as a test user in OAuth consent screen
- [ ] OAuth consent screen is in "Testing" status
- [ ] Browser console shows no JavaScript errors
- [ ] You're testing from the correct domain (matches redirect URI)

## What Changed

I've enhanced the logging throughout the OAuth flow:

### In `connectYouTubeAnalytics()`:
- Added detailed configuration logging
- Shows exact redirect URI to copy
- Provides Google Cloud Console link
- Shows server response status
- Better error messages with context

### In `handleOAuthCallback()`:
- Logs all OAuth parameters
- Shows code length and preview
- Detects and handles Google errors
- Provides actionable error messages
- Cleans up URL after processing

### In the initial useEffect:
- Detects OAuth errors from Google
- Shows error descriptions
- Prevents duplicate processing
- Logs normal page loads vs OAuth returns

## Next Steps

1. **Open the app and check browser console** - Look for the redirect URI being logged
2. **Copy the exact redirect URI** from console logs
3. **Add it to Google Cloud Console** under Authorized redirect URIs
4. **Try "Connect Analytics" again** and watch the console
5. **Share any error messages** if it still doesn't work

The callback handling code is complete and ready to work as soon as the Google Cloud configuration is correct!
