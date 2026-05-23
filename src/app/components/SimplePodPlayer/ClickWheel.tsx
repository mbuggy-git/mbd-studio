import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { ScreenType } from './types';

interface ClickWheelProps {
  screen: ScreenType;
  showVideo: boolean;
  isPlaying: boolean;
  onMenuClick: () => void;
  onPrevClick: () => void;
  onNextClick: () => void;
  onCenterClick: () => void;
}

export function ClickWheel({ 
  screen,
  showVideo,
  isPlaying,
  onMenuClick,
  onPrevClick,
  onNextClick,
  onCenterClick
}: ClickWheelProps) {
  return (
    <div className="relative w-48 h-48 bg-white rounded-full shadow-inner border-4 border-gray-200">
      <div className="absolute inset-2 rounded-full border-2 border-gray-300">
        {/* Menu button - back to top */}
        <button 
          onClick={onMenuClick}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors"
        >
          MENU
        </button>
        
        {/* Previous button */}
        <button 
          onClick={onPrevClick}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        
        {/* Next button */}
        <button 
          onClick={onNextClick}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>
        
        {/* Center button - with play/pause icon */}
        <button 
          onClick={onCenterClick}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors shadow-lg"
        >
          {screen === 'player' && showVideo ? (
            isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}