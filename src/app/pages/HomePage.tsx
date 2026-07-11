import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VideoCard } from "../components/VideoCard";
import { VideoLightbox } from "../components/VideoLightbox";
import { ChannelHeader } from "../components/ChannelHeader";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, ChevronDown, AlertTriangle } from "lucide-react";
import { ChannelData, Video } from "../lib/types";
import { YOUTUBE_CHANNEL_URL, YOUTUBE_SUBSCRIBE_URL } from "../lib/constants";
import { fetchChannelData, fetchChannelVideos, getChannelIdFromHandle } from "../lib/api";
import TubeLabAd from "../imports/TubeLabAd";

export function HomePage() {
  const navigate = useNavigate();
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [uploadsPlaylistId, setUploadsPlaylistId] = useState<string | null>(null);

  const loadMoreVideos = async () => {
    if (!nextPageToken || !uploadsPlaylistId || loadingMore) return;
    
    setLoadingMore(true);
    
    try {
      const channelId = await getChannelIdFromHandle();
      const result = await fetchChannelVideos(channelId, nextPageToken, uploadsPlaylistId);
      
      setVideos(prevVideos => [...prevVideos, ...result.videos]);
      setNextPageToken(result.nextPageToken);
    } catch (err) {
      console.error("Error loading more videos:", err);
      setError("Failed to load more videos");
    }
    
    setLoadingMore(false);
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedVideo(null);
  };

  useEffect(() => {
    const loadChannelData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await fetchChannelData();
        if (result) {
          setChannelData(result.channelData);
          
          const videosResult = await fetchChannelVideos(result.channelId);
          setVideos(videosResult.videos);
          setNextPageToken(videosResult.nextPageToken);
          setUploadsPlaylistId(videosResult.uploadsPlaylistId);
        }
      } catch (err) {
        console.error("Error loading channel data:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load channel data";
        
        if (errorMessage.includes("quota exceeded")) {
          setError("YouTube API quota exceeded (resets daily). TubeLab still works! Click 'TubeLab' in the navigation to manage your videos.");
        } else if (errorMessage.includes("Failed to fetch videos")) {
          setError("Unable to load channel videos at this time. The TubeLab feature is still available - click 'TubeLab' in the navigation.");
        } else {
          setError(errorMessage);
        }
      }
      
      setLoading(false);
    };

    loadChannelData();
  }, []);

  const isQuotaOrDataError = error && (
    error.includes('quota exceeded') || 
    error.includes('Unable to load channel videos') ||
    error.includes('YouTube channel data unavailable')
  );

  if (loading && !error && !channelData) {
    return <LoadingState />;
  }

  if (error && !isQuotaOrDataError) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-background">
        <Navigation currentPage="home" />
        <div className="max-w-7xl mx-auto px-6 lg:mx-[75px] lg:max-w-none">
          <a 
            href="https://tubelab.app/?utm_source=mbd_studio&utm_medium=banner&utm_campaign=homepage_banner"
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity mb-6 h-[68px]"
          >
            <TubeLabAd />
          </a>
        </div>
        <div className="max-w-7xl mx-auto p-6 lg:mx-[75px] lg:max-w-none">
          {error && isQuotaOrDataError && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <p className="font-semibold">{error}</p>
                <p className="text-sm">
                  TubeLab works independently and is fully functional! Click the button below to manage your videos, import CSVs, and track analytics.
                </p>
                <Button 
                  onClick={() => navigate('/app')} 
                  style={{ backgroundColor: "#5928CB" }}
                  className="hover:opacity-90"
                >
                  Open TubeLab
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {channelData && (
            <ChannelHeader 
              channelData={channelData} 
              channelUrl={YOUTUBE_CHANNEL_URL}
            />
          )}
          
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-[#3f06cc] text-[24px]">
              Latest Videos
              <Loader2 className="w-5 h-5 animate-spin opacity-0" />
            </h2>
            <p className="text-muted-foreground text-[15px]">Check out the latest content on YouTube and don't forget to <a 
                href={YOUTUBE_SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline transition-colors duration-200 hover:opacity-80"
                style={{ color: '#5816dd' }}
              ><span className="font-bold">subscribe</span></a></p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {videos.map((video) => (
              <VideoCard
                key={video.id.videoId}
                video={video}
                onClick={() => handleVideoClick(video)}
              />
            ))}
          </div>
          
          {videos.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {error ? "Unable to load videos from YouTube at this time." : "No videos found."}
              </p>
              {error && (
                <Button 
                  onClick={() => navigate('/app')}
                  style={{ backgroundColor: "#5928CB" }}
                  className="hover:opacity-90"
                >
                  Try TubeLab Instead
                </Button>
              )}
            </div>
          )}
          
          {nextPageToken && videos.length > 0 && (
            <div className="flex justify-center mb-8">
              <Button
                onClick={loadMoreVideos}
                disabled={loadingMore}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-8 py-3 border-2 hover:bg-[#5928CB] hover:text-white hover:border-[#5928CB] transition-all duration-200"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading More Videos...
                  </>
                ) : (
                  <>
                    Load More Videos
                    <ChevronDown className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          )}
          
          <VideoLightbox
            isOpen={isLightboxOpen}
            onClose={handleCloseLightbox}
            video={selectedVideo}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}