import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, PlayCircle } from "lucide-react";

const API_KEY = "AIzaSyCaKzaIrzVB8wYhjfkhP5MeEVffoOBLHZs";

interface PlaylistVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  videoId: string;
}

interface IPodPlayerProps {
  onBack: () => void;
  embedded?: boolean;
  playlistId?: string;
  moodName?: string;
}

export function IPodPlayer({ onBack, embedded = false, playlistId, moodName = "Default" }: IPodPlayerProps) {
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [menuScreen, setMenuScreen] = useState<'main' | 'playlist' | 'video'>('main');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Current video derived from videos array
  const currentVideo = videos[currentVideoIndex];

  // Fetch playlist videos
  useEffect(() => {
    const fetchPlaylistVideos = async () => {
      if (!playlistId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        if (data.items && data.items.length > 0) {
          // Get video IDs for duration info
          const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
          const detailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`
          );
          const detailsData = await detailsResponse.json();

          const playlistVideos: PlaylistVideo[] = data.items.map((item: any, index: number) => {
            const details = detailsData.items?.find((detail: any) => detail.id === item.snippet.resourceId.videoId);
            return {
              id: item.id,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
              duration: details?.contentDetails?.duration || 'PT0S',
              videoId: item.snippet.resourceId.videoId
            };
          });

          setVideos(playlistVideos);
          setCurrentVideoIndex(0);
          
          // Auto-start: Go to video screen when playlist loads
          if (playlistVideos.length > 0) {
            setMenuScreen('video');
          }
        } else {
          setVideos([]);
        }
      } catch (error) {
        console.log('Error fetching playlist:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistVideos();
  }, [playlistId]);

  // Format duration from ISO 8601 to mm:ss
  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    const totalMinutes = hours * 60 + minutes;
    return `${totalMinutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format time for display
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Audio controls
  const togglePlay = () => {
    if (menuScreen === 'video' && currentVideo && !showVideoPlayer) {
      // If we're on the video screen with thumbnail, load the video player
      handleLoadVideo();
    } else if (menuScreen === 'video' && showVideoPlayer) {
      // If video player is showing, toggle pause state
      const newPausedState = !isPaused;
      setIsPaused(newPausedState);
      setIsPlaying(!newPausedState);
    } else {
      // Toggle play state for audio simulation
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * videos.length);
      setCurrentVideoIndex(randomIndex);
    } else {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }
    setCurrentTime(0);
    setIsPlaying(false);
    setIsPaused(false);
    
    // Reset video player when changing tracks - the useEffect will handle reloading
    if (menuScreen === 'video' && showVideoPlayer) {
      setVideoLoaded(false);
      setShowVideoPlayer(false);
    }
  };

  const prevTrack = () => {
    if (currentTime > 3) {
      setCurrentTime(0);
    } else {
      setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
      setCurrentTime(0);
      setIsPlaying(false);
      setIsPaused(false);
      
      // Reset video player when changing tracks - the useEffect will handle reloading
      if (menuScreen === 'video' && showVideoPlayer) {
        setVideoLoaded(false);
        setShowVideoPlayer(false);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  // Load video player
  const handleLoadVideo = () => {
    if (currentVideo) {
      setVideoLoaded(false);
      setShowVideoPlayer(true);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  // Auto-start playing when we switch to video screen and have videos
  useEffect(() => {
    if (menuScreen === 'video' && currentVideo && !showVideoPlayer && videos.length > 0) {
      // Auto-load the video immediately when switching to video screen
      handleLoadVideo();
    }
  }, [menuScreen, currentVideo, showVideoPlayer, videos.length]);

  // Simulate progress for demo purposes (only when not showing video player)
  useEffect(() => {
    if (isPlaying && !showVideoPlayer) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          // Simulate video duration (3 minutes for demo)
          if (newTime >= 180) {
            if (isRepeat) {
              return 0;
            } else {
              nextTrack();
              return 0;
            }
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isRepeat, showVideoPlayer]);

  // Set duration to 3 minutes for demo
  useEffect(() => {
    setDuration(180);
  }, [currentVideoIndex]);

  // Reset video state when changing videos
  useEffect(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    setVideoLoaded(false);
    
    // If we're on video screen, keep the video player showing but reset it
    if (menuScreen === 'video' && showVideoPlayer) {
      setVideoLoaded(false);
    }
  }, [currentVideoIndex]);

  // iPod Click Wheel Component
  const ClickWheel = () => (
    <div className="relative w-48 h-48 bg-white rounded-full shadow-inner border-4 border-gray-200">
      {/* Outer ring */}
      <div className="absolute inset-2 rounded-full border-2 border-gray-300">
        {/* Menu button */}
        <button 
          onClick={() => {
            if (menuScreen === 'video') {
              setMenuScreen('main');
            } else if (menuScreen === 'playlist') {
              setMenuScreen('main');
            } else {
              setMenuScreen('playlist');
            }
          }}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors"
        >
          MENU
        </button>
        
        {/* Previous button */}
        <button 
          onClick={prevTrack}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        
        {/* Next button */}
        <button 
          onClick={nextTrack}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>
        
        {/* Video button */}
        <button 
          onClick={() => setMenuScreen('video')}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gray-100 rounded-full text-xs hover:bg-gray-200 transition-colors"
        >
          VIDEO
        </button>
        
        {/* Center button */}
        <button 
          onClick={() => {
            if (menuScreen === 'main') {
              // If on main menu, go to video screen
              setMenuScreen('video');
            } else {
              // Always toggle play/pause - let togglePlay handle the logic
              togglePlay();
            }
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors shadow-lg"
        >
          {(showVideoPlayer && isPaused) || (!showVideoPlayer && !isPlaying) ? 
            <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );

  // Main Menu Screen
  const MainMenu = () => (
    <div className="h-full flex flex-col justify-center items-center text-white">
      <div className="space-y-3 text-center">
        <div className="text-blue-400 text-xs mb-2">{moodName} Vibes</div>
        <div className="cursor-pointer hover:bg-blue-500 hover:text-white px-4 py-1 rounded" onClick={() => setMenuScreen('playlist')}>
          Playlist ({videos.length})
        </div>
        <div className="cursor-pointer hover:bg-blue-500 hover:text-white px-4 py-1 rounded" onClick={() => setMenuScreen('video')}>
          Watch Video
        </div>
        {!embedded && (
          <div className="cursor-pointer hover:bg-blue-500 hover:text-white px-4 py-1 rounded" onClick={onBack}>
            Exit
          </div>
        )}
      </div>
    </div>
  );

  // Video Screen - Shows thumbnail with play button, then video player
  const VideoScreen = () => (
    <div className="h-full bg-black flex flex-col">
      {currentVideo && (
        <>
          {!showVideoPlayer ? (
            // Thumbnail with Play Button and Controls
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-black relative">
                <img 
                  src={currentVideo.thumbnail} 
                  alt={currentVideo.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadVideo();
                    }}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-3 backdrop-blur-sm transition-all"
                  >
                    <PlayCircle className="w-6 h-6 text-white" />
                  </button>
                </div>
                
                {/* Video Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                  <div className="text-white text-xs mb-1 truncate">{currentVideo.title}</div>
                  <div className="text-white/60 text-xs">Video {currentVideoIndex + 1} of {videos.length}</div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-600 rounded-full h-1 mb-1 mt-2">
                    <div 
                      className="bg-blue-400 h-1 rounded-full transition-all"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
              
              {/* Control buttons */}
              <div className="p-2 flex justify-center items-center space-x-4">
                <button 
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={`p-1 rounded-full ${isShuffled ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  title={isShuffled ? "Shuffle On" : "Shuffle Off"}
                >
                  <Shuffle className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`p-1 rounded-full ${isRepeat ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  title={isRepeat ? "Repeat On" : "Repeat Off"}
                >
                  <Repeat className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            // Video Player with Pause Overlay
            <div className="flex-1 flex items-center justify-center bg-black relative">
              <iframe
                ref={iframeRef}
                key={`video-${currentVideo.videoId}-${currentVideoIndex}-${showVideoPlayer ? 'show' : 'hide'}`}
                src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&fs=1&cc_load_policy=0&iv_load_policy=3&showinfo=0&origin=${encodeURIComponent(window.location.origin)}`}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title={currentVideo.title}
                onLoad={() => {
                  setVideoLoaded(true);
                }}
                onError={() => {
                  setVideoLoaded(false);
                }}
              />
              
              {/* Pause Overlay */}
              {isPaused && (
                <div 
                  className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 cursor-pointer"
                  onClick={() => togglePlay()}
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-8 border-2 border-white/30 hover:bg-white/30 transition-all">
                    <Play className="w-16 h-16 text-white ml-1" />
                  </div>
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/60 px-4 py-2 rounded-full">
                    Tap to resume
                  </div>
                </div>
              )}
              
              {!videoLoaded && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <div className="text-white text-xs">Loading video...</div>
                </div>
              )}
              
              {/* Back to Thumbnail Button */}
              <button
                onClick={() => {
                  setShowVideoPlayer(false);
                  setVideoLoaded(false);
                  setIsPlaying(false);
                  setIsPaused(false);
                }}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white px-2 py-1 rounded text-xs"
              >
                Back
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Playlist Screen
  const PlaylistScreen = () => (
    <div className="h-full overflow-auto text-white">
      <div className="text-center text-xs mb-2 p-2 border-b border-gray-600">
        <div className="text-blue-400">{moodName} Playlist</div>
        <div className="text-gray-400">({videos.length} videos)</div>
      </div>
      <div className="space-y-1">
        {videos.map((video, index) => (
          <div
            key={video.id}
            onClick={() => {
              // Always update the video index and reset states
              setCurrentVideoIndex(index);
              setCurrentTime(0);
              setIsPlaying(false);
              setIsPaused(false);
              setVideoLoaded(false);
              
              // If video player is currently showing, reset it to load new video
              if (showVideoPlayer) {
                setShowVideoPlayer(false);
              }
              
              // Go to video screen - the useEffect will handle loading
              setMenuScreen('video');
            }}
            className={`p-2 text-xs cursor-pointer hover:bg-blue-500 hover:text-white transition-colors flex items-center space-x-2 ${
              index === currentVideoIndex ? 'bg-blue-500 text-white' : ''
            }`}
          >
            <img 
              src={video.thumbnail} 
              alt={video.title}
              className="w-8 h-6 object-cover rounded flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="truncate">{video.title}</div>
              <div className="text-gray-400 text-xs">{formatDuration(video.duration)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={embedded ? "flex items-center justify-center" : "min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-center"}>
        <div className="bg-white w-80 h-96 rounded-3xl shadow-2xl border border-gray-300 flex items-center justify-center">
          <div className="text-black">
            {playlistId ? `Loading ${moodName.toLowerCase()} playlist...` : "Select a mood to start"}
          </div>
        </div>
      </div>
    );
  }

  if (!playlistId || videos.length === 0) {
    return (
      <div className={embedded ? "flex items-center justify-center" : "min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-center"}>
        <div className="bg-white w-80 h-96 rounded-3xl shadow-2xl border border-gray-300 flex items-center justify-center">
          <div className="text-black text-center p-6">
            <div className="text-lg mb-2">🎵</div>
            <div className="text-sm">Choose your mood above to start listening!</div>
          </div>
        </div>
      </div>
    );
  }

  const playerContent = (
    <div className="relative">
      {/* iPod Body */}
      <div className="bg-white w-80 h-96 rounded-3xl shadow-2xl border border-gray-300 flex flex-col">
        {/* Screen */}
        <div className="h-48 m-6 mb-4 bg-black rounded-lg border-2 border-gray-400 overflow-hidden">
          <div className="h-full bg-gradient-to-b from-gray-900 to-black text-xs">
            {menuScreen === 'main' && <MainMenu />}
            {menuScreen === 'playlist' && <PlaylistScreen />}
            {menuScreen === 'video' && <VideoScreen />}
          </div>
        </div>
        
        {/* Click Wheel */}
        <div className="flex-1 flex items-center justify-center pb-6">
          <ClickWheel />
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return playerContent;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-center p-8">
      {playerContent}
    </div>
  );
}