import { API_KEY } from './constants';
import { PlaylistVideo } from './types';

// Test function to validate playlist access
export const testPlaylistAccess = async (playlistId: string): Promise<boolean> => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Playlist ${playlistId} access test failed:`, response.status);
      return false;
    }
    
    const data = await response.json();
    const exists = data.items && data.items.length > 0;
    console.log(`Playlist ${playlistId} exists:`, exists);
    return exists;
  } catch (error) {
    console.error(`Error testing playlist ${playlistId}:`, error);
    return false;
  }
};

export const fetchPlaylistVideos = async (playlistId: string): Promise<PlaylistVideo[]> => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`;
    console.log('Fetching playlist videos:', playlistId);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API Error:', response.status, errorText);
      
      if (response.status === 404) {
        throw new Error(`Playlist not found (${playlistId}). The playlist may be private or doesn't exist.`);
      } else if (response.status === 403) {
        throw new Error(`Access forbidden. Check API key permissions or quota limits.`);
      } else if (response.status === 400) {
        throw new Error(`Bad request. Invalid playlist ID format: ${playlistId}`);
      } else {
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
      }
    }
    
    const data = await response.json();
    console.log(`Playlist ${playlistId} API response:`, {
      totalResults: data.pageInfo?.totalResults || 0,
      itemsCount: data.items?.length || 0
    });

    if (data.error) {
      console.error('YouTube API returned error:', data.error);
      throw new Error(`YouTube API Error: ${data.error.message}`);
    }

    if (data.items && data.items.length > 0) {
      const videos = data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        duration: 'PT3M30S', // Default duration for display
        videoId: item.snippet.resourceId.videoId
      }));
      console.log(`✅ Successfully fetched ${videos.length} videos from playlist ${playlistId}`);
      return videos;
    }

    console.log(`⚠️ No videos found in playlist ${playlistId}`);
    return [];
  } catch (error) {
    console.error('❌ Error in fetchPlaylistVideos:', error);
    throw error;
  }
};