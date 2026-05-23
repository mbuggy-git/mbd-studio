// Helper function to get metrics for date range
// This extracts the logic for getting 28-day metrics with the FIX for using actual YouTube Analytics API data

import type { VideoData } from './VideoDatabase';

export const getMetricsForDateRange = (video: VideoData, dateRange: 'last28' | 'sincePublished') => {
  // Debug shorts metrics (1% sample rate)
  if (video.tags?.includes('Short') && Math.random() < 0.01) {
    console.log(`🎬 Shorts metrics for "${video.title?.substring(0, 30)}":`, {
      currentViews: video.currentViews,
      currentLikes: video.currentLikes,
      hasAnalyticsHistory: !!video.analyticsHistory?.length,
      dateRange
    });
  }
  
  // Check video age FIRST - this is critical for young videos
  const now = new Date();
  const publishDate = new Date(video.publishedAt);
  const daysOld = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
  const isYoungVideo = daysOld <= 28;
  
  if (dateRange === 'sincePublished') {
    // Return lifetime metrics
    return {
      views: video.currentViews || 0,
      likes: video.currentLikes || 0,
      comments: video.currentComments || 0
    };
  }
  
  // ✅ CRITICAL FIX: For videos ≤28 days old, "last28" and "lifetime" are IDENTICAL
  // So when viewing "Last 28 Days", we should show lifetime data for young videos
  if (isYoungVideo) {
    return {
      views: video.currentViews || 0,
      likes: video.currentLikes || 0,
      comments: video.currentComments || 0
    };
  }
  
  // ✅ For older videos viewing "Last 28 Days", check if we have actual YouTube Analytics API 'last28' snapshot data
  if (video.analyticsHistory && video.analyticsHistory.length > 0) {
    const last28Snapshots = video.analyticsHistory
      .filter(s => s.dateRange === 'last28')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (last28Snapshots.length > 0) {
      const latestLast28 = last28Snapshots[0];
      
      // 🔍 DEBUG: Log for ALL videos to help diagnose view count issues
      console.log(`📊 Using 28-day API data for "${video.title?.substring(0, 50)}":`, {
        views: latestLast28.views,
        likes: latestLast28.likes,
        comments: latestLast28.comments,
        snapshotDate: new Date(latestLast28.timestamp).toLocaleDateString(),
        snapshotTime: new Date(latestLast28.timestamp).toLocaleTimeString(),
        daysOld: daysOld,
        totalLast28Snapshots: last28Snapshots.length,
        source: 'YouTube Analytics API (last28 snapshot)'
      });
      
      return {
        views: latestLast28.views || 0,
        likes: latestLast28.likes || 0,
        comments: latestLast28.comments || 0
      };
    }
  }
  
  // Fallback: Calculate from lifetime snapshots if no 'last28' snapshot exists
  const twentyEightDaysAgo = new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000));
  
  // For videos older than 28 days, calculate from analytics history
  if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
    // Debug shorts without analytics history
    if (video.tags?.includes('Short')) {
      console.log(`🎬 No analytics history for Short: "${video.title?.substring(0, 40)}"`,{
        currentViews: video.currentViews,
        currentLikes: video.currentLikes,
        publishDate: new Date(video.publishedAt).toLocaleDateString()
      });
    }
    // If no analytics history, fall back to current values (can't calculate growth without baseline)
    return {
      views: video.currentViews || 0,
      likes: video.currentLikes || 0,
      comments: video.currentComments || 0
    };
  }
  
  // Sort snapshots by timestamp (oldest first), and only use lifetime snapshots
  // (we should not use 'last28' snapshots as baseline since they're already calculated deltas)
  const lifetimeSnapshots = video.analyticsHistory.filter(s => !s.dateRange || s.dateRange === 'lifetime');
  
  if (lifetimeSnapshots.length === 0) {
    // If no lifetime snapshots, fall back to current values
    if (video.tags?.includes('Short')) {
      console.log(`🎬 No lifetime snapshots for Short: "${video.title?.substring(0, 40)}":`, {
        totalSnapshots: video.analyticsHistory.length,
        currentViews: video.currentViews
      });
    }
    return {
      views: video.currentViews || 0,
      likes: video.currentLikes || 0,
      comments: video.currentComments || 0
    };
  }
  
  const sorted = [...lifetimeSnapshots].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Use current values as the latest (most accurate)
  const latestViews = video.currentViews || 0;
  const latestLikes = video.currentLikes || 0;
  const latestComments = video.currentComments || 0;
  
  // Find the oldest snapshot within the 28-day window
  const snapshotsInRange = sorted.filter(s => new Date(s.timestamp) >= twentyEightDaysAgo);
  
  // If we have snapshots in range, use the oldest one; otherwise use the oldest available
  const baselineSnapshot = snapshotsInRange.length > 0 ? snapshotsInRange[0] : sorted[0];
  
  // Debug shorts 28-day calculation (100% for debugging)
  if (video.tags?.includes('Short')) {
    console.log(`🎬 28-day calc for "${video.title?.substring(0, 40)}":`, {
      currentViews: video.currentViews,
      latestViews,
      baselineViews: baselineSnapshot.views,
      baselineDate: new Date(baselineSnapshot.timestamp).toLocaleDateString(),
      baselineDateRange: baselineSnapshot.dateRange || 'unspecified',
      calculated28DayViews: Math.max(0, latestViews - (baselineSnapshot.views || 0)),
      snapshotsInRange: snapshotsInRange.length,
      lifetimeSnapshotsTotal: sorted.length,
      totalSnapshotsBeforeFilter: video.analyticsHistory?.length || 0,
      publishDate: new Date(video.publishedAt).toLocaleDateString(),
      daysOld: Math.floor((new Date().getTime() - new Date(video.publishedAt).getTime()) / (24 * 60 * 60 * 1000))
    });
  }
  
  // Calculate the difference between current values and baseline
  return {
    views: Math.max(0, latestViews - (baselineSnapshot.views || 0)),
    likes: Math.max(0, latestLikes - (baselineSnapshot.likes || 0)),
    comments: Math.max(0, latestComments - (baselineSnapshot.comments || 0))
  };
};
