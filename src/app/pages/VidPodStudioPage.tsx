import { VidPodStudio } from "../components/VidPodStudio";
import { Footer } from "../components/Footer";

export function VidPodStudioPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <VidPodStudio />
      </div>
      <Footer />
    </div>
  );
}
