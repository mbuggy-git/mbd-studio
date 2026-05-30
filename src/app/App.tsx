import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { TrainingPage } from "./pages/TrainingPage";
import { ContactPage } from "./pages/ContactPage";
import { GetTheGoodsPage } from "./pages/GetTheGoodsPage";
import { AiWorkflowsPage } from "./pages/AiWorkflowsPage";
import { ThankYouPage } from "./pages/ThankYouPage";
import { VidPodStudioPage } from "./pages/VidPodStudioPage";
import { TubeLabPage } from "./pages/TubeLabPage";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage";
import { YouTubeSetupPage } from "./pages/YouTubeSetupPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { HelpersPage } from "./pages/HelpersPage";
import { DownloadsPage } from "./pages/DownloadsPage";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <BrowserRouter basename="/">
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/preview_page.html" element={<Navigate to="/" replace />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/get-the-goods" element={<GetTheGoodsPage />} />
        <Route path="/get-the-goods/ai-workflows" element={<AiWorkflowsPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/vidpod" element={<VidPodStudioPage />} />
        <Route path="/app" element={<TubeLabPage />} />
        <Route path="/helpers" element={<HelpersPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/youtube-setup" element={<YouTubeSetupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/video-database" element={<Navigate to="/app" replace />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/oauth-callback.html" element={<OAuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}