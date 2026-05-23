import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Calendar, Eye, ThumbsUp, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface VideoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: {
          url: string;
        };
      };
      publishedAt: string;
      channelTitle: string;
    };
    statistics?: {
      viewCount: string;
      likeCount: string;
    };
  } | null;
}

export function VideoLightbox({ isOpen, onClose, video }: VideoLightboxProps) {
  if (!video) return null;

  const formatViews = (views: string) => {
    const num = parseInt(views);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const embedUrl = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1&rel=0`;
  const youtubeUrl = `https://youtube.com/watch?v=${video.id.videoId}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="relative">
          {/* Video Player */}
          <div className="aspect-video bg-black">
            <iframe
              src={embedUrl}
              title={video.snippet.title}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          
          {/* Video Info */}
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-left text-xl font-bold leading-tight">
                {video.snippet.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Watch video and view details
              </DialogDescription>
            </DialogHeader>
            
            {/* Stats and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex flex-wrap gap-3">
                {video.statistics && (
                  <>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(video.statistics.viewCount)} views
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {formatViews(video.statistics.likeCount)} likes
                    </Badge>
                  </>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(video.snippet.publishedAt)}
                </Badge>
              </div>
              
              <Button asChild variant="outline" size="sm">
                <a 
                  href={youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Watch on YouTube
                </a>
              </Button>
            </div>
            
            {/* Description */}
            {video.snippet.description && (
              <div className="border-t pt-4">
                <h4 className="mb-2">Description</h4>
                <p className="text-muted-foreground text-sm leading-relaxed max-h-32 overflow-y-auto">
                  {video.snippet.description.length > 500 
                    ? `${video.snippet.description.substring(0, 500)}...`
                    : video.snippet.description
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}