import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { PlaylistConfig } from './types';

interface PlaylistEmbedScreenProps {
  playlist: PlaylistConfig;
  onBack: () => void;
}

export const PlaylistEmbedScreen: React.FC<PlaylistEmbedScreenProps> = ({ 
  playlist, 
  onBack 
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-300 bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <h3 className="text-sm font-medium text-gray-800 truncate">
            {playlist.name} Playlist
          </h3>
          <div className="w-12" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* YouTube Playlist Embed */}
      <div className="flex-1 bg-black">
        <iframe
          src={playlist.embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          title={`${playlist.name} Playlist`}
        />
      </div>

      {/* iPod-style info bar */}
      <div className="p-2 bg-gradient-to-b from-gray-100 to-gray-200 border-t border-gray-300">
        <div className="text-center">
          <div className="text-xs text-gray-600">Now Playing</div>
          <div className="text-xs font-medium text-gray-800 truncate">
            {playlist.name} Playlist
          </div>
        </div>
      </div>
    </div>
  );
};