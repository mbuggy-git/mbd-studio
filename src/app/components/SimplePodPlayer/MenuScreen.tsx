interface MenuScreenProps {
  moodName: string;
  videosCount: number;
  embedded: boolean;
  onPlaylistClick: () => void;
  onPlayerClick: () => void;
  onPlaylistEmbedClick: () => void;
  onBack: () => void;
}

export function MenuScreen({ 
  moodName, 
  videosCount, 
  embedded, 
  onPlaylistClick, 
  onPlayerClick, 
  onPlaylistEmbedClick,
  onBack 
}: MenuScreenProps) {
  return (
    <div className="h-full flex flex-col justify-center items-center text-white">
      <div className="space-y-3 text-center">
        <div className="text-blue-400 text-xs mb-2">{moodName} Vibes</div>
        <div 
          className="cursor-pointer hover:bg-blue-500 hover:text-white px-4 py-1 rounded font-bold" 
          onClick={onPlaylistClick}
        >
          Browse Videos ({videosCount})
        </div>
        <div 
          className="cursor-pointer hover:bg-blue-500 hover:text-white px-4 py-1 rounded font-bold" 
          onClick={onPlaylistEmbedClick}
        >
          Play Playlist
        </div>
        <div 
          className="cursor-pointer hover:bg-blue-500 hover:text-white px-4 py-1 rounded font-bold" 
          onClick={onPlayerClick}
        >
          Watch Video
        </div>
        {!embedded && (
          <div 
            className="cursor-pointer hover:bg-blue-500 hover:text-white px-4 py-1 rounded font-bold" 
            onClick={onBack}
          >
            Exit
          </div>
        )}
      </div>
    </div>
  );
}