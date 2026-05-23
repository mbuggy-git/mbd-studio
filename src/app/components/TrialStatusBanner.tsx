import { useState, useEffect } from "react";
import { Calendar, AlertCircle, Info } from "lucide-react";
import { Button } from "./ui/button";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface TrialStatusBannerProps {
  userId: string | null;
  accessToken: string | null;
}

interface TrialStatus {
  status: 'active' | 'expired' | 'grace_period' | 'deleted';
  daysRemaining: number;
  graceDaysRemaining: number;
  trialEndDate: string;
  isTrialActive: boolean;
  isInGracePeriod: boolean;
  shouldDeleteData: boolean;
}

export function TrialStatusBanner({ userId, accessToken }: TrialStatusBannerProps) {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (userId && accessToken) {
      fetchTrialStatus();
    }
  }, [userId, accessToken]);

  const fetchTrialStatus = async () => {
    if (!userId || !accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/auth/user/${userId}/trial-status`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTrialStatus(data);
      }
    } catch (error) {
      console.log("Failed to fetch trial status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !trialStatus) {
    return null;
  }

  // Don't show anything if trial is deleted
  if (trialStatus.shouldDeleteData) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Active trial
  if (trialStatus.isTrialActive) {
    const isLowOnDays = trialStatus.daysRemaining <= 7;
    
    return (
      <div className={`border-b ${isLowOnDays ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'} px-4 py-2`}>
        <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Calendar className={`w-4 h-4 ${isLowOnDays ? 'text-orange-600' : 'text-blue-600'}`} />
            <div className="text-sm">
              <span className={isLowOnDays ? 'text-orange-900' : 'text-blue-900'}>
                <strong>{trialStatus.daysRemaining} day{trialStatus.daysRemaining !== 1 ? 's' : ''}</strong> remaining in your free trial
              </span>
              {isLowOnDays && (
                <span className="ml-2 text-orange-700">
                  • Trial ends {formatDate(trialStatus.trialEndDate)}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`text-xs ${isLowOnDays ? 'text-orange-700 hover:text-orange-800' : 'text-blue-700 hover:text-blue-800'} underline`}
          >
            {showDetails ? 'Hide details' : 'Learn more'}
          </button>
        </div>
        
        {showDetails && (
          <div className={`mt-3 pt-3 border-t ${isLowOnDays ? 'border-orange-200' : 'border-blue-200'} text-sm ${isLowOnDays ? 'text-orange-800' : 'text-blue-800'}`}>
            <div className="container mx-auto space-y-1">
              <p>✓ Your trial ends on <strong>{formatDate(trialStatus.trialEndDate)}</strong></p>
              <p>✓ Full access to all TubeLab features until then</p>
              <p>✓ Your data will be kept for 30 days after trial ends</p>
              <p>✓ No credit card required during beta</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grace period (trial expired but data still available)
  if (trialStatus.isInGracePeriod) {
    return (
      <div className="border-b bg-yellow-50 border-yellow-200 px-4 py-3">
        <div className="container mx-auto">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm text-yellow-900">
                <strong>Your trial has ended.</strong> Thanks for testing TubeLab!
              </div>
              <div className="text-sm text-yellow-800 mt-1">
                Your data will be kept for <strong>{trialStatus.graceDaysRemaining} more day{trialStatus.graceDaysRemaining !== 1 ? 's' : ''}</strong> (until {formatDate(trialStatus.trialEndDate)}).
              </div>
              <div className="text-xs text-yellow-700 mt-2">
                We're preparing for public release! Would you like to be notified when TubeLab launches? Please send us feedback using the feedback button.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
