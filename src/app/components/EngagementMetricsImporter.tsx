// Import engagement metrics (Impressions, CTR) from CSV
// YouTube CSV Format: Varies, but we look for "Impressions" and "CTR" or "Click-through rate" columns

import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { fetchAnalyticsWithRetry, parseAnalyticsResponse } from "../utils/analyticsRetry";
import { getSupabaseClient } from "../utils/supabase/client";

export interface ImportError {
  videoId?: string;
  title: string;
  impressions?: string;
  ctr?: string;
  reason: 'not_found' | 'invalid_data' | 'parse_error';
  rawLine?: string;
}

export interface ImportResult {
  successCount: number;
  errors: ImportError[];
}

export async function importEngagementMetrics(
  file: File,
  fetchDatabaseVideos: () => Promise<void>,
  dateRange: 'lifetime' | 'last28' = 'lifetime',
  captureDate?: Date
): Promise<ImportResult> {
  console.log('📊 Starting engagement metrics CSV import...');
  console.log('YouTube CSV format: Auto-detecting Impressions and CTR columns from header');
  
  // Get Supabase session token for API calls
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    toast.error("Authentication required. Please log in again.");
    throw new Error("No active session");
  }
  
  if (captureDate) {
    console.log(`📅 Using custom capture date: ${captureDate.toLocaleDateString()}`);
  } else {
    console.log(`📅 Using current date/time for snapshots`);
  }
  
  try {
    const text = await file.text();
    const lines = text.split('\n');
    
    console.log(`CSV has ${lines.length} total lines`);
    
    // Log header row for reference
    const headerLine = lines[0];
    console.log('=== HEADER ROW ===');
    console.log(headerLine);
    
    // Proper CSV parser that handles quoted fields with commas
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    // Parse header to find column indices
    const headerCols = parseCsvLine(headerLine.toLowerCase());
    console.log('Header columns:', headerCols);
    
    // Auto-detect column indices
    let videoIdCol = headerCols.findIndex(col => col.includes('content') || col.includes('video id'));
    let titleCol = headerCols.findIndex(col => col.includes('video title'));
    let impressionsCol = headerCols.findIndex(col => col.includes('impressions') && !col.includes('click'));
    let ctrCol = headerCols.findIndex(col => col.includes('click') || col.includes('ctr'));
    
    // Fallback to default indices if auto-detection fails
    if (videoIdCol === -1) videoIdCol = 0;
    if (titleCol === -1) titleCol = 1;
    if (impressionsCol === -1) impressionsCol = 7;
    if (ctrCol === -1) ctrCol = 8;
    
    console.log(`📍 Using column indices: Video ID=${videoIdCol}, Title=${titleCol}, Impressions=${impressionsCol}, CTR=${ctrCol}`);
    
    // Skip header row (0) AND totals row (1), then process data lines starting from row 2
    const dataLines = lines.slice(2).filter(line => line.trim());
    console.log(`Processing ${dataLines.length} data lines (skipped header + totals)`);
    
    let successCount = 0;
    const importErrors: ImportError[] = [];
    
    for (const line of dataLines) {
      try {
        const matches = parseCsvLine(line);
        
        // More flexible column count check
        const minRequiredCols = Math.max(videoIdCol, titleCol, impressionsCol, ctrCol) + 1;
        if (!matches || matches.length < minRequiredCols) {
          console.log(`⚠️ Skipped - need at least ${minRequiredCols} columns, got ${matches?.length || 0}: ${line}`);
          importErrors.push({
            title: 'Unknown (parse error)',
            reason: 'parse_error',
            rawLine: line
          });
          continue;
        }
        
        const videoId = matches[videoIdCol]?.replace(/"/g, '').trim() || '';
        const title = matches[titleCol]?.replace(/"/g, '').trim() || '';
        const impressionsStr = matches[impressionsCol]?.replace(/"/g, '').replace(/,/g, '').trim() || '';
        const ctrStr = matches[ctrCol]?.replace(/"/g, '').replace(/%/g, '').trim() || '';
        
        const impressions = parseInt(impressionsStr);
        const ctr = ctrStr ? parseFloat(ctrStr) : NaN;
        
        console.log(`\n📄 Processing: "${title}" (${videoId})`);
        console.log(`   Raw columns: VideoID=${matches[videoIdCol]}, Title=${matches[titleCol]}, Impressions=${matches[impressionsCol]}, CTR=${matches[ctrCol]}`);
        console.log(`   Extracted → Impressions: ${impressions} (from index ${impressionsCol}), CTR: ${isNaN(ctr) ? 'N/A' : ctr + '%'} (from index ${ctrCol})`);
        
        // Validate required fields
        if (!videoId || isNaN(impressions)) {
          console.log(`⚠️ Skipped - invalid data (videoId: ${videoId}, impressions: ${impressionsStr})`);
          importErrors.push({
            videoId: videoId || undefined,
            title: title || 'Unknown',
            impressions: impressionsStr,
            ctr: ctrStr,
            reason: 'invalid_data',
            rawLine: line
          });
          continue;
        }
        
        // Get video from database to fetch current stats
        const checkResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${videoId}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        
        if (!checkResponse.ok) {
          console.log(`   ❌ Video not found in database: ${videoId}`);
          importErrors.push({
            videoId,
            title,
            impressions: impressionsStr,
            ctr: ctrStr,
            reason: 'not_found',
            rawLine: line
          });
          continue;
        }
        
        // Get the video data
        const videoData = await checkResponse.json();
        const video = videoData.video;
        
        console.log(`   📊 Video found - Current stats (LIFETIME): Views=${video.currentViews}, Likes=${video.currentLikes}, Comments=${video.currentComments}`);
        
        // Check video age - for videos ≤28 days old, create snapshots for BOTH date ranges
        const publishDate = new Date(video.publishedAt);
        const now = new Date();
        const daysOld = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
        const isYoungVideo = daysOld <= 28;
        
        // Determine which date ranges to create snapshots for
        const dateRangesToCreate: Array<'lifetime' | 'last28'> = [];
        
        if (isYoungVideo) {
          // For videos ≤28 days old, create snapshots for BOTH ranges since they're identical
          // This works regardless of which date range the user selected for import
          dateRangesToCreate.push('last28', 'lifetime');
          console.log(`   📊 Video is ${daysOld} days old - creating snapshots for BOTH "Last 28 Days" and "Lifetime"`);
        } else {
          // For older videos, create only the requested range
          dateRangesToCreate.push(dateRange);
        }
        
        // Create snapshots for each date range
        for (const targetDateRange of dateRangesToCreate) {
          // 🚨 DUPLICATE DETECTION: Check if a snapshot already exists for this date range and date
          const targetDate = captureDate || new Date();
          const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          
          const existingSnapshot = video.analyticsHistory?.find((snapshot: any) => {
            const snapshotDate = new Date(snapshot.timestamp);
            const snapshotDateStr = snapshotDate.toISOString().split('T')[0];
            return snapshot.dateRange === targetDateRange && snapshotDateStr === targetDateStr;
          });
          
          if (existingSnapshot) {
            console.log(`   ⏭️ SKIPPING - A ${targetDateRange} snapshot already exists for ${targetDateStr}`);
            console.log(`      Existing snapshot from: ${new Date(existingSnapshot.timestamp).toLocaleString()}`);
            continue; // Skip to next date range
          }
          
          // 🚨 CRITICAL FIX: For 'last28' snapshots, we CANNOT use currentViews (which is lifetime data)
          // We must fetch 28-day data from YouTube Analytics API
          let viewsForSnapshot = video.currentViews;
          let likesForSnapshot = video.currentLikes;
          let commentsForSnapshot = video.currentComments;
          
          if (targetDateRange === 'last28' && !isYoungVideo) {
            // For older videos with 28-day metrics, fetch actual 28-day data from Analytics API
            console.log(`   📊 Fetching ACTUAL 28-day data from YouTube Analytics API...`);
            
            try {
              const analyticsResponse = await fetchAnalyticsWithRetry(
                `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/analytics/${videoId}?dateRange=last28`,
                session.access_token
              );
              
              const result = await parseAnalyticsResponse(analyticsResponse);
              
              if (result.success && result.analytics) {
                viewsForSnapshot = result.analytics.views;
                likesForSnapshot = result.analytics.likes;
                commentsForSnapshot = result.analytics.comments;
                console.log(`   ✅ Using 28-day data from API: ${viewsForSnapshot} views, ${likesForSnapshot} likes, ${commentsForSnapshot} comments`);
              } else {
                // Check if it's an OAuth error
                const isOAuthError = result.error?.includes('OAuth') || analyticsResponse.status === 401;
                if (isOAuthError) {
                  console.log(`   ℹ️ OAuth not connected, using lifetime data instead`);
                } else {
                  // Check if it's a 404 (no data available)
                  const is404Error = result.error?.includes('may be too new') || analyticsResponse.status === 404;
                  if (is404Error) {
                    console.log(`   ℹ️ No 28-day data available yet, using lifetime data instead`);
                  } else {
                    console.warn(`   ⚠️ ${result.error || 'No analytics data available'}, falling back to lifetime data`);
                  }
                }
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              const isOAuthError = errorMessage.includes('OAuth') || errorMessage.includes('401');
              
              if (isOAuthError) {
                console.log(`   ℹ️ OAuth not connected, using lifetime data instead`);
              } else {
                console.log(`   ❌ Error fetching 28-day analytics:`, error);
                console.log(`   ℹ️ Using lifetime data instead`);
              }
            }
          } else if (targetDateRange === 'last28' && isYoungVideo) {
            console.log(`   📊 Video is ${daysOld} days old - using lifetime data (same as 28-day for young videos)`);
          } else {
            console.log(`   📊 Using lifetime data: ${viewsForSnapshot} views`);
          }
          
          const snapshotResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos/${videoId}/advanced-snapshot`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                views: viewsForSnapshot,
                likes: likesForSnapshot,
                comments: commentsForSnapshot,
                impressions: impressions,
                ctr: isNaN(ctr) ? undefined : ctr,
                note: `${targetDateRange === 'lifetime' ? 'Lifetime' : '28-day'} reach metrics (Impressions/CTR) imported from CSV${isYoungVideo ? ' (auto-synced to both ranges)' : ''}${captureDate ? ` - captured ${captureDate.toLocaleDateString()}` : ''}`,
                dateRange: targetDateRange,
                timestamp: captureDate ? captureDate.toISOString() : undefined, // Use custom date if provided
              }),
            }
          );
          
          if (!snapshotResponse.ok) {
            const errorData = await snapshotResponse.json();
            throw new Error(errorData.error || "Failed to add analytics snapshot");
          }
          
          console.log(`   ✅ Added ${targetDateRange} reach metrics`);
        }
        
        successCount++;
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.log('Error processing line:', error);
        importErrors.push({
          title: 'Unknown (error during processing)',
          reason: 'parse_error',
          rawLine: line
        });
      }
    }
    
    // Show results
    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⚠️ Errors: ${importErrors.length}`);
    
    if (successCount > 0) {
      await fetchDatabaseVideos();
    }
    
    // Return results for UI handling
    return {
      successCount,
      errors: importErrors
    };
  } catch (error) {
    console.log('Error importing engagement metrics CSV:', error);
    toast.error('Failed to import CSV file');
    throw error;
  }
}