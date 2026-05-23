import { useState, useRef } from "react";
import { Zap, Heart, Leaf } from "lucide-react";
import { SimplePodPlayer } from "./SimplePodPlayer";
import { Navigation } from "./Navigation";
import backgroundImage from "figma:asset/c18032896c669b52257857422397d61b2796421f.png";
import heroImage from "figma:asset/359d7420ab46674d9bb9081361dbe937f8e6f419.png";

type Mood = 'energetic' | 'happy' | 'mellow';

const MOOD_PLAYLISTS = {
  energetic: {
    id: 'PLSrOicmc09kTlJmhNhgNITqVi3HfJHdTN',
    name: 'Energetic',
    color: 'from-orange-500 to-red-500',
    icon: Zap,
    description: 'High energy tracks to get you pumped!'
  },
  happy: {
    id: 'PLSrOicmc09kS6yzDfh3EwK2KwkhBQPrSK',
    name: 'Happy',
    color: 'from-yellow-400 to-pink-400',
    icon: Heart,
    description: 'Feel-good music to brighten your day'
  },
  mellow: {
    id: 'PLSrOicmc09kRFE2r0bRwP0wjYzO6PlVNq',
    name: 'Mellow',
    color: 'from-blue-400 to-purple-400',
    icon: Leaf,
    description: 'Chill and relaxing vibes'
  }
};

export function VidPodStudio() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const ipodRef = useRef<HTMLDivElement>(null);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    
    // Scroll to iPod player after a short delay to allow state to update
    // Use requestAnimationFrame for better mobile performance
    setTimeout(() => {
      if (ipodRef.current) {
        // Check if we're on mobile for more optimized scrolling
        const isMobile = window.innerWidth < 1024; // lg breakpoint
        
        ipodRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: isMobile ? 'start' : 'center',
          inline: 'nearest'
        });
      }
    }, 150);
  };

  const handleBack = () => {
    setSelectedMood(null);
    // Scroll back to top smoothly
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  return (
    <>
      {/* Navigation */}
      <Navigation 
        variant="default"
        currentPage="vidpod"
      />
      
      {/* Main Content with Background */}
      <div 
        className="min-h-[calc(100vh-73px)] bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backgroundImage})` 
        }}
      >
        {/* Hero Image - Mobile Only */}
        <div className="flex justify-center pt-8 pb-8 lg:hidden">
          <img 
            src={heroImage} 
            alt="VidPod Studio"
            className="w-[350px] h-auto"
          />
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden max-w-4xl mx-auto px-6 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-white text-2xl mb-4">What's your mood?</h2>
            <p className="text-white/80 text-sm">Choose a vibe and let the music take you there</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Object.entries(MOOD_PLAYLISTS).map(([key, mood]) => {
              const IconComponent = mood.icon;
              const isSelected = selectedMood === key;
              
              return (
                <button
                  key={key}
                  onClick={() => handleMoodSelect(key as Mood)}
                  className={`relative group p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                    isSelected 
                      ? 'ring-4 ring-white/50 shadow-2xl scale-105' 
                      : 'hover:shadow-xl'
                  }`}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10 text-white text-center">
                    <div className="mb-4 flex justify-center">
                      <div className={`p-3 rounded-full bg-white/20 backdrop-blur-sm ${isSelected ? 'animate-pulse' : ''}`}>
                        <IconComponent className="w-8 h-8" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl mb-2 font-bold">{mood.name}</h3>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {mood.description}
                    </p>
                    
                    {isSelected && (
                      <div className="mt-3 inline-flex items-center text-xs bg-white/20 rounded-full px-3 py-1">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        Selected
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              );
            })}
          </div>

          {/* Mood Description */}
          {selectedMood && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${MOOD_PLAYLISTS[selectedMood].color} mr-3`}></div>
                <span className="text-sm">
                  Now playing: <span className="font-medium">{MOOD_PLAYLISTS[selectedMood].name}</span> vibes
                </span>
              </div>
            </div>
          )}

          {/* iPod Player - Mobile */}
          <div ref={ipodRef} className="flex justify-center">
            <SimplePodPlayer 
              onBack={handleBack} 
              embedded 
              playlistId={selectedMood ? MOOD_PLAYLISTS[selectedMood].id : undefined}
              moodName={selectedMood ? MOOD_PLAYLISTS[selectedMood].name : undefined}
            />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block max-w-7xl mx-auto px-6 pb-16 pt-8">
          {/* Centered Hero Image */}
          <div className="flex justify-center mb-8">
            <img 
              src={heroImage} 
              alt="VidPod Studio"
              className="w-[350px] h-auto"
            />
          </div>

          {/* Centered Title and Description */}
          <div className="text-center mb-12">
            <h2 className="text-white text-2xl mb-4">What's your mood?</h2>
            <p className="text-white/80 text-sm">Choose a vibe and let the music take you there</p>
          </div>

          {/* Mood Selection Cards - Above iPod */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Object.entries(MOOD_PLAYLISTS).map(([key, mood]) => {
                const IconComponent = mood.icon;
                const isSelected = selectedMood === key;
                
                return (
                  <button
                    key={key}
                    onClick={() => handleMoodSelect(key as Mood)}
                    className={`relative group p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      isSelected 
                        ? 'ring-4 ring-white/50 shadow-2xl scale-105' 
                        : 'hover:shadow-xl'
                    }`}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-white text-center">
                      <div className="mb-4 flex justify-center">
                        <div className={`p-3 rounded-full bg-white/20 backdrop-blur-sm ${isSelected ? 'animate-pulse' : ''}`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                      </div>
                      
                      <h3 className="text-xl mb-2 font-bold">{mood.name}</h3>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {mood.description}
                      </p>
                      
                      {isSelected && (
                        <div className="mt-3 inline-flex items-center text-xs bg-white/20 rounded-full px-3 py-1">
                          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                          Selected
                        </div>
                      )}
                    </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                );
              })}
            </div>

            {/* Mood Description */}
            {selectedMood && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${MOOD_PLAYLISTS[selectedMood].color} mr-3`}></div>
                  <span className="text-sm">
                    Now playing: <span className="font-medium">{MOOD_PLAYLISTS[selectedMood].name}</span> vibes
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* iPod Player - Centered Below Moods */}
          <div ref={ipodRef} className="flex justify-center">
            <SimplePodPlayer 
              onBack={handleBack} 
              embedded 
              playlistId={selectedMood ? MOOD_PLAYLISTS[selectedMood].id : undefined}
              moodName={selectedMood ? MOOD_PLAYLISTS[selectedMood].name : undefined}
            />
          </div>
        </div>
      </div>
    </>
  );
}