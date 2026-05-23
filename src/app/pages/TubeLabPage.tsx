import { Navigation } from "../components/Navigation";
import { VideoDatabase } from "../components/VideoDatabase";
import { Footer } from "../components/Footer";
import { LandingPage } from "../components/LandingPage";
import { AuthDialog } from "../components/AuthDialog";
import { WelcomeScreen } from "../components/WelcomeScreen";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "../utils/supabase/client";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import TubeLabAd from "../imports/TubeLabAd";

export function TubeLabPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const supabase = getSupabaseClient();

  // Check authentication state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session check:', session);
      
      if (session) {
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        setUserName(session.user.user_metadata?.name || null);
        setAccessToken(session.access_token);
      }
      setLoading(false);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session) {
          setIsAuthenticated(true);
          setUserId(session.user.id);
          setUserEmail(session.user.email || null);
          setUserName(session.user.user_metadata?.name || null);
          setAccessToken(session.access_token);
        } else {
          setIsAuthenticated(false);
          setUserId(null);
          setUserEmail(null);
          setUserName(null);
          setAccessToken(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  
  const handleShowAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthDialog(true);
  };

  const handleAuthSuccess = async (newUserId: string, email: string) => {
    setIsAuthenticated(true);
    setUserId(newUserId);
    setUserEmail(email);
    setShowAuthDialog(false);
    
    // Get the session to retrieve access token
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setAccessToken(session.access_token);
    }
    
    // Show welcome screen for new signups
    if (authMode === 'signup') {
      setShowWelcome(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail(null);
    setUserName(null);
    setAccessToken(null);
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    setPasswordError("");
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
    }
    setPasswordLoading(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5928CB] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onShowAuth={handleShowAuth} />
        {showAuthDialog && (
          <AuthDialog
            mode={authMode}
            onClose={() => {
              setShowAuthDialog(false);
              setPasswordError("");
            }}
            onSuccess={handleAuthSuccess}
            initialError={passwordError}
          />
        )}
        {/* Show password update dialog even when not authenticated if recovery detected */}
        {showPasswordUpdate && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-8 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPasswordUpdate(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                  setPasswordSuccess(false);
                }}
                className="absolute top-4 right-4 h-8 w-8 p-0"
              >
                ✕
              </Button>

              <div className="mb-6">
                <h2 className="text-2xl mb-2">Update Your Password</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handlePasswordUpdate();
              }} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5928CB]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5928CB]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 text-green-600 p-3 rounded text-sm">
                    Password updated successfully! You can now log in with your new password.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={passwordLoading || passwordSuccess}
                  className="w-full"
                  style={{ backgroundColor: "#5928CB" }}
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : passwordSuccess ? (
                    "Password Updated!"
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>

                {passwordSuccess && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordUpdate(false);
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordError("");
                      setPasswordSuccess(false);
                    }}
                    className="w-full"
                  >
                    Close
                  </Button>
                )}
              </form>
            </Card>
          </div>
        )}
      </>
    );
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen flex flex-col">
      <a 
        href="https://tubelab.app" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <TubeLabAd />
      </a>
      <Navigation currentPage="tubelab" />
      <div className="flex-1">
        <VideoDatabase 
          userId={userId!} 
          userEmail={userEmail!}
          accessToken={accessToken!}
          onLogout={handleLogout}
        />
      </div>
      <Footer />
      {showWelcome && (
        <WelcomeScreen
          userName={userName!}
          isNewUser={isNewUser}
          onClose={() => setShowWelcome(false)}
        />
      )}
      {showPasswordUpdate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-8 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowPasswordUpdate(false);
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError("");
                setPasswordSuccess(false);
              }}
              className="absolute top-4 right-4 h-8 w-8 p-0"
            >
              ✕
            </Button>

            <div className="mb-6">
              <h2 className="text-2xl mb-2">Update Your Password</h2>
              <p className="text-sm text-muted-foreground">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handlePasswordUpdate();
            }} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5928CB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5928CB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-green-50 text-green-600 p-3 rounded text-sm">
                  Password updated successfully! You can now log in with your new password.
                </div>
              )}

              <Button
                type="submit"
                disabled={passwordLoading || passwordSuccess}
                className="w-full"
                style={{ backgroundColor: "#5928CB" }}
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : passwordSuccess ? (
                  "Password Updated!"
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>

              {passwordSuccess && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordUpdate(false);
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                    setPasswordSuccess(false);
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
