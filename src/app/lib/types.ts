export interface ChannelData {
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    customUrl?: string;
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
}

export interface Video {
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
  contentDetails?: {
    duration: string;
  };
}

export interface AppState {
  channelData: ChannelData | null;
  videos: Video[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  selectedVideo: Video | null;
  isLightboxOpen: boolean;
  showTrainingForm: boolean;
  showGetTheGoods: boolean;
  showVidPodStudio: boolean;
  nextPageToken: string | null;
  uploadsPlaylistId: string | null;
}