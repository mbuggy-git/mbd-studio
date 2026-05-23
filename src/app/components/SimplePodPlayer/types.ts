export interface PlaylistVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  videoId: string;
}

export interface SimplePodPlayerProps {
  onBack: () => void;
  embedded?: boolean;
  playlistId?: string;
  moodName?: string;
}

export interface PlaylistConfig {
  name: string;
  playlistId: string;
  embedUrl: string;
}

export type ScreenType = 'menu' | 'playlist' | 'player';