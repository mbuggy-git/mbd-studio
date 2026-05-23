import { useState, useEffect } from "react";
import { getSupabaseClient } from "../utils/supabase/client";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [validating, setValidating] = useState(true);
  const navigate = useNavigate();
  const supabase = getSupabaseClient();

  // Log URL immediately on component mount (before any effects run)
  console.log('🚀 COMPONENT MOUNTED');
  console.log('🔍 IMMEDIATE URL:', window.location.href);
  console.log('🔍 IMMEDIATE HASH:', window.location.hash);
  console.log('🔍 IMMEDIATE SEARCH:', window.location.search);

  useEffect(() => {
    const validateResetToken = async () => {
      console.log('🔍 VALIDATING RESET TOKEN');
      
      // First check query params for token_hash (new PKCE flow)
      const searchParams = new URLSearchParams(window.location.search);
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      console.log('Query params - token_hash:', tokenHash?.substring(0, 20) + '...', 'type:', type);
      
      if (tokenHash && type === 'recovery') {
        console.log('🔐 Found token_hash, verifying OTP...');
        
        try {
          // Exchange the token_hash for a session
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
          });
          
          console.log('OTP verification result:', { data, error });
          
          if (error) {
            console.error('❌ OTP verification failed:', error);
            setError('Invalid or expired reset link. Please request a new password reset.');
            setValidating(false);
            return;
          }
          
          if (data?.session) {
            console.log('✅ OTP verified, session created!');
            setIsValidToken(true);
            setValidating(false);
            return;
          }
        } catch (err) {
          console.error('❌ OTP verification error:', err);
          setError('Failed to verify reset link. Please try again.');
          setValidating(false);
          return;
        }
      }
      
      // Fallback: Check if we have an active session (Supabase handles token exchange automatically)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('Session data:', session);
      console.log('Session error:', sessionError);
      
      if (session?.user) {
        console.log('✅ Valid session found, user can reset password');
        setIsValidToken(true);
        setValidating(false);
        return;
      }
      
      // Fallback: Check URL hash for tokens (legacy flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const hashType = hashParams.get('type');
      
      console.log('Hash params - access_token:', accessToken?.substring(0, 20) + '...', 'type:', hashType);
      
      if (accessToken && hashType === 'recovery') {
        console.log('✅ Found recovery token in URL hash');
        setIsValidToken(true);
        setValidating(false);
        return;
      }
      
      console.log('❌ No valid session or recovery token found');
      setError('Invalid or expired reset link. Please request a new password reset.');
      setValidating(false);
    };

    validateResetToken();
  }, [supabase]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Double-check we have a valid session before updating
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('🔐 Session check before update:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        error: sessionError 
      });
      
      if (!session || sessionError) {
        console.error('❌ No session found for password update');
        setError('Auth session missing!');
        setLoading(false);
        return;
      }

      console.log('🔄 Updating password...');
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        console.error('❌ Password update error:', error);
        throw error;
      }

      console.log('✅ Password updated successfully!');
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/app');
      }, 2000);
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[#5928CB]" />
            <p className="text-muted-foreground">Validating reset link...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl mb-2">Invalid Reset Link</h2>
            <p className="text-muted-foreground mb-6">
              {error || "This password reset link is invalid or has expired."}
            </p>
            <Button
              onClick={() => navigate('/app')}
              className="w-full"
              style={{ backgroundColor: "#5928CB" }}
            >
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md p-8">
        {success ? (
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl mb-2">Password Updated!</h2>
            <p className="text-muted-foreground mb-4">
              Your password has been successfully updated.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Update Your Password</h2>
              <p className="text-sm text-muted-foreground">
                Choose a new password for your TubeLab account
              </p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
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

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                style={{ backgroundColor: "#5928CB" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}