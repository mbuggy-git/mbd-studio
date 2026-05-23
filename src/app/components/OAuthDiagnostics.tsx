import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

export function OAuthDiagnostics() {
  const [copied, setCopied] = useState(false);
  
  const redirectUri = `${window.location.origin}/oauth-callback.html`;
  const clientId = "430888277505-u2rj0hok39fd0nh3t2n83hrkfovosim1.apps.googleusercontent.com";
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Card className="p-6 bg-yellow-50 border-yellow-200 border-2">
      <h3 className="text-xl mb-4">⚠️ BEFORE Clicking "Connect Analytics"</h3>
      
      <Alert className="mb-4 bg-purple-50 border-purple-300">
        <AlertDescription className="space-y-3">
          <p className="font-semibold text-purple-900">📝 STEP 0: Sign Into Google First!</p>
          <p className="text-sm text-purple-800">
            Before starting the OAuth flow, make sure you're signed into the correct Google account in your browser.
          </p>
          <a
            href="https://accounts.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
          >
            Sign Into Google Account
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </AlertDescription>
      </Alert>
      
      <Alert className="mb-4 bg-red-50 border-red-300">
        <AlertDescription className="space-y-2">
          <p className="font-semibold text-red-800">IMPORTANT: You MUST configure Google Cloud Console first!</p>
          <p className="text-sm">If you click "Connect Analytics" without completing these steps, Google will show an error.</p>
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">1️⃣ Verify Client ID</h4>
          <div className="bg-white p-3 rounded border flex items-center justify-between">
            <code className="text-sm break-all">{clientId}</code>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => copyToClipboard(clientId)}
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            ✅ This should match your Client ID in Google Cloud Console
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">2️⃣ Add This Redirect URI</h4>
          <div className="bg-white p-3 rounded border flex items-center justify-between">
            <code className="text-sm break-all text-blue-600">{redirectUri}</code>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => copyToClipboard(redirectUri)}
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-red-600 mt-1">
            ⚠️ <strong>THIS MUST EXACTLY MATCH</strong> what's in Google Cloud Console (including http/https and www)
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h4 className="font-semibold mb-2">📋 Steps to Fix in Google Cloud Console:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console → Credentials</a></li>
            <li>Click on your OAuth 2.0 Client ID</li>
            <li>Under "Authorized redirect URIs", verify you have <strong>exactly</strong>:</li>
            <li className="ml-6 font-mono text-blue-600">{redirectUri}</li>
            <li>If it's missing or different, add/fix it and click "SAVE"</li>
            <li>Copy the <strong>Client Secret</strong> from that page</li>
            <li>Come back here and enter it in the secret input above</li>
            <li>Try "Connect Analytics" again</li>
          </ol>
        </div>
        
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <h4 className="font-semibold mb-2">✅ Checklist:</h4>
          <ul className="text-sm space-y-1">
            <li>☐ Redirect URI matches exactly (copy from above)</li>
            <li>☐ Client Secret has been entered (use the secret input)</li>
            <li>☐ Your email is added as a Test User in OAuth consent screen → Audience tab</li>
            <li>☐ OAuth consent screen is in "Testing" mode (not published)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}