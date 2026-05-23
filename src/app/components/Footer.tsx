import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 lg:mx-[75px] lg:max-w-none">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-sm text-muted-foreground">
              © 2025 MBD Studio. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.iammbd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-[#5928CB] transition-colors duration-200"
              >
                Portfolio
              </a>
              <span className="text-muted-foreground">•</span>
              <Link
                to="/vidpod"
                className="text-sm text-muted-foreground hover:text-[#5928CB] transition-colors duration-200"
              >
                VidPod Studio
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://youtube.com/@MakeDailyBread"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#5928CB] hover:text-[#5928CB]/80 transition-colors duration-200"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}