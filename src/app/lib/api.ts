import { CHANNEL_HANDLE, API_KEY, YOUTUBE_API_BASE, MAX_RESULTS_PER_PAGE, MIN_VIDEO_DURATION_SECONDS } from './constants';
import { ChannelData, Video } from './types';
import { parseDuration } from './utils';

/**
 * Fetch channel data from YouTube API (with caching)
 */
export const fetchChannelData = async (): Promise<{ channelData: ChannelData; channelId: string } | null> => {
  const CACHE_KEY = 'youtube_channel_cache';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  try {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      
      // Return cached data if it's less than 24 hours old
      if (age < CACHE_DURATION) {
        console.log('✅ Using cached channel data (age: ' + Math.floor(age / 1000 / 60) + ' minutes)');
        return data;
      }
    }
    
    // Get channel ID using the improved lookup method
    const channelId = await getChannelIdFromHandle();
    console.log('✅ Channel ID resolved:', channelId);
    
    // Now get full channel data
    const response = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`
    );
    const data = await response.json();
    
    console.log('Channel data API response:', data.items ? `Found ${data.items.length} channels` : 'No items found');
    
    // Check for quota exceeded error
    if (data.error?.code === 403 && data.error?.errors?.[0]?.reason === 'quotaExceeded') {
      console.log('ℹ️ YouTube API quota exceeded (resets daily at midnight Pacific Time)');
      // Try to return cached data even if expired
      if (cached) {
        const { data: cachedData } = JSON.parse(cached);
        console.log('✅ Using expired cache as fallback');
        return cachedData;
      }
      throw new Error("YouTube API quota exceeded. Please try again tomorrow or use a different API key.");
    }
    
    if (data.items && data.items.length > 0) {
      const result = {
        channelData: data.items[0],
        channelId
      };
      
      // Cache the result
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));
      console.log('✅ Cached fresh channel data');
      
      return result;
    }
    throw new Error("Failed to fetch channel data");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    // Only log error if it's not a quota exceeded error (we already logged those above)
    if (!errorMessage.includes("quota exceeded")) {
      console.error("Error fetching channel data:", errorMessage);
    }
    
    // ALWAYS try to return cached data as a last resort (even if expired)
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        console.log('✅ Using cached data as fallback');
        return data;
      } catch (parseErr) {
        console.error('Failed to parse cache:', parseErr);
      }
    }
    
    console.log('ℹ️ No cached data available');
    throw err;
  }
};

/**
 * Get uploads playlist ID for a channel
 */
const getUploadsPlaylistId = async (channelId: string): Promise<string> => {
  console.log('🔍 Fetching uploads playlist ID for channel:', channelId);
  
  const channelResponse = await fetch(
    `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`
  );
  const channelData = await channelResponse.json();
  
  console.log('Channel contentDetails API response:', channelData.items ? `Found ${channelData.items.length} channels` : 'No items found');
  
  // Check for API errors
  if (channelData.error) {
    const errorMessage = channelData.error.message || 'Unknown API error';
    
    // Check for quota exceeded
    if (channelData.error.code === 403 && channelData.error.errors?.[0]?.reason === 'quotaExceeded') {
      console.log("ℹ️ YouTube API quota exceeded (resets daily at midnight Pacific Time)");
      throw new Error("YouTube API quota exceeded. Please try again tomorrow or use a different API key.");
    }
    
    console.error("YouTube API Error:", errorMessage);
    console.error("Full error details:", channelData.error);
    throw new Error(`YouTube API error: ${errorMessage}`);
  }
  
  if (!channelData.items || channelData.items.length === 0) {
    console.error('❌ No channel found with ID:', channelId);
    throw new Error("Channel content details not found. Please verify the channel ID.");
  }
  
  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
  console.log('✅ Found uploads playlist ID:', uploadsPlaylistId);
  
  return uploadsPlaylistId;
};

/**
 * Fetch videos from channel uploads playlist (with caching for first page only)
 */
export const fetchChannelVideos = async (
  channelId: string, 
  pageToken?: string, 
  uploadsPlaylistId?: string
): Promise<{ videos: Video[]; nextPageToken: string | null; uploadsPlaylistId: string }> => {
  const CACHE_KEY = 'youtube_videos_cache';
  const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours
  
  try {
    // Only use cache for the first page (no pageToken)
    if (!pageToken) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age < CACHE_DURATION) {
          console.log('✅ Using cached videos (age: ' + Math.floor(age / 1000 / 60) + ' minutes)');
          return data;
        }
      }
    }
    
    // Get the uploads playlist ID if we don't have it
    let playlistId = uploadsPlaylistId;
    if (!playlistId) {
      playlistId = await getUploadsPlaylistId(channelId);
    }

    // Build the URL with pagination
    let url = `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${MAX_RESULTS_PER_PAGE}&key=${API_KEY}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    // Get the videos from the uploads playlist
    const videosResponse = await fetch(url);
    const videosData = await videosResponse.json();
    
    // Check for quota exceeded error
    if (videosData.error?.code === 403 && videosData.error?.errors?.[0]?.reason === 'quotaExceeded') {
      console.log('ℹ️ YouTube API quota exceeded (resets daily)');
      if (!pageToken) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data } = JSON.parse(cached);
          console.log('✅ Using cached videos as fallback');
          return data;
        }
      }
      throw new Error("YouTube API quota exceeded. Please try again tomorrow or use a different API key.");
    }
    
    if (!videosData.items) {
      throw new Error("No videos found");
    }

    // Transform the playlist items to match our Video interface
    const transformedVideos = videosData.items.map((item: any) => ({
      id: {
        videoId: item.snippet.resourceId.videoId
      },
      snippet: {
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnails: item.snippet.thumbnails,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle
      }
    }));
    
    // Get video statistics and content details (including duration) for each video
    const videoIds = transformedVideos.map((v: Video) => v.id.videoId).join(',');
    const detailsResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=statistics,contentDetails&id=${videoIds}&key=${API_KEY}`
    );
    const detailsData = await detailsResponse.json();
    
    // Check for quota exceeded error on details request
    if (detailsData.error?.code === 403 && detailsData.error?.errors?.[0]?.reason === 'quotaExceeded') {
      console.log('ℹ️ YouTube API quota exceeded on video details (resets daily)');
      if (!pageToken) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data } = JSON.parse(cached);
          console.log('✅ Using cached videos as fallback');
          return data;
        }
      }
      throw new Error("YouTube API quota exceeded. Please try again tomorrow or use a different API key.");
    }
    
    // Merge statistics and content details with video data
    if (detailsData.items) {
      transformedVideos.forEach((video: Video) => {
        const details = detailsData.items.find((detail: any) => detail.id === video.id.videoId);
        if (details) {
          video.statistics = details.statistics;
          video.contentDetails = details.contentDetails;
        }
      });
    }
    
    // Filter out YouTube Shorts (videos 60 seconds or shorter)
    const filteredVideos = transformedVideos.filter((video: Video) => {
      if (!video.contentDetails?.duration) return true; // Keep if duration is unknown
      const durationInSeconds = parseDuration(video.contentDetails.duration);
      return durationInSeconds > MIN_VIDEO_DURATION_SECONDS;
    });
    
    const result = {
      videos: filteredVideos,
      nextPageToken: videosData.nextPageToken || null,
      uploadsPlaylistId: playlistId
    };
    
    // Cache the first page only
    if (!pageToken) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));
      console.log('✅ Cached initial videos');
    }
    
    return result;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Error fetching videos:", errorMessage);
    
    // Try to return cached data as fallback (first page only, even if expired)
    if (!pageToken) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data } = JSON.parse(cached);
          console.log('✅ Using cached videos as fallback');
          return data;
        } catch (parseErr) {
          console.error('Failed to parse cached videos:', parseErr);
        }
      }
    }
    
    console.log('ℹ️ No cached videos available');
    throw new Error("Failed to fetch videos");
  }
};

/**
 * Get channel ID from handle (helper for loading more videos) - with caching
 */
export const getChannelIdFromHandle = async (): Promise<string> => {
  const CACHE_KEY = 'youtube_channel_id_cache';
  const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days (channel IDs don't change)
  
  // Check cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    try {
      const { channelId, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      
      if (age < CACHE_DURATION) {
        console.log('✅ Using cached channel ID:', channelId);
        return channelId;
      } else {
        console.log('⏰ Cached channel ID expired, fetching fresh data');
      }
    } catch (parseError) {
      console.warn('Failed to parse cached channel ID, will fetch fresh data');
      localStorage.removeItem(CACHE_KEY);
    }
  }
  
  // Remove @ symbol if present
  const handleWithoutAt = CHANNEL_HANDLE.replace('@', '');
  
  console.log('🔍 Looking up channel ID for handle:', handleWithoutAt);
  
  // Try using forHandle parameter (works for newer channels)
  let response = await fetch(
    `${YOUTUBE_API_BASE}/channels?part=id&forHandle=${handleWithoutAt}&key=${API_KEY}`
  );
  let data = await response.json();
  
  console.log('forHandle API response:', data.items ? `Found ${data.items.length} channels` : 'No items found');
  
  // Check for quota exceeded error
  if (data.error?.code === 403 && data.error?.errors?.[0]?.reason === 'quotaExceeded') {
    console.log('ℹ️ YouTube API quota exceeded (resets daily)');
    // Try to return cached ID even if expired
    if (cached) {
      const { channelId } = JSON.parse(cached);
      console.log('✅ Using cached channel ID as fallback');
      return channelId;
    }
    throw new Error("YouTube API quota exceeded. Please try again tomorrow or use a different API key.");
  }
  
  if (data.items && data.items.length > 0) {
    const channelId = data.items[0].id;
    console.log('Found channel by forHandle:', channelId);
    
    // Cache the channel ID
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      channelId,
      timestamp: Date.now()
    }));
    
    return channelId;
  }
  
  // Fallback: Try using forUsername parameter (works for older channels)
  response = await fetch(
    `${YOUTUBE_API_BASE}/channels?part=id&forUsername=${handleWithoutAt}&key=${API_KEY}`
  );
  data = await response.json();
  
  // Check for quota exceeded error
  if (data.error?.code === 403 && data.error?.errors?.[0]?.reason === 'quotaExceeded') {
    // Try to return cached ID even if expired
    if (cached) {
      const { channelId } = JSON.parse(cached);
      console.log('⚠️ Quota exceeded, using cached channel ID');
      return channelId;
    }
    throw new Error("YouTube API quota exceeded. Please try again tomorrow or use a different API key.");
  }
  
  if (data.items && data.items.length > 0) {
    const channelId = data.items[0].id;
    console.log('Found channel by forUsername:', channelId);
    
    // Cache the channel ID
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      channelId,
      timestamp: Date.now()
    }));
    
    return channelId;
  }
  
  // Last resort: Search by channel name
  const searchResponse = await fetch(
    `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(handleWithoutAt)}&type=channel&key=${API_KEY}`
  );
  const searchData = await searchResponse.json();
  
  // Check for quota exceeded error
  if (searchData.error?.code === 403 && searchData.error?.errors?.[0]?.reason === 'quotaExceeded') {
    // Try to return cached ID even if expired
    if (cached) {
      const { channelId } = JSON.parse(cached);
      console.log('⚠️ Quota exceeded, using cached channel ID');
      return channelId;
    }
    throw new Error("YouTube API quota exceeded. Please try again tomorrow or use a different API key.");
  }
  
  if (searchData.items && searchData.items.length > 0) {
    const channelId = searchData.items[0].snippet.channelId;
    console.log('Found channel by search:', channelId);
    
    // Cache the channel ID
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      channelId,
      timestamp: Date.now()
    }));
    
    return channelId;
  }
  
  console.error('Channel lookup failed. API response:', data);
  
  // Last resort: try cached ID even if lookup failed
  if (cached) {
    const { channelId } = JSON.parse(cached);
    console.log('⚠️ Lookup failed, using cached channel ID');
    return channelId;
  }
  
  throw new Error("Channel not found. Please check your channel handle.");
};
