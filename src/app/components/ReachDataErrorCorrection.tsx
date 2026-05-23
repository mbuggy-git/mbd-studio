// Interface for correcting CSV import errors
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight, Save, X, AlertCircle, Download } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { getSupabaseClient } from "../utils/supabase/client";

const API_KEY = "AIzaSyCDaPedxeLy_iaKZZtEWx8m3RPp9DwYfOQ";

// Parse ISO 8601 duration (e.g., "PT1M30S" = 90 seconds, "PT45S" = 45 seconds)
function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  
  return hours * 3600 + minutes * 60 + seconds;
}

interface ImportError {
  videoId?: string;
  title: string;
  impressions?: string;
  ctr?: string;
  reason: 'not_found' | 'invalid_data' | 'parse_error';
  rawLine?: string;
}

interface Props {
  errors: ImportError[];
  dateRange: 'lifetime' | 'last28';
  onClose: () => void;
  onComplete: () => void;
}

export function ReachDataErrorCorrection({ errors, dateRange, onClose, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctedImpressions, setCorrectedImpressions] = useState("");
  const [correctedCTR, setCorrectedCTR] = useState("");
  const [correctedVideoId, setCorrectedVideoId] = useState("");
  const [saving, setSaving] = useState(false);
  const [fetchingVideo, setFetchingVideo] = useState(false);
  const [bulkFetching, setBulkFetching] = useState(false);
  const [skippedIndices, setSkippedIndices] = useState<Set<number>>(new Set());
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Get session token on mount
  useState(() => {
    const getSession = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
      }
    };
    getSession();
  });

  // Count how many errors are "not_found" type
  const notFoundErrors = errors.filter(e => e.reason === 'not_found' && e.videoId);
  const hasNotFoundErrors = notFoundErrors.length > 0;

  const currentError = errors[currentIndex];
  const totalErrors = errors.length;
  const remainingErrors = totalErrors - skippedIndices.size;

  // Initialize form with error data when changing index
  const initializeForm = (error: ImportError) => {
    setCorrectedImpressions(error.impressions || "");
    setCorrectedCTR(error.ctr || "");
    setCorrectedVideoId(error.videoId || "");
  };

  // Reset form when index changes
  useState(() => {
    if (currentError) {
      initializeForm(currentError);
    }
  });

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      initializeForm(errors[newIndex]);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalErrors - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      initializeForm(errors[newIndex]);
    }
  };

  const handleSkip = () => {
    setSkippedIndices(prev => new Set([...prev, currentIndex]));
    
    // Move to next error or close if this was the last
    if (currentIndex < totalErrors - 1) {
      handleNext();
    } else {
      // All errors processed
      toast.success(`Processed ${skippedIndices.size + 1} errors (${skippedIndices.size + 1} skipped)`);
      onComplete();
      onClose();
    }
  };

  const fetchAndAddVideoById = async (videoId: string): Promise<boolean> => {
    try {
      console.log(`🔍 Fetching video data from YouTube for: ${videoId}`);
      
      // Fetch video details from YouTube Data API (including contentDetails for duration)
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch video from YouTube");
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        console.error(`❌ Video not found on YouTube: ${videoId}`);
        return false;
      }

      const videoData = data.items[0];
      const snippet = videoData.snippet;
      const statistics = videoData.statistics;
      const contentDetails = videoData.contentDetails;

      // Parse duration to detect shorts (< 60 seconds)
      const isShort = parseDurationToSeconds(contentDetails?.duration || 'PT0S') < 60;

      // Create video object to save to database
      const newVideo = {
        videoId: videoId,
        title: snippet.title,
        description: snippet.description || "",
        publishedAt: snippet.publishedAt,
        thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.standard?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || "",
        currentViews: parseInt(statistics.viewCount || "0"),
        currentLikes: parseInt(statistics.likeCount || "0"),
        currentComments: parseInt(statistics.commentCount || "0"),
        tags: isShort ? ["Short"] : [], // Auto-tag shorts
      };

      console.log(`📹 Found video: ${newVideo.title}`);
      
      // Save to database
      const saveResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken || publicAnonKey}`,
          },
          body: JSON.stringify(newVideo),
        }
      );

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || "Failed to save video to database");
      }

      console.log(`✅ Video saved to database: ${newVideo.title}`);
      return true;
      
    } catch (error) {
      console.error("Error fetching and adding video:", error);
      return false;
    }
  };

  const handleFetchAndAddVideo = async () => {
    const videoId = correctedVideoId.trim();
    
    if (!videoId) {
      toast.error("Please enter a Video ID first");
      return;
    }

    setFetchingVideo(true);
    const success = await fetchAndAddVideoById(videoId);
    
    if (success) {
      toast.success(`✅ Video added to database`);
    } else {
      toast.error("Failed to fetch video from YouTube. Check the Video ID.");
    }
    
    setFetchingVideo(false);
  };

  const handleBulkFetchMissingVideos = async () => {
    setBulkFetching(true);
    let successCount = 0;
    let failCount = 0;

    console.log(`🚀 Bulk fetching ${notFoundErrors.length} missing videos...`);
    toast.info(`Fetching ${notFoundErrors.length} missing videos from YouTube...`);

    for (const error of notFoundErrors) {
      if (error.videoId) {
        const success = await fetchAndAddVideoById(error.videoId);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    setBulkFetching(false);
    
    if (successCount > 0) {
      toast.success(`✅ Successfully added ${successCount} video${successCount !== 1 ? 's' : ''} to database${failCount > 0 ? ` (${failCount} failed)` : ''}`);
    } else {
      toast.error(`Failed to fetch any videos. Please check your Video IDs.`);
    }
  };

  const handleSave = async () => {
    const videoId = correctedVideoId.trim();
    const impressions = parseInt(correctedImpressions);
    const ctr = parseFloat(correctedCTR);

    // Validation
    if (!videoId) {
      toast.error("Please enter a Video ID");
      return;
    }

    if (isNaN(impressions) || impressions < 0) {
      toast.error("Please enter a valid Impressions value");
      return;
    }

    if (correctedCTR && (isNaN(ctr) || ctr < 0)) {
      toast.error("Please enter a valid CTR value");
      return;
    }

    setSaving(true);
    try {
      // First, check if video exists in database
      const checkResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken || publicAnonKey}`,
          },
        }
      );

      if (!checkResponse.ok) {
        toast.error("Video not found in database. Click 'Fetch & Add Video' first to add it.");
        setSaving(false);
        return;
      }

      const videoData = await checkResponse.json();
      const video = videoData.video;

      // Create snapshot with reach data
      const snapshotResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${videoId}/advanced-snapshot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken || publicAnonKey}`,
          },
          body: JSON.stringify({
            views: video.currentViews,
            likes: video.currentLikes,
            comments: video.currentComments,
            impressions: impressions,
            ctr: correctedCTR ? ctr : undefined,
            note: `${dateRange === 'lifetime' ? 'Lifetime' : '28-day'} reach metrics (manually corrected from CSV import)`,
            dateRange: dateRange,
          }),
        }
      );

      if (!snapshotResponse.ok) {
        const errorData = await snapshotResponse.json();
        throw new Error(errorData.error || "Failed to save reach data");
      }

      toast.success(`Reach data saved for: ${currentError.title}`);

      // Mark as corrected and move to next
      setSkippedIndices(prev => new Set([...prev, currentIndex]));

      if (currentIndex < totalErrors - 1) {
        handleNext();
      } else {
        // All errors processed
        toast.success(`Successfully corrected ${skippedIndices.size + 1} videos`);
        onComplete();
        onClose();
      }
    } catch (error) {
      console.error("Error saving reach data:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save reach data");
    } finally {
      setSaving(false);
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'not_found':
        return 'Video not found in database';
      case 'invalid_data':
        return 'Invalid or missing data (NaN values)';
      case 'parse_error':
        return 'Could not parse CSV line';
      default:
        return 'Unknown error';
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Correct Reach Data Import Errors</DialogTitle>
          <DialogDescription>
            {totalErrors} video{totalErrors !== 1 ? 's' : ''} had import errors. Review and manually correct the data below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-2"  style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Bulk fetch button for missing videos */}
          {hasNotFoundErrors && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-900">
                    {notFoundErrors.length} video{notFoundErrors.length !== 1 ? 's' : ''} not found in database
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    Click below to automatically fetch and add all missing videos from YouTube
                  </div>
                </div>
                <Button
                  onClick={handleBulkFetchMissingVideos}
                  disabled={bulkFetching}
                  size="sm"
                  className="ml-4 shrink-0 text-white"
                  style={{ backgroundColor: "#5928CB" }}
                >
                  {bulkFetching ? (
                    <>Fetching {notFoundErrors.length} videos...</>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Fetch All Missing Videos
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Progress indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Error {currentIndex + 1} of {totalErrors}
            </span>
            <Badge variant="outline">
              {remainingErrors} remaining
            </Badge>
          </div>

          {/* Error details */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Video Title:</span> {currentError.title}
                </div>
                <div>
                  <span className="font-medium">Error:</span> {getReasonText(currentError.reason)}
                </div>
                {currentError.rawLine && (
                  <div className="mt-2">
                    <span className="font-medium text-xs">Raw CSV line:</span>
                    <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                      {currentError.rawLine}
                    </pre>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Correction form */}
          <div className="space-y-4 border rounded-lg p-4">
            <div>
              <Label htmlFor="video-id">Video ID *</Label>
              <div className="flex gap-2">
                <Input
                  id="video-id"
                  placeholder="e.g., dQw4w9WgXcQ"
                  value={correctedVideoId}
                  onChange={(e) => setCorrectedVideoId(e.target.value)}
                  className="flex-1"
                />
                {currentError.reason === 'not_found' && (
                  <Button
                    variant="outline"
                    onClick={handleFetchAndAddVideo}
                    disabled={fetchingVideo || !correctedVideoId.trim()}
                    className="shrink-0"
                  >
                    {fetchingVideo ? (
                      <>Fetching...</>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Fetch & Add Video
                      </>
                    )}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentError.reason === 'not_found' 
                  ? "Enter the video ID and click 'Fetch & Add Video' to add it from YouTube"
                  : "Find the 11-character video ID from YouTube Studio or video URL"
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="impressions">Impressions *</Label>
                <Input
                  id="impressions"
                  type="number"
                  placeholder="e.g., 12500"
                  value={correctedImpressions}
                  onChange={(e) => setCorrectedImpressions(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ctr">CTR (%)</Label>
                <Input
                  id="ctr"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5.2"
                  value={correctedCTR}
                  onChange={(e) => setCorrectedCTR(e.target.value)}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              💡 Copy these values from YouTube Studio Analytics for this video
            </p>
          </div>

          {/* Navigation and actions */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex === totalErrors - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSkip}
              >
                <X className="w-4 h-4 mr-2" />
                Skip
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                style={{ backgroundColor: "#5928CB" }}
                className="text-white hover:opacity-90"
              >
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}