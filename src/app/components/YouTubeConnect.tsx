import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Youtube, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";
import { getSupabaseClient } from "../utils/supabase/client";

interface YouTubeConnectProps {
  onConnectionChange?: (connected: boolean) => void;
}

export function YouTubeConnect({ onConnectionChange }: YouTubeConnectProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [checking, setChecking] = useState(true);
  const supabase = getSupabaseClient();

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    setChecking(true);
    try {
      // Get user's access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.log("No user session found - skipping YouTube connection check");
        setConnected(false);
        setChecking(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/oauth/youtube-analytics/status`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to check YouTube connection status:", response.status);
        setConnected(false);
        setChecking(false);
        return;
      }

      const data = await response.json();
      setConnected(data.connected || false);
      onConnectionChange?.(data.connected || false);
    } catch (error) {
      console.error("Error checking YouTube connection:", error);
      setConnected(false);
    } finally {
      setChecking(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      console.log("🔵 Starting OAuth flow...");
      
      // Clear any previous OAuth data
      localStorage.removeItem("youtube-oauth-code");
      localStorage.removeItem("youtube-oauth-error");
      localStorage.removeItem("youtube-oauth-timestamp");

      // Get user's access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Authentication session expired. Please log in again.");
        setConnecting(false);
        return;
      }

      // Get OAuth URL from server
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/oauth/youtube-analytics/auth-url`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📡 Auth URL response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to get OAuth URL");
      }

      const data = await response.json();
      console.log("✅ Got auth URL");

      // Open popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      const popup = window.open(
        data.authUrl,
        "YouTube OAuth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      console.log("🪟 OAuth popup opened");

      // Poll for OAuth code in localStorage (in case postMessage doesn't work)
      const pollInterval = setInterval(() => {
        const code = localStorage.getItem("youtube-oauth-code");
        const error = localStorage.getItem("youtube-oauth-error");
        const timestamp = localStorage.getItem("youtube-oauth-timestamp");
        
        // Only process if timestamp is recent (within last 30 seconds)
        if (timestamp && Date.now() - parseInt(timestamp) < 30000) {
          if (code) {
            console.log("✅ OAuth code found in localStorage");
            clearInterval(pollInterval);
            popup.close();
            
            // Clear localStorage
            localStorage.removeItem("youtube-oauth-code");
            localStorage.removeItem("youtube-oauth-timestamp");
            
            // Process the code
            handleOAuthSuccess(code, session.access_token);
          } else if (error) {
            console.error("❌ OAuth error found in localStorage:", error);
            clearInterval(pollInterval);
            popup.close();
            
            // Clear localStorage
            localStorage.removeItem("youtube-oauth-error");
            localStorage.removeItem("youtube-oauth-timestamp");
            
            toast.error(`OAuth failed: ${error}`);
            setConnecting(false);
          }
        }
      }, 500);

      // Listen for OAuth callback via postMessage (fallback)
      const messageHandler = async (event: MessageEvent) => {
        if (event.data.type === "youtube-oauth-success") {
          console.log("✅ OAuth success message received via postMessage");
          window.removeEventListener("message", messageHandler);
          clearInterval(pollInterval);
          popup?.close();

          // Clear localStorage
          localStorage.removeItem("youtube-oauth-code");
          localStorage.removeItem("youtube-oauth-timestamp");

          await handleOAuthSuccess(event.data.code, session.access_token);
        } else if (event.data.type === "youtube-oauth-error") {
          window.removeEventListener("message", messageHandler);
          clearInterval(pollInterval);
          popup?.close();
          toast.error(event.data.error || "OAuth failed");
          setConnecting(false);
        }
      };

      window.addEventListener("message", messageHandler);

      // Check if popup was blocked
      setTimeout(() => {
        if (!popup || popup.closed) {
          window.removeEventListener("message", messageHandler);
          clearInterval(pollInterval);
          toast.error("Popup was blocked. Please allow popups and try again.");
          setConnecting(false);
        }
      }, 1000);
    } catch (error: any) {
      console.error("Error connecting to YouTube:", error);
      toast.error(error.message || "Failed to connect to YouTube");
      setConnecting(false);
    }
  };

  const handleOAuthSuccess = async (code: string, accessToken: string) => {
    try {
      console.log("🔄 Exchanging OAuth code for tokens...");
      
      // Exchange code for tokens
      const callbackResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/oauth/youtube-analytics/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            code: code,
            redirectUri: `${window.location.origin}/oauth-callback.html`,
          }),
        }
      );

      console.log("📡 Token exchange response status:", callbackResponse.status);

      if (!callbackResponse.ok) {
        const errorText = await callbackResponse.text();
        console.error("❌ Token exchange failed:", errorText);
        throw new Error(`Token exchange failed: ${callbackResponse.status}`);
      }

      const callbackData = await callbackResponse.json();
      console.log("✅ Token exchange successful:", callbackData);

      if (callbackData.success) {
        setConnected(true);
        onConnectionChange?.(true);
        toast.success("YouTube connected successfully!");
      } else {
        throw new Error(callbackData.error || "Failed to complete OAuth");
      }
    } catch (error) {
      console.error("❌ Error during OAuth callback:", error);
      toast.error(error instanceof Error ? error.message : "Failed to complete connection");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    console.log("🔴 Disconnect button clicked");
    
    const confirmed = confirm("Disconnect from YouTube? You can reconnect anytime.");
    console.log("User confirmed:", confirmed);
    
    if (!confirmed) {
      return;
    }

    try {
      console.log("🔄 Getting user session for disconnect...");
      
      // Get user's access token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error("❌ No session found");
        toast.error("Authentication session expired. Please log in again.");
        return;
      }

      console.log("📡 Calling disconnect endpoint...");
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/oauth/youtube-analytics/disconnect`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      console.log("📡 Disconnect response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Disconnect successful:", data);
        setConnected(false);
        onConnectionChange?.(false);
        toast.success("YouTube disconnected");
      } else {
        const errorText = await response.text();
        console.error("❌ Disconnect failed:", errorText);
        toast.error(`Failed to disconnect: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error disconnecting:", error);
      toast.error(error instanceof Error ? error.message : "Failed to disconnect");
    }
  };

  if (checking) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Checking connection...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {connected ? (
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          ) : (
            <Youtube className="w-10 h-10 text-[#FF0000]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="mb-2">
            {connected ? "YouTube Connected" : "Connect YouTube"}
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            {connected
              ? "Your YouTube account is connected. You can now sync videos and analytics data."
              : "Connect your YouTube account to automatically sync video data, analytics, and performance metrics."}
          </p>

          {!connected && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <p className="mb-1">
                    You'll be asked to grant access to:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>View your YouTube channel data</li>
                    <li>View YouTube Analytics reports</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {connected ? (
              <>
                <Button variant="outline" size="sm" onClick={checkConnectionStatus}>
                  Refresh Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-red-600 hover:bg-red-50"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={connecting}
                style={{ backgroundColor: "#5928CB" }}
                className="text-white hover:opacity-90"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Youtube className="w-4 h-4 mr-2" />
                    Connect YouTube
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}