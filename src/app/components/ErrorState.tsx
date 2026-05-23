import { useNavigate } from "react-router-dom";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  const navigate = useNavigate();
  
  const handleRefresh = () => {
    window.location.reload();
  };

  const isQuotaError = error.includes('quota exceeded') || error.includes('YouTube channel data unavailable');

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-background">
        <Navigation currentPage="home" />
        <div className="px-6 pb-6 flex items-center justify-center lg:mx-[75px]">
          <Alert className="max-w-2xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <p>{error}</p>
              {isQuotaError && (
                <>
                  <p className="text-sm">
                    YouTube API daily quota exceeded (resets at midnight Pacific Time). However, the <strong>TubeLab</strong> feature works independently and is fully functional!
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => navigate('/app')} 
                      variant="default"
                    >
                      Open TubeLab
                    </Button>
                    <Button 
                      onClick={handleRefresh} 
                      variant="outline"
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try Again Later
                    </Button>
                  </div>
                </>
              )}
              {!isQuotaError && (
                <Button 
                  onClick={handleRefresh} 
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>
      <Footer />
    </div>
  );
}