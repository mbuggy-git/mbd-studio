/**
 * Parse YouTube duration (ISO 8601 format) to seconds
 * Example: PT4M13S -> 253 seconds
 */
export const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Format seconds to readable duration
 * Example: 253 -> "4:13"
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * URL routing helper functions
 */
export const updateUrl = (path: string) => {
  if (path === 'vidpod') {
    // Use a cleaner URL for VidPod
    window.history.pushState({}, '', `/${path}`);
  } else {
    window.history.pushState({}, '', path ? `#${path}` : '/');
  }
};

export const getCurrentPath = (): string => {
  return window.location.hash.slice(1) || '';
};

/**
 * Get the initial page state based on URL
 */
export const getInitialPageState = () => {
  const path = getCurrentPath();
  return {
    showVidPodStudio: path === 'vidpod',
    showGetTheGoods: path === 'get-the-goods',
    showTrainingForm: path === 'training',
    showVideoDatabase: path === 'video-database'
  };
};