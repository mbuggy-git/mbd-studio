// Simplified CSV import helper
// CSV Format: videoId, title, publishedAt (3 columns only)

import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { getSupabaseClient } from "../utils/supabase/client";

export async function importSimpleCSV(
  file: File,
  fetchDatabaseVideos: () => Promise<void>
): Promise<void> {
  console.log('Starting simple CSV import (3 columns: videoId, title, publishedAt)...');
  
  // Get Supabase session token for API calls
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    toast.error("Authentication required. Please log in again.");
    throw new Error("No active session");
  }
  
  try {
    const text = await file.text();
    const lines = text.split('\n');
    
    console.log(`CSV has ${lines.length} total lines`);
    console.log('=== HEADER ROW (Line 0) ===');
    console.log(lines[0]);
    console.log('=== FIRST DATA ROW (Line 1) ===');
    console.log(lines[1]);
    
    // Skip header row and process data lines
    const dataLines = lines.slice(1).filter(line => line.trim());
    console.log(`Processing ${dataLines.length} data lines`);
    
    let successCount = 0;
    let errorCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    
    for (const line of dataLines) {
      try {
        // Parse CSV line (handles quoted fields)
        const matches = line.match(/(\".*?\"|[^,]+)(?=\s*,|\s*$)/g);
        if (!matches || matches.length < 3) {
          console.log(`⚠️ Skipped - insufficient columns: ${line}`);
          continue;
        }
        
        // Simple CSV format: videoId, title, publishedAt
        const videoId = matches[0].replace(/"/g, '').trim();
        const title = matches[1].replace(/"/g, '').trim();
        const publishedAt = matches[2].replace(/"/g, '').trim();
        
        console.log(`\n📄 CSV Row: videoId="${videoId}", title="${title}", publishedAt="${publishedAt}"`);
        
        // Validate required fields
        if (!videoId || !title || !publishedAt) {
          console.log(`⚠️ Skipped - missing required fields`);
          errorCount++;
          continue;
        }
        
        // Create video object with minimal data (no YouTube API calls)
        const videoData = {
          videoId: videoId,
          title: title,
          description: '',
          publishedAt: publishedAt,
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`, // High-res YouTube thumbnail URL
          currentViews: 0,
          currentLikes: 0,
          currentComments: 0,
        };
        
        // Save to database
        const saveResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6ab9c767/videos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(videoData),
          }
        );
        
        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          throw new Error(errorData.error || "Failed to save video to database");
        }
        
        const result = await saveResponse.json();
        if (result.updated) {
          console.log(`   ✅ UPDATED existing video`);
          updatedCount++;
        } else {
          console.log(`   ✅ ADDED new video`);
          successCount++;
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error('Error processing line:', error);
        errorCount++;
        errors.push(error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    // Show results
    if (successCount > 0 || updatedCount > 0) {
      const parts = [];
      if (successCount > 0) parts.push(`${successCount} video(s) added`);
      if (updatedCount > 0) parts.push(`${updatedCount} video(s) updated`);
      let message = `Successfully imported: ${parts.join(', ')}`;
      
      if (errorCount > 0) {
        message += `. ${errorCount} error(s)`;
      }
      
      toast.success(message);
      await fetchDatabaseVideos();
    } else if (errorCount > 0) {
      toast.error(`Failed to import CSV. ${errorCount} error(s) encountered. Check console for details.`);
    } else {
      toast.error('No data was imported. Please check your CSV format (should be: videoId, title, publishedAt).');
    }
  } catch (error) {
    console.error('Error importing CSV:', error);
    toast.error('Failed to import CSV file');
    throw error;
  }
}