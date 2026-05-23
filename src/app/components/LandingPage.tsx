import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { BarChart3, TrendingUp, Target, Zap, Calendar, MessageSquare, Menu, X } from "lucide-react";
import TubeLabLogo from "../imports/TubeLabLogo-557-1473";

interface LandingPageProps {
  onShowAuth: (mode: 'login' | 'signup') => void;
}

export function LandingPage({ onShowAuth }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(180deg, #0A070D 0%, #5928CB 51%)'
    }}>
      {/* Header */}
      <header className="container mx-auto px-4 pt-[50px] pb-6 flex justify-between items-center md:justify-between justify-center relative">
        <div className="flex items-center gap-2">
          <div className="h-12 w-auto max-w-[200px]">
            <TubeLabLogo className="w-full h-full object-contain" />
          </div>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-3">
          <Button
            onClick={() => onShowAuth('login')}
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white hover:text-[#5928CB] transition-colors"
          >
            Login
          </Button>
          <Button
            onClick={() => onShowAuth('signup')}
            className="bg-white text-[#5928CB] hover:bg-[#5928CB] hover:text-white hover:border hover:border-white transition-colors"
          >
            Start My Free Trial
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden absolute right-4 text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[rgba(10,10,10,0.95)] backdrop-blur-lg border-b border-white/20">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-3">
            <Button
              onClick={() => {
                onShowAuth('login');
                setMobileMenuOpen(false);
              }}
              variant="outline"
              className="w-full bg-transparent border-white text-white hover:bg-white hover:text-[#5928CB] transition-colors"
            >
              Login
            </Button>
            <Button
              onClick={() => {
                onShowAuth('signup');
                setMobileMenuOpen(false);
              }}
              className="w-full bg-white text-[#5928CB] hover:bg-[#5928CB] hover:text-white hover:border hover:border-white transition-colors"
            >
              Start My Free Trial
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center text-white">
        <h1 className="text-5xl mb-6">
          Smarter YouTube Insights — Now in Creator Beta
        </h1>
        <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
          Help test TubeLab and turn your analytics into action.
        </p>
        <Button
          onClick={() => onShowAuth('signup')}
          size="lg"
          className="bg-white text-[#5928CB] hover:bg-[#5928CB] hover:text-white hover:border hover:border-white transition-colors text-lg px-8 py-6"
        >
          Join the Beta – Free for 30 Days
        </Button>
        <p className="mt-4 text-white/70 text-sm">
          No credit card required • Free creator beta access for 30 days
        </p>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-3xl text-center mb-12 text-white">
          Everything You Need to Grow Your Channel
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 bg-[rgba(10,10,10,0.1)] backdrop-blur border-white/20">
            <TrendingUp className="w-12 h-12 mb-4 text-white" />
            <h3 className="text-xl mb-2 text-white">Track Your Growth</h3>
            <p className="text-white/80">
              Monitor views, likes, comments, CTR, retention, and more - all in one place
            </p>
          </Card>
          
          <Card className="p-6 bg-[rgba(10,10,10,0.1)] backdrop-blur border-white/20">
            <Calendar className="w-12 h-12 mb-4 text-white" />
            <h3 className="text-xl mb-2 text-white">Automated Milestones</h3>
            <p className="text-white/80">
              Automatic snapshots at Day 4, 7, 30, and more to track performance over time
            </p>
          </Card>
          
          <Card className="p-6 bg-[rgba(10,10,10,0.1)] backdrop-blur border-white/20">
            <Target className="w-12 h-12 mb-4 text-white" />
            <h3 className="text-xl mb-2 text-white">Performance Goals</h3>
            <p className="text-white/80">
              Set targets, identify winners, and understand which videos perform best
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl text-center mb-12 text-white">
          Simple Setup, Powerful Insights
        </h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-6 items-start">
            <div className="bg-white text-[#5928CB] rounded-full w-12 h-12 flex items-center justify-center text-xl shrink-0">
              1
            </div>
            <div className="text-white">
              <h3 className="text-xl mb-2">Connect Your Channel</h3>
              <p className="text-white/80">
                Link your YouTube account in seconds using the YouTube Data API
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 items-start">
            <div className="bg-white text-[#5928CB] rounded-full w-12 h-12 flex items-center justify-center text-xl shrink-0">
              2
            </div>
            <div className="text-white">
              <h3 className="text-xl mb-2">Sync Your Videos</h3>
              <p className="text-white/80">
                Import your videos and start tracking analytics automatically
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 items-start">
            <div className="bg-white text-[#5928CB] rounded-full w-12 h-12 flex items-center justify-center text-xl shrink-0">
              3
            </div>
            <div className="text-white">
              <h3 className="text-xl mb-2">Watch Your Growth</h3>
              <p className="text-white/80">
                Track performance, set goals, and make data-driven decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="p-12 bg-[rgba(11,11,11,0.1)] backdrop-blur border-white/20 max-w-2xl mx-auto">
          <h2 className="text-3xl mb-4 text-white">
            Ready to Level Up Your Channel?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join beta testers and get 30 days of full access
          </p>
          <Button
            onClick={() => onShowAuth('signup')}
            size="lg"
            className="bg-white text-[#5928CB] hover:bg-[#5928CB] hover:text-white hover:border hover:border-white transition-colors text-lg px-8 py-6"
          >
            Join the Beta – Free for 30 Days
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-white/60 border-t border-white/20">
        <p>&copy; 2025 TubeLab. All rights reserved.</p>
      </footer>
    </div>
  );
}