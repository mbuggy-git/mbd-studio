import { PlayCircle, Play, Shuffle, Repeat } from "lucide-react";
import { PlaylistVideo } from './types';

interface PlayerScreenProps {
  currentVideo: PlaylistVideo | null;
  currentVideoIndex: number;
  videosCount: number;
  showVideo: boolean;
  isPlaying: boolean;
  isShuffled: boolean;
  isRepeat: boolean;
  onPlay: () => void;
  onBackToThumbnail: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}



export function PlayerScreen({ 
  currentVideo,
  currentVideoIndex,
  videosCount,
  showVideo,
  isPlaying,
  isShuffled,
  isRepeat,
  onPlay,
  onBackToThumbnail,
  onToggleShuffle,
  onToggleRepeat
}: PlayerScreenProps) {
  if (!currentVideo) return null;

  const iframeId = `youtube-player-${currentVideo.videoId}`;

  return (
    <div className="h-full bg-black flex flex-col">
      {!showVideo ? (
        // Thumbnail View
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-black relative">
            <img 
              src={currentVideo.thumbnail} 
              alt={currentVideo.title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={onPlay}
                className="bg-white/20 hover:bg-white/30 rounded-full p-3 backdrop-blur-sm transition-all"
              >
                <PlayCircle className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
              <div className="text-white text-xs mb-1 truncate">{currentVideo.title}</div>
              <div className="text-white/60 text-xs">Video {currentVideoIndex + 1} of {videosCount}</div>
            </div>
          </div>
          
          <div className="p-2 flex justify-center items-center space-x-4">
            <button 
              onClick={onToggleShuffle}
              className={`p-1 rounded-full ${isShuffled ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Shuffle className="w-3 h-3" />
            </button>
            <button 
              onClick={onToggleRepeat}
              className={`p-1 rounded-full ${isRepeat ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Repeat className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        // Video Player View
        <div className="flex-1 flex items-center justify-center bg-black relative">
          <iframe
            id={iframeId}
            key={currentVideo.videoId}
            src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&fs=1&enablejsapi=1`}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title={currentVideo.title}
          />
          
          {/* iPod-style status indicator */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 z-10">
            {isPlaying ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-xs">iPod Playing</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span className="text-white/80 text-xs">iPod Paused</span>
              </>
            )}
          </div>
          
          <button
            onClick={onBackToThumbnail}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-2 py-1 rounded text-xs z-10"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}