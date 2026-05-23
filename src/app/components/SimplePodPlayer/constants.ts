export const API_KEY = "AIzaSyCDaPedxeLy_iaKZZtEWx8m3RPp9DwYfOQ";

export const SCREEN_TYPES = {
  MENU: 'menu',
  PLAYLIST: 'playlist', 
  PLAYER: 'player'
} as const;

// YouTube playlist IDs for each mood (from actual YouTube embed codes)
export const PLAYLIST_CONFIGS = {
  energetic: {
    name: "Energetic",
    playlistId: "PLSrOicmc09kTlJmhNhgNITqVi3HfJHdTN",
    embedUrl: "https://www.youtube.com/embed/videoseries?si=tLBNlPvhOTfnSHSD&list=PLSrOicmc09kTlJmhNhgNITqVi3HfJHdTN&autoplay=1&controls=1&modestbranding=1&rel=0"
  },
  happy: {
    name: "Happy", 
    playlistId: "PLSrOicmc09kS6yzDfh3EwK2KwkhBQPrSK",
    embedUrl: "https://www.youtube.com/embed/videoseries?si=FsYzLi2sHbEuzRFZ&list=PLSrOicmc09kS6yzDfh3EwK2KwkhBQPrSK&autoplay=1&controls=1&modestbranding=1&rel=0"
  },
  mellow: {
    name: "Mellow",
    playlistId: "PLSrOicmc09kRFE2r0bRwP0wjYzO6PlVNq", 
    embedUrl: "https://www.youtube.com/embed/videoseries?si=I3up5omKdw5NoUgd&list=PLSrOicmc09kRFE2r0bRwP0wjYzO6PlVNq&autoplay=1&controls=1&modestbranding=1&rel=0"
  }
} as const;