import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function OAuthCallbackPage() {
  useEffect(() => {
    console.log("🔵 OAuth Callback Page loaded");
    console.log("🔵 Current URL:", window.location.href);
    console.log("🔵 Window opener exists:", !!window.opener);
    
    // Extract code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    console.log("🔵 OAuth code:", code ? "Present" : "Missing");
    console.log("🔵 OAuth error:", error || "None");

    if (error) {
      console.error("❌ OAuth error from Google:", error);
      
      // Store error in localStorage for parent window to read
      localStorage.setItem("youtube_oauth_error", error);
      
      // Also try postMessage if opener exists
      if (window.opener) {
        console.log("📤 Posting error message to parent window");
        window.opener.postMessage({
          type: "youtube-oauth-error",
          error: error,
        }, window.location.origin);
      }
      
      // Close popup after a short delay
      setTimeout(() => {
        console.log("🔴 Closing popup window");
        window.close();
      }, 1000);
      return;
    }

    if (code) {
      console.log("✅ OAuth code received");
      
      // Store code in localStorage for parent window to read
      console.log("💾 Storing OAuth code in localStorage");
      localStorage.setItem("youtube_oauth_code", code);
      localStorage.setItem("youtube_oauth_timestamp", Date.now().toString());
      
      // Also try postMessage if opener exists (fallback)
      if (window.opener) {
        console.log("📤 Posting success message to parent window");
        window.opener.postMessage({
          type: "youtube-oauth-success",
          code: code,
        }, window.location.origin);
      } else {
        console.log("ℹ️ No parent window - using localStorage method");
      }
      
      // Close popup after a short delay
      setTimeout(() => {
        console.log("🔴 Closing popup window");
        window.close();
      }, 1000);
    } else {
      console.error("❌ No code and no error in OAuth callback");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#5928CB] mx-auto mb-4" />
        <h2 className="text-xl mb-2">Connecting to YouTube...</h2>
        <p className="text-sm text-muted-foreground">
          This window will close automatically.
        </p>
      </div>
    </div>
  );
}