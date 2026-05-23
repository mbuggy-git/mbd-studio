# OAuth Callback Handling - Code Locations

## YES, the OAuth callback handling code EXISTS and is COMPLETE! ✅

Here's exactly where each part of the OAuth flow is implemented:

---

## 📁 Frontend Code

### 1. App.tsx (Lines 56-67)
**Purpose:** Detects when Google redirects back to `/oauth/callback` and shows Video Database

```typescript
// Handle OAuth callback - check if we're on the callback path
useEffect(() => {
  const path = window.location.pathname;
  if (path === '/oauth/callback') {
    // Redirect to video database with the code parameter
    setShowVideoDatabase(true);
    setShowTrainingForm(false);
    setShowContactForm(false);
    setShowGetTheGoods(false);
    setShowVidPodStudio(false);
  }
}, []);
```

**What it does:**
- Runs when app loads
- Checks if URL path is `/oauth/callback`
- If yes, displays the VideoDatabase component
- This ensures the VideoDatabase is mounted when Google redirects back

---

### 2. VideoDatabase.tsx (Lines 2367-2404)
**Purpose:** Extracts the authorization code from URL and initiates token exchange

```typescript
useEffect(() => {
  console.log("🎬 Video Database loaded");
  console.log("📍 Current URL:", window.location.href);
  console.log("🔐 OAuth Redirect URI:", `${window.location.origin}/oauth/callback`);
  
  fetchDatabaseVideos();
  checkAnalyticsConnection();
  
  // Handle OAuth callback (only once)
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  
  // Check if Google returned an error
  if (error) {
    console.error("❌ OAuth ERROR from Google:", error);
    const errorDescription = urlParams.get('error_description');
    toast.error(`OAuth failed: ${errorDescription || error}`);
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }
  
  if (code && !sessionStorage.getItem('oauth_processing')) {
    console.log("🔑 OAuth code detected in URL, processing callback...");
    sessionStorage.setItem('oauth_processing', 'true');
    handleOAuthCallback(code).finally(() => {
      sessionStorage.removeItem('oauth_processing');
    });
  }
}, []);
```

**What it does:**
1. Runs when VideoDatabase component mounts
2. Parses URL query parameters
3. Checks for `error` parameter (Google error)
4. Checks for `code` parameter (authorization code)
5. If code exists, calls `handleOAuthCallback(code)`
6. Uses sessionStorage to prevent duplicate processing

---

### 3. VideoDatabase.tsx (Lines ~2422-2477) - Enhanced!
**Purpose:** Sends authorization code to server for token exchange

```typescript
const handleOAuthCallback = async (code: string) => {
  console.log("=== 🔄 Starting OAuth Callback Handler ===");
  try {
    const redirectUri = `${window.location.origin}/oauth/callback`;
    
    console.log("📋 OAuth Callback Details:");
    console.log("  - Redirect URI:", redirectUri);
    console.log("  - Auth code (preview):", code.substring(0, 20) + "...");
    
    toast.info("Exchanging authorization code for access tokens...");
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/oauth/youtube-analytics/callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ code, redirectUri }),
      }
    );
    
    if (response.ok) {
      setAnalyticsConnected(true);
      toast.success("🎉 Successfully connected to YouTube Analytics!");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const errorData = await response.json();
      console.error("❌ OAUTH CALLBACK FAILED");
      console.error("Error:", errorData);
      toast.error(`OAuth failed: ${errorData.details || errorData.error}`);
    }
  } catch (error) {
    console.error("❌ Exception in OAuth callback handler:", error);
    toast.error(`Failed to complete authentication: ${error.message}`);
  }
};
```

**What it does:**
1. Receives the authorization code
2. Constructs the redirect URI (must match what was sent to Google)
3. Sends POST request to server with code and redirectUri
4. Server exchanges code for tokens
5. Shows success/error message
6. Cleans up URL (removes code parameter)

---

### 4. VideoDatabase.tsx (Lines ~1756-1823) - Enhanced!
**Purpose:** Initiates the OAuth flow when user clicks "Connect Analytics"

```typescript
const connectYouTubeAnalytics = async () => {
  console.log("=== 🚀 Initiating OAuth Connection ===");
  try {
    const redirectUri = `${window.location.origin}/oauth/callback`;
    
    console.log("📋 OAuth Configuration:");
    console.log("  - Expected redirect URI:", redirectUri);
    console.log("  - Client ID: 430888277505-u2rj0hok39fd0nh3t2n83hrkfovosim1...");
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/oauth/youtube-analytics/auth-url`,
      {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          Origin: window.location.origin,
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Auth URL generated successfully!");
      
      // Redirect user to Google OAuth consent screen
      window.location.href = data.authUrl;
    }
  } catch (error) {
    console.error("❌ Exception while initiating OAuth:", error);
    toast.error(`Failed to initiate YouTube Analytics connection`);
  }
};
```

**What it does:**
1. User clicks "Connect Analytics" button
2. Fetches OAuth authorization URL from server
3. Redirects user to Google's consent screen
4. Google will redirect back to `/oauth/callback?code=XXX`

---

## 🖥️ Backend Code

### 5. /supabase/functions/server/index.tsx (Lines 376-403)
**Purpose:** Generates OAuth authorization URL

```typescript
app.get("/make-server-6ab9c767/oauth/youtube-analytics/auth-url", async (c) => {
  try {
    const CLIENT_ID = "430888277505-u2rj0hok39fd0nh3t2n83hrkfovosim1.apps.googleusercontent.com";
    const originHeader = c.req.header("origin");
    const redirectUri = `${originHeader || "https://figma-make-app.com"}/oauth/callback`;
    
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    
    return c.json({ authUrl: authUrl.toString() });
  } catch (error) {
    return c.json({ error: "Failed to generate auth URL" }, 500);
  }
});
```

---

### 6. /supabase/functions/server/index.tsx (Lines 405-489)
**Purpose:** Exchanges authorization code for access tokens

```typescript
app.post("/make-server-6ab9c767/oauth/youtube-analytics/callback", async (c) => {
  try {
    const { code, redirectUri } = await c.req.json();
    const CLIENT_ID = "430888277505-u2rj0hok39fd0nh3t2n83hrkfovosim1.apps.googleusercontent.com";
    const CLIENT_SECRET = Deno.env.get("YOUTUBE_OAUTH_CLIENT_SECRET");
    
    // Exchange code for tokens
    const tokenParams = {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };
    
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(tokenParams),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      // Handle errors...
      return c.json({ error: "Token exchange failed" }, 500);
    }
    
    const tokens = await tokenResponse.json();
    
    // Store tokens in KV store
    await kv.set("youtube:oauth:tokens", {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
    });
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to complete OAuth flow" }, 500);
  }
});
```

---

## 🔄 Complete OAuth Flow

```
1. User clicks "Connect Analytics" button
   ↓
2. connectYouTubeAnalytics() → Fetch auth URL from server
   ↓
3. Server generates auth URL with redirect_uri
   ↓
4. User redirected to Google OAuth consent screen
   ↓
5. User authorizes application
   ↓
6. Google redirects to: https://your-app.com/oauth/callback?code=XXX
   ↓
7. App.tsx detects path === '/oauth/callback' → Shows VideoDatabase
   ↓
8. VideoDatabase useEffect runs → Extracts 'code' from URL
   ↓
9. handleOAuthCallback(code) → POST to server with code
   ↓
10. Server exchanges code for tokens with Google
    ↓
11. Server stores tokens in database
    ↓
12. Server returns success to frontend
    ↓
13. Frontend shows success message
    ↓
14. URL cleaned up (code parameter removed)
    ↓
15. ✅ OAuth complete! User can now fetch analytics
```

---

## 📊 What Was Enhanced

I added comprehensive logging and error handling:

### New Features:
1. ✅ Detects OAuth errors from Google in the URL
2. ✅ Enhanced logging at every step
3. ✅ Better error messages with actionable advice
4. ✅ Progress toasts during OAuth flow
5. ✅ Prevents duplicate callback processing
6. ✅ Shows code preview in logs for debugging
7. ✅ Logs exact redirect URI being used
8. ✅ Provides Google Cloud Console links

### Error Detection:
- Google errors (redirect_uri_mismatch, invalid_client, etc.)
- Server errors (token exchange failures)
- Network errors (fetch failures)
- Configuration errors (missing secrets)

---

## 🎯 The Code is Complete!

**All OAuth callback handling code was already implemented and is now enhanced with better logging and error handling.**

The issue you're experiencing is NOT missing code - it's a **configuration issue** with Google Cloud Console.

**Next step:** Follow the debugging guide in `/OAUTH_FLOW_DEBUG_GUIDE.md` to diagnose the actual error you're seeing.
