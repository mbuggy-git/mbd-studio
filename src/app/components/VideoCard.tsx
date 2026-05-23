import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface VideoCardProps {
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
  };
  onClick: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  const formatViews = (views: string) => {
    const num = parseInt(views);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    }
    return `${num} views`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105" 
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={video.snippet.thumbnails.medium.url}
            alt={video.snippet.title}
            className="w-full aspect-video object-cover rounded-t-lg"
          />
          <Badge 
            variant="secondary" 
            className="absolute bottom-2 right-2 bg-black/80 text-white"
          >
            Video
          </Badge>
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-t-lg">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <svg 
                className="w-5 h-5 text-black ml-0.5" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 mb-2 transition-colors font-[DM_Sans] text-[16px] font-bold" style={{ color: '#5816dd' }}>
            {video.snippet.title}
          </h3>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-bold">
              {video.statistics ? formatViews(video.statistics.viewCount) : "No stats"}
            </span>
            <span className="text-sm font-bold">
              {formatDate(video.snippet.publishedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}