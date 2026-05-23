import { PlaylistVideo } from './types';

interface PlaylistScreenProps {
  moodName: string;
  videos: PlaylistVideo[];
  currentVideoIndex: number;
  onVideoSelect: (index: number) => void;
}

export function PlaylistScreen({ 
  moodName, 
  videos, 
  currentVideoIndex, 
  onVideoSelect 
}: PlaylistScreenProps) {
  return (
    <div className="h-full overflow-auto text-white">
      <div className="text-center text-xs mb-2 p-2 border-b border-gray-600">
        <div className="text-blue-400">{moodName} Playlist</div>
        <div className="text-gray-400">({videos.length} videos)</div>
      </div>
      <div className="space-y-1">
        {videos.map((video, index) => (
          <div
            key={video.id}
            onClick={() => onVideoSelect(index)}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}