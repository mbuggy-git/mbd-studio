import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { X, Loader2, Mail, Lock, User } from "lucide-react";
import { getSupabaseClient } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AuthDialogProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (userId: string, email: string) => void;
  initialError?: string;
}

export function AuthDialog({ mode, onClose, onSuccess, initialError }: AuthDialogProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'signup'>(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(initialError || "");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const supabase = getSupabaseClient();

  // Update error if initialError changes
  useEffect(() => {
    if (initialError) {
      setError(initialError);
      setShowResetPassword(true);
    }
  }, [initialError]);

  // Check for OAuth redirect on mount
  useEffect(() => {
    const checkOAuthSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        onSuccess(session.user.id, session.user.email || '');
      }
    };
    checkOAuthSession();
  }, []);

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app`,
        }
      });

      if (error) throw error;
      
      // The user will be redirected to Google for authentication
      // After successful auth, they'll be redirected back to /app
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (currentMode === 'signup') {
        // Sign up via server endpoint
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/auth/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              email,
              password,
              name
            })
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Signup failed');
        }

        const data = await response.json();
        onSuccess(data.userId, email);
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        if (!data.user) throw new Error('Login failed');

        onSuccess(data.user.id, email);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetLoading(true);

    try {
      // Determine redirect URL dynamically
      const resetPasswordPath = '/reset-password';
      const redirectUrl = `${window.location.origin}${resetPasswordPath}`;
      
      console.log('Password reset redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      // Show a more helpful success message
      setResetSuccess(true);
      setError(''); // Clear any previous errors
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
      console.error('Password reset error:', err);
      
      // Show helpful message if SMTP not configured
      if (err.message?.includes('SMTP') || err.message?.includes('email')) {
        setError('Email service not configured yet. Please contact support at tubelab@mbd.studio for password reset assistance.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-8 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>

        {!showResetPassword ? (
          <>
            <h2 className="text-2xl mb-6">
              {currentMode === 'login' ? 'Welcome Back' : 'Start Your Free Trial'}
            </h2>

            {/* Google Login Button */}
            <Button
              type="button"
              disabled={googleLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
              onClick={handleGoogleLogin}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {currentMode === 'signup' && (
                <div>
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pl-10"
                  />
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
                    {currentMode === 'login' ? 'Logging in...' : 'Creating account...'}
                  </>
                ) : (
                  currentMode === 'login' ? 'Login' : 'Start Free Trial'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {currentMode === 'login' ? (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setCurrentMode('signup')}
                    className="text-[#5928CB] hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setCurrentMode('login')}
                    className="text-[#5928CB] hover:underline"
                  >
                    Login
                  </button>
                </p>
              )}
            </div>

            {currentMode === 'login' && (
              <div className="mt-4 text-sm text-center">
                <button
                  onClick={() => {
                    setShowResetPassword(true);
                    setResetEmail(email);
                  }}
                  className="text-[#5928CB] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {currentMode === 'signup' && (
              <p className="mt-4 text-xs text-muted-foreground text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl mb-6">Reset Password</h2>
            
            <p className="text-sm text-muted-foreground mb-6">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="resetEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              {resetSuccess && (
                <div className="bg-green-50 text-green-600 p-3 rounded text-sm space-y-2">
                  <p className="font-semibold">Email sent! Check your inbox.</p>
                  <p className="text-xs">
                    <strong>Beta Testers:</strong> If the reset link doesn&apos;t work, the email may redirect to localhost. 
                    Please contact <a href="mailto:tubelab@mbd.studio" className="underline">tubelab@mbd.studio</a> and we&apos;ll reset your password manually.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={resetLoading || resetSuccess}
                className="w-full"
                style={{ backgroundColor: "#5928CB" }}
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            <div className="mt-6 text-sm text-center">
              <button
                onClick={() => {
                  setShowResetPassword(false);
                  setResetSuccess(false);
                  setError('');
                }}
                className="text-[#5928CB] hover:underline"
              >
                &larr; Back to login
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}