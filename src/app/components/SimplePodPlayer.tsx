import { useState, useEffect } from "react";
import { SimplePodPlayerProps, PlaylistVideo, ScreenType, PlaylistConfig } from './SimplePodPlayer/types';
import { SCREEN_TYPES, PLAYLIST_CONFIGS } from './SimplePodPlayer/constants';
import { fetchPlaylistVideos, testPlaylistAccess } from './SimplePodPlayer/utils';
import { MenuScreen } from './SimplePodPlayer/MenuScreen';
import { PlaylistScreen } from './SimplePodPlayer/PlaylistScreen';
import { PlayerScreen } from './SimplePodPlayer/PlayerScreen';
import { PlaylistEmbedScreen } from './SimplePodPlayer/PlaylistEmbedScreen';
import { ClickWheel } from './SimplePodPlayer/ClickWheel';

export function SimplePodPlayer({ onBack, embedded = false, playlistId, moodName = "Default" }: SimplePodPlayerProps) {
  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<ScreenType>(SCREEN_TYPES.MENU);
  const [showVideo, setShowVideo] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [showPlaylistEmbed, setShowPlaylistEmbed] = useState(false);
  const [currentPlaylistConfig, setCurrentPlaylistConfig] = useState<PlaylistConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentVideo = videos[currentVideoIndex];

  // Fetch playlist videos and set current playlist config
  useEffect(() => {
    const loadPlaylistVideos = async () => {
      if (!playlistId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // First test if the playlist is accessible
        const isAccessible = await testPlaylistAccess(playlistId);
        if (!isAccessible) {
          throw new Error(`Playlist ${playlistId} is not accessible. It may be private or doesn't exist.`);
        }
        
        const playlistVideos = await fetchPlaylistVideos(playlistId);
        setVideos(playlistVideos);
        setCurrentVideoIndex(0);
        
        // Set the current playlist config for embed functionality
        const config = Object.values(PLAYLIST_CONFIGS).find(p => p.playlistId === playlistId);
        setCurrentPlaylistConfig(config || null);
        
        // Auto-navigate to player when videos load
        if (playlistVideos.length > 0) {
          setScreen(SCREEN_TYPES.PLAYER);
        } else {
          // If no videos found via API but we have embed config, that's still ok
          const config = Object.values(PLAYLIST_CONFIGS).find(p => p.playlistId === playlistId);
          if (config) {
            setError("API access limited. Use 'Play Playlist' for full experience.");
          } else {
            setError("No videos found in this playlist.");
          }
        }
      } catch (error) {
        console.log('Error fetching playlist:', error);
        setError(error instanceof Error ? error.message : "Failed to load playlist");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylistVideos();
  }, [playlistId]);

  // Control handlers
  const handlePlay = () => {
    if (!showVideo) {
      // First time clicking play - show video and start playing
      setShowVideo(true);
      setIsPlaying(true);
    } else {
      // When in video mode, control YouTube player and update iPod state
      if (isPlaying) {
        sendYouTubeCommand('pauseVideo');
        setIsPlaying(false);
      } else {
        sendYouTubeCommand('playVideo');
        setIsPlaying(true);
      }
    }
  };

  const handleNext = () => {
    // Stop current video before changing
    if (showVideo && currentVideo) {
      sendYouTubeCommand('pauseVideo');
    }
    
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * videos.length);
      setCurrentVideoIndex(randomIndex);
    } else {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }
    // Reset to thumbnail view when changing videos
    setShowVideo(false);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    // Stop current video before changing
    if (showVideo && currentVideo) {
      sendYouTubeCommand('pauseVideo');
    }
    
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
    // Reset to thumbnail view when changing videos
    setShowVideo(false);
    setIsPlaying(false);
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
    setShowVideo(false);
    setIsPlaying(false);
    setScreen(SCREEN_TYPES.PLAYER);
  };

  const handleMenuClick = () => {
    if (screen === SCREEN_TYPES.PLAYER) setScreen(SCREEN_TYPES.MENU);
    else if (screen === SCREEN_TYPES.PLAYLIST) setScreen(SCREEN_TYPES.MENU);
    else setScreen(SCREEN_TYPES.PLAYLIST);
  };

  // YouTube iframe control functions
  const sendYouTubeCommand = (command: string) => {
    if (!currentVideo) return;
    const iframeId = `youtube-player-${currentVideo.videoId}`;
    
    // Small delay to ensure iframe is ready
    setTimeout(() => {
      const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        console.log(`Sending YouTube command: ${command} to iframe: ${iframeId}`);
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: ''
          }),
          'https://www.youtube.com'
        );
      } else {
        console.warn(`Could not find iframe with ID: ${iframeId}`);
      }
    }, 100);
  };

  const handleCenterClick = () => {
    if (screen === SCREEN_TYPES.MENU) {
      setScreen(SCREEN_TYPES.PLAYER);
    } else if (screen === SCREEN_TYPES.PLAYLIST) {
      // In playlist screen, center button could go to current video
      setScreen(SCREEN_TYPES.PLAYER);
    } else if (screen === SCREEN_TYPES.PLAYER) {
      // In player screen, center button handles video playback
      if (!showVideo) {
        // First time - show video
        setShowVideo(true);
        setIsPlaying(true);
      } else {
        // When video is showing, control YouTube player and toggle iPod state
        if (isPlaying) {
          sendYouTubeCommand('pauseVideo');
          setIsPlaying(false);
        } else {
          sendYouTubeCommand('playVideo');
          setIsPlaying(true);
        }
      }
    }
  };

  const handleBackToThumbnail = () => {
    // Pause the video before going back to thumbnail
    if (currentVideo) {
      sendYouTubeCommand('pauseVideo');
    }
    // Return to thumbnail view - this will stop playback and hide video
    setShowVideo(false);
    setIsPlaying(false);
  };

  const handlePlaylistEmbedClick = () => {
    setShowPlaylistEmbed(true);
  };

  const handleBackFromEmbed = () => {
    setShowPlaylistEmbed(false);
  };

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

  if (!playlistId || (videos.length === 0 && !loading)) {
    return (
      <div className={embedded ? "flex items-center justify-center" : "min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-center"}>
        <div className="bg-white w-80 h-96 rounded-3xl shadow-2xl border border-gray-300 flex items-center justify-center">
          <div className="text-black text-center p-6">
            {error ? (
              <>
                <div className="text-lg mb-2">🎵</div>
                <div className="text-sm mb-2">Ready to Play</div>
                <div className="text-xs text-gray-600 leading-relaxed mb-3">
                  {error}
                </div>
                {currentPlaylistConfig && (
                  <button
                    onClick={handlePlaylistEmbedClick}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs hover:from-red-600 hover:to-red-700 shadow-lg transition-all duration-200"
                  >
                    ▶️ Play Playlist
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="text-lg mb-2">🎵</div>
                <div className="text-sm">Choose your mood above to start listening!</div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show playlist embed if requested
  if (showPlaylistEmbed && currentPlaylistConfig) {
    return (
      <div className={embedded ? "flex items-center justify-center" : "min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-center p-8"}>
        <div className="bg-white w-80 h-96 rounded-3xl shadow-2xl border border-gray-300 overflow-hidden">
          <PlaylistEmbedScreen 
            playlist={currentPlaylistConfig}
            onBack={handleBackFromEmbed}
          />
        </div>
      </div>
    );
  }

  const playerContent = (
    <div className="relative">
      <div className="bg-white w-80 h-96 rounded-3xl shadow-2xl border border-gray-300 flex flex-col">
        {/* Screen */}
        <div className="h-48 m-6 mb-4 bg-black rounded-lg border-2 border-gray-400 overflow-hidden">
          <div className="h-full bg-gradient-to-b from-gray-900 to-black text-xs">
            {screen === SCREEN_TYPES.MENU && (
              <MenuScreen 
                moodName={moodName}
                videosCount={videos.length}
                embedded={embedded}
                onPlaylistClick={() => setScreen(SCREEN_TYPES.PLAYLIST)}
                onPlayerClick={() => setScreen(SCREEN_TYPES.PLAYER)}
                onPlaylistEmbedClick={handlePlaylistEmbedClick}
                onBack={onBack}
              />
            )}
            {screen === SCREEN_TYPES.PLAYLIST && (
              <PlaylistScreen 
                moodName={moodName}
                videos={videos}
                currentVideoIndex={currentVideoIndex}
                onVideoSelect={handleVideoSelect}
              />
            )}
            {screen === SCREEN_TYPES.PLAYER && (
              <PlayerScreen 
                currentVideo={currentVideo}
                currentVideoIndex={currentVideoIndex}
                videosCount={videos.length}
                showVideo={showVideo}
                isPlaying={isPlaying}
                isShuffled={isShuffled}
                isRepeat={isRepeat}
                onPlay={handlePlay}
                onBackToThumbnail={handleBackToThumbnail}
                onToggleShuffle={() => setIsShuffled(!isShuffled)}
                onToggleRepeat={() => setIsRepeat(!isRepeat)}
              />
            )}
          </div>
        </div>
        
        {/* Click Wheel */}
        <div className="flex-1 flex items-center justify-center pb-6">
          <ClickWheel 
            screen={screen}
            showVideo={showVideo}
            isPlaying={isPlaying}
            onMenuClick={handleMenuClick}
            onPrevClick={handlePrev}
            onNextClick={handleNext}
            onCenterClick={handleCenterClick}
          />
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