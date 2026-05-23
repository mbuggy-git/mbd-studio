import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { YouTubeConnect } from "../components/YouTubeConnect";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSupabaseClient } from "../utils/supabase/client";

export function YouTubeSetupPage() {
  const [connected, setConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const supabase = getSupabaseClient();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
        } else {
          // Not authenticated, redirect to TubeLab (landing page)
          navigate("/app");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/app");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#5928CB] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation currentPage="tubelab" />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl mb-4">Connect YouTube</h1>
            <p className="text-lg text-muted-foreground">
              Let's connect your YouTube account to start syncing your video data
            </p>
          </div>

          <YouTubeConnect onConnectionChange={setConnected} />

          {connected && (
            <div className="text-center pt-4">
              <Button
                onClick={() => navigate("/app")}
                style={{ backgroundColor: "#5928CB" }}
                className="text-white hover:opacity-90"
                size="lg"
              >
                Continue to TubeLab
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}