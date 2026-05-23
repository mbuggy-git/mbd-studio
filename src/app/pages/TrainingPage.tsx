import { TrainingForm } from "../components/TrainingForm";
import { Footer } from "../components/Footer";

export function TrainingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <TrainingForm />
      </div>
      <Footer />
    </div>
  );
}
