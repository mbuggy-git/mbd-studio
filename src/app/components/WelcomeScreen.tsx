import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Youtube, Calendar, BarChart3, Tag, Target, X } from "lucide-react";
import TubeLabLogo from "../imports/TubeLabLogo";
import { useNavigate } from "react-router-dom";

interface WelcomeScreenProps {
  onClose: () => void;
  userName?: string | null;
  isNewUser?: boolean;
}

export function WelcomeScreen({ onClose, userName, isNewUser }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: `Welcome to TubeLab${userName ? `, ${userName}` : ''}!`,
      description: "Your comprehensive YouTube video analytics and management platform",
      icon: <TubeLabLogo isDarkMode={false} className="w-full max-w-[300px] mx-auto mb-6" />,
      features: [
        { icon: Youtube, text: "Connect your YouTube channel for automated data sync" },
        { icon: BarChart3, text: "Track views, CTR, retention, and watch time" },
        { icon: Tag, text: "Organize videos with custom tags and categories" },
        { icon: Target, text: "Set performance goals and track progress" },
      ]
    },
    {
      title: "Your 30-Day Free Trial",
      description: "Full access to all TubeLab features",
      icon: <Calendar className="w-24 h-24 text-[#5928CB] mx-auto mb-6" />,
      features: [
        { icon: null, text: "✓ No credit card required" },
        { icon: null, text: "✓ Full access to all features" },
        { icon: null, text: "✓ Trial ends December 9, 2025 (30 days from now)" },
        { icon: null, text: "✓ We'll keep your data for 30 days after trial ends" },
      ]
    },
    {
      title: "Next: Connect YouTube",
      description: "Get started by connecting your YouTube channel",
      icon: <Youtube className="w-24 h-24 text-[#5928CB] mx-auto mb-6" />,
      features: [
        { icon: null, text: "📊 Automatic analytics sync from YouTube" },
        { icon: null, text: "🎯 Real-time performance tracking" },
        { icon: null, text: "🔒 Secure OAuth connection" },
        { icon: null, text: "⚡ Import your video library instantly" },
      ]
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl p-8 md:p-12 relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="text-center mb-8">
          {typeof currentStepData.icon === 'object' && currentStepData.icon}
          
          <h1 className="text-3xl md:text-4xl mb-4">
            {currentStepData.title}
          </h1>
          
          <p className="text-lg text-muted-foreground">
            {currentStepData.description}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {currentStepData.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              {feature.icon && (
                <feature.icon className="w-5 h-5 text-[#5928CB] mt-0.5 flex-shrink-0" />
              )}
              <p className={`text-sm md:text-base ${!feature.icon ? 'ml-0' : ''}`}>
                {feature.text}
              </p>
            </div>
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-[#5928CB]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              Previous
            </Button>
          )}
          
          <Button
            onClick={() => {
              if (currentStep < steps.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                // On last step, go to YouTube setup
                navigate('/youtube-setup');
              }
            }}
            className="flex-1"
            style={{ backgroundColor: "#5928CB" }}
          >
            {currentStep < steps.length - 1 ? 'Next' : 'Connect YouTube'}
          </Button>
        </div>

        {currentStep === steps.length - 1 && (
          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip and explore on my own →
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}