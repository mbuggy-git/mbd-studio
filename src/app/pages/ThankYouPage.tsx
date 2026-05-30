import { Link } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

export function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-gradient-to-br from-[#5928CB] to-[#F65CE1]">
        <Navigation variant="gradient" />

        <div className="max-w-[760px] mx-auto px-6 py-20 lg:py-28 text-center">
          <h1 className="text-white text-[40px] sm:text-[52px] lg:text-[64px] font-bold leading-[1.05]">
            Thank you for your purchase!
          </h1>
          <p className="mt-4 text-white/95 text-xl sm:text-2xl font-medium">
            Your handbook is on its way to your inbox.
          </p>

          <div className="mt-10 space-y-5 text-white/95 text-[20px] [font-weight:400]! leading-relaxed">
            <p>
              Check your email — we've just sent your download link to the
              address you used at checkout. The link is valid for 7 days.
            </p>
            <p>
              Didn't get the email? Check your spam folder, or{" "}
              <a
                href="mailto:hello@mbd.studio"
                className="font-bold underline underline-offset-4 hover:text-white"
              >
                contact us
              </a>{" "}
              and we'll resend it.
            </p>
          </div>

          <div className="mt-12">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-[#5816dd] text-white px-8 py-4 text-lg font-bold shadow-[0px_10px_15px_0px_rgba(0,0,0,0.25),0px_4px_6px_0px_rgba(0,0,0,0.15)] transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
            >
              ← Back to mbd.studio
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
