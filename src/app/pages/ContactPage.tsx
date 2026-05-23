import { ContactForm } from "../components/ContactForm";
import { Footer } from "../components/Footer";

export function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <ContactForm />
      </div>
      <Footer />
    </div>
  );
}
