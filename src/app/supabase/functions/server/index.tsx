import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// SERVER VERSION: v2.8.0 - Added automatic retry logic for YouTube API 500/503 errors with exponential backoff
console.log("🚀 SERVER STARTING - VERSION 2.8.0");

// Google OAuth client ID for the YouTube authorization flow.
// Single source of truth — referenced by all OAuth handlers below.
// Client ID is public (it ships in the auth URL); the secret stays in YOUTUBE_OAUTH_CLIENT_SECRET env var.
const YOUTUBE_OAUTH_CLIENT_ID = "430888277505-u2rj0hok39fd0nh3t2n83hrkfovosim1.apps.googleusercontent.com";

// Helper function to retry KV operations with exponential backoff
async function retryKvOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`KV operation attempt ${attempt + 1} failed:`, lastError.message);
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("KV operation failed after all retries");
}

// Helper function to retry YouTube API calls with exponential backoff for 500/503 errors
async function retryYouTubeApiCall(
  url: string,
  options: RequestInit,
  maxRetries = 2,
  initialDelay = 2000
): Promise<Response> {
  let lastResponse: Response | undefined;
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add delay for retry attempts
      if (attempt > 0) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.log(`🔄 YouTube API retry attempt ${attempt}/${maxRetries} after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const response = await fetch(url, options);
      
      // Success - return immediately
      if (response.ok) {
        if (attempt > 0) {
          console.log(`✅ YouTube API call succeeded on retry attempt ${attempt}`);
        }
        return response;
      }
      
      // Store the response for potential return
      lastResponse = response;
      
      // Check if this is a retryable error (500/503)
      const isRetryable = response.status === 500 || response.status === 503;
      
      if (!isRetryable) {
        // Non-retryable error - return immediately
        // Don't show scary warnings for 401 (OAuth errors) or 404 (no data) - these are expected
        if (response.status !== 401 && response.status !== 404) {
          console.log(`⚠️ Non-retryable error (${response.status}), not retrying`);
        }
        return response;
      }
      
      // Log retryable error
      try {
        const errorText = await response.clone().text();
        const errorData = JSON.parse(errorText);
        console.warn(
          `⚠️ YouTube API temporarily unavailable (${response.status}): ${
            errorData.error?.message || 'Internal error'
          }`
        );
      } catch {
        console.warn(`⚠️ YouTube API temporarily unavailable (${response.status})`);
      }
      
      // Continue to next retry attempt
      if (attempt < maxRetries) {
        console.log(`⏳ Will retry YouTube API call (${attempt + 1}/${maxRetries} attempts so far)...`);
      } else {
        console.warn(`⚠️ Max retries (${maxRetries}) reached for YouTube API call`);
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`❌ Network error on attempt ${attempt + 1}:`, lastError.message);
      
      // Continue to next retry attempt if not at max
      if (attempt < maxRetries) {
        console.log(`⏳ Will retry due to network error...`);
      }
    }
  }
  
  // All retries exhausted - return the last response if available
  if (lastResponse) {
    return lastResponse;
  }
  
  // If we have an error and no response, throw it
  if (lastError) {
    throw lastError;
  }
  
  // This should never happen, but just in case
  throw new Error('Failed to fetch YouTube API after retries');
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes
app.use('*', cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// Health check endpoint
app.get("/make-server-6ab9c767/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== AUTHENTICATION ROUTES =====
// Sign up new user
app.post("/make-server-6ab9c767/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Create user with Supabase Auth (using service role key)
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      email_confirm: true // Auto-confirm since no email server configured
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Create user profile in KV store
    const now = new Date().toISOString();
    const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const gracePeriodEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

    await kv.set(`user:${data.user.id}`, {
      userId: data.user.id,
      email,
      name: name || '',
      trialStartDate: now,
      trialEndDate,
      gracePeriodEndDate,
      totalVideos: 0,
      totalSyncs: 0,
      lastSyncDate: null,
      createdAt: now
    });

    console.log(`✅ User created: ${email} (${data.user.id})`);

    return c.json({ 
      success: true, 
      userId: data.user.id,
      trialEndDate,
      message: "Account created successfully" 
    });
  } catch (error) {
    console.log("Signup error:", error);
    return c.json({ error: "Failed to create account", details: String(error) }, 500);
  }
});

// Get user profile
app.get("/make-server-6ab9c767/auth/user/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.log("Get user error:", error);
    return c.json({ error: "Failed to fetch user", details: String(error) }, 500);
  }
});

// Update user stats (called after syncs)
app.post("/make-server-6ab9c767/auth/user/:userId/stats", async (c) => {
  try {
    const userId = c.req.param('userId');
    const { totalVideos, incrementSyncs } = await c.req.json();
    
    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const updates: any = {
      lastSyncDate: new Date().toISOString()
    };
    
    if (totalVideos !== undefined) {
      updates.totalVideos = totalVideos;
    }
    
    if (incrementSyncs) {
      updates.totalSyncs = (user.totalSyncs || 0) + 1;
    }

    await kv.set(`user:${userId}`, {
      ...user,
      ...updates
    });

    return c.json({ success: true, updates });
  } catch (error) {
    console.log("Update user stats error:", error);
    return c.json({ error: "Failed to update stats", details: String(error) }, 500);
  }
});

// Get trial status for user
app.get("/make-server-6ab9c767/auth/user/:userId/trial-status", async (c) => {
  try {
    const userId = c.req.param('userId');
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const now = new Date();
    const trialEnd = new Date(user.trialEndDate);
    const gracePeriodEnd = new Date(user.gracePeriodEndDate);
    
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const graceDaysRemaining = Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: 'active' | 'expired' | 'grace_period' | 'deleted';
    
    if (now < trialEnd) {
      status = 'active';
    } else if (now < gracePeriodEnd) {
      status = 'grace_period';
    } else {
      status = 'deleted';
    }

    return c.json({
      status,
      daysRemaining: Math.max(0, daysRemaining),
      graceDaysRemaining: Math.max(0, graceDaysRemaining),
      trialStartDate: user.trialStartDate,
      trialEndDate: user.trialEndDate,
      gracePeriodEndDate: user.gracePeriodEndDate,
      isTrialActive: status === 'active',
      isInGracePeriod: status === 'grace_period',
      shouldDeleteData: status === 'deleted'
    });
  } catch (error) {
    console.log("Get trial status error:", error);
    return c.json({ error: "Failed to fetch trial status", details: String(error) }, 500);
  }
});

// Submit feedback
app.post("/make-server-6ab9c767/feedback", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Verify user is authenticated
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { category, message, rating } = await c.req.json();
    
    if (!category || !message) {
      return c.json({ error: "Category and message are required" }, 400);
    }

    const validCategories = ['UI', 'UX', 'YouTube', 'Suggestions'];
    if (!validCategories.includes(category)) {
      return c.json({ error: "Invalid category. Must be one of: UI, UX, YouTube, Suggestions" }, 400);
    }

    // Store feedback with timestamp
    const feedbackId = `feedback:${user.id}:${Date.now()}`;
    const feedbackData = {
      feedbackId,
      userId: user.id,
      userEmail: user.email,
      category,
      message,
      rating: rating || null,
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    await kv.set(feedbackId, feedbackData);

    console.log(`📝 Feedback received from ${user.email} (${category})`);

    return c.json({ 
      success: true, 
      message: "Thank you for your feedback!",
      feedbackId 
    });
  } catch (error) {
    console.log("Submit feedback error:", error);
    return c.json({ error: "Failed to submit feedback", details: String(error) }, 500);
  }
});

// Get user's feedback history
app.get("/make-server-6ab9c767/feedback/user/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const feedbackItems = await kv.getByPrefix(`feedback:${userId}:`);
    
    // Sort by created date, newest first
    const sorted = (feedbackItems || []).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ feedback: sorted });
  } catch (error) {
    console.log("Get feedback history error:", error);
    return c.json({ error: "Failed to fetch feedback", details: String(error) }, 500);
  }
});

// Get all videos from database
app.get("/make-server-6ab9c767/videos", async (c) => {
  try {
    const videos = await kv.getByPrefix("video:");
    return c.json({ videos: videos || [] });
  } catch (error) {
    console.log("Error fetching videos from database:", error);
    return c.json({ error: "Failed to fetch videos", details: String(error) }, 500);
  }
});

// Get single video by ID
app.get("/make-server-6ab9c767/videos/:videoId", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const video = await kv.get(`video:${videoId}`);
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    return c.json({ video });
  } catch (error) {
    console.log("Error fetching video from database:", error);
    return c.json({ error: "Failed to fetch video", details: String(error) }, 500);
  }
});

// Save or update a video
app.post("/make-server-6ab9c767/videos", async (c) => {
  try {
    const videoData = await c.req.json();
    
    if (!videoData.videoId) {
      return c.json({ error: "videoId is required" }, 400);
    }
    
    // Validate YouTube video ID format (11 characters, alphanumeric with dashes/underscores)
    const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
    if (!videoIdPattern.test(videoData.videoId)) {
      console.log("Invalid video ID format:", videoData.videoId);
      return c.json({ error: "Invalid YouTube video ID format" }, 400);
    }
    
    // Get existing video if it exists
    const existingVideo = await kv.get(`video:${videoData.videoId}`);
    
    // Enhanced logging for tag preservation debugging
    const isNewVideo = !existingVideo;
    if (!isNewVideo && Math.random() < 0.1) { // 10% sample rate for existing videos
      console.log(`🏷️  SERVER: Processing video "${videoData.title?.substring(0, 40)}"`);
      console.log(`   Existing tags: ${JSON.stringify(existingVideo?.tags || [])}`);
      console.log(`   Incoming tags: ${JSON.stringify(videoData.tags)}`);
      console.log(`   Tags defined: ${videoData.tags !== undefined}`);
    }
    
    // Merge with existing data, preserving notes, goals, and analytics history
    // Tags are handled specially: if provided, use them; otherwise preserve existing
    const mergedVideo = {
      ...videoData,
      notes: videoData.notes || existingVideo?.notes || "",
      nextSteps: videoData.nextSteps || existingVideo?.nextSteps || "",
      tags: videoData.tags !== undefined ? videoData.tags : (existingVideo?.tags || []),
      performanceGoals: videoData.performanceGoals || existingVideo?.performanceGoals || [],
      analyticsHistory: videoData.analyticsHistory !== undefined ? videoData.analyticsHistory : (existingVideo?.analyticsHistory || []),
      autoSnapshotEnabled: videoData.autoSnapshotEnabled !== undefined ? videoData.autoSnapshotEnabled : (existingVideo?.autoSnapshotEnabled || false),
      snapshotFrequency: videoData.snapshotFrequency || existingVideo?.snapshotFrequency || 'daily',
      lastSnapshotDate: videoData.lastSnapshotDate || existingVideo?.lastSnapshotDate,
      videoUpdated: videoData.videoUpdated !== undefined ? videoData.videoUpdated : (existingVideo?.videoUpdated || false),
      updatedAt: new Date().toISOString(),
      createdAt: existingVideo?.createdAt || new Date().toISOString(),
    };
    
    // Verify tags were preserved
    if (!isNewVideo && Math.random() < 0.1) {
      console.log(`   Final tags: ${JSON.stringify(mergedVideo.tags)}`);
      if (existingVideo?.tags?.length > 0 && mergedVideo.tags.length === 0) {
        console.log(`   ⚠️  WARNING: Tags were lost! Existing had ${existingVideo.tags.length} tags, merged has 0`);
      }
    }
    
    await kv.set(`video:${videoData.videoId}`, mergedVideo);
    
    return c.json({ success: true, video: mergedVideo });
  } catch (error) {
    console.log("Error saving video to database:", error);
    return c.json({ error: "Failed to save video", details: String(error) }, 500);
  }
});

// Update video notes and next steps
app.put("/make-server-6ab9c767/videos/:videoId/notes", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const { notes, nextSteps } = await c.req.json();
    
    const video = await kv.get(`video:${videoId}`);
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    const updatedVideo = {
      ...video,
      notes,
      nextSteps,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`video:${videoId}`, updatedVideo);
    
    return c.json({ success: true, video: updatedVideo });
  } catch (error) {
    console.log("Error updating video notes:", error);
    return c.json({ error: "Failed to update notes", details: String(error) }, 500);
  }
});

// Update video tags
app.put("/make-server-6ab9c767/videos/:videoId/tags", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const { tags } = await c.req.json();
    
    const video = await kv.get(`video:${videoId}`);
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    const updatedVideo = {
      ...video,
      tags,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`video:${videoId}`, updatedVideo);
    
    return c.json({ success: true, video: updatedVideo });
  } catch (error) {
    console.log("Error updating video tags:", error);
    return c.json({ error: "Failed to update tags", details: String(error) }, 500);
  }
});

// Get custom tags
app.get("/make-server-6ab9c767/custom-tags", async (c) => {
  try {
    const customTags = await kv.get("custom-tags");
    console.log("📌 GET /custom-tags - Retrieved from DB:", customTags);
    const result = customTags || { tool: [], format: [], status: [] };
    console.log("📌 GET /custom-tags - Returning:", result);
    return c.json({ customTags: result });
  } catch (error) {
    console.log("Error fetching custom tags:", error);
    return c.json({ error: "Failed to fetch custom tags", details: String(error) }, 500);
  }
});

// Update custom tags
app.put("/make-server-6ab9c767/custom-tags", async (c) => {
  try {
    const { customTags } = await c.req.json();
    console.log("📝 PUT /custom-tags - Received:", customTags);
    await kv.set("custom-tags", customTags);
    console.log("✅ PUT /custom-tags - Saved to database successfully");
    
    // Verify it was saved
    const verified = await kv.get("custom-tags");
    console.log("🔍 PUT /custom-tags - Verification read:", verified);
    
    return c.json({ success: true, customTags });
  } catch (error) {
    console.log("❌ Error updating custom tags:", error);
    return c.json({ error: "Failed to update custom tags", details: String(error) }, 500);
  }
});

// Update performance goals
app.put("/make-server-6ab9c767/videos/:videoId/goals", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const { goals } = await c.req.json();
    
    const video = await kv.get(`video:${videoId}`);
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    const updatedVideo = {
      ...video,
      performanceGoals: goals,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`video:${videoId}`, updatedVideo);
    
    return c.json({ success: true, video: updatedVideo });
  } catch (error) {
    console.log("Error updating video goals:", error);
    return c.json({ error: "Failed to update goals", details: String(error) }, 500);
  }
});

// Update auto-snapshot settings
app.put("/make-server-6ab9c767/videos/:videoId/auto-snapshot", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const { autoSnapshotEnabled, snapshotFrequency } = await c.req.json();
    
    const video = await kv.get(`video:${videoId}`);
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    const updatedVideo = {
      ...video,
      autoSnapshotEnabled,
      snapshotFrequency,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`video:${videoId}`, updatedVideo);
    
    return c.json({ success: true, video: updatedVideo });
  } catch (error) {
    console.log("Error updating auto-snapshot settings:", error);
    return c.json({ error: "Failed to update auto-snapshot settings", details: String(error) }, 500);
  }
});

// Check for video updates from YouTube
app.post("/make-server-6ab9c767/videos/:videoId/check-update", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const { title, description, currentViews, currentLikes, currentComments, thumbnailUrl } = await c.req.json();
    
    const video = await retryKvOperation(() => kv.get(`video:${videoId}`));
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    // Check if video has been updated
    const hasChanged = 
      title !== video.title ||
      description !== video.description ||
      thumbnailUrl !== video.thumbnailUrl;
    
    if (hasChanged) {
      const updatedVideo = {
        ...video,
        title,
        description,
        thumbnailUrl,
        currentViews,
        currentLikes,
        currentComments,
        videoUpdated: true,
        updatedAt: new Date().toISOString(),
      };
      
      await retryKvOperation(() => kv.set(`video:${videoId}`, updatedVideo));
      
      return c.json({ success: true, updated: true, video: updatedVideo });
    } else {
      // Just update the stats
      const updatedVideo = {
        ...video,
        currentViews,
        currentLikes,
        currentComments,
        updatedAt: new Date().toISOString(),
      };
      
      await retryKvOperation(() => kv.set(`video:${videoId}`, updatedVideo));
      
      return c.json({ success: true, updated: false, video: updatedVideo });
    }
  } catch (error) {
    console.log("Error checking video update:", error);
    return c.json({ error: "Failed to check for updates", details: String(error) }, 500);
  }
});

// Add analytics snapshot for a video
app.post("/make-server-6ab9c767/videos/:videoId/snapshot", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const { views, likes, comments, note, timestamp, milestone, dateRange } = await c.req.json();
    
    const video = await kv.get(`video:${videoId}`);
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    const snapshot = {
      timestamp: timestamp || new Date().toISOString(), // Use custom timestamp if provided
      views,
      likes,
      comments,
      note: note || undefined,
      milestone: milestone || undefined, // Store milestone marker if provided
      dateRange: dateRange || undefined, // Store date range (e.g., "lifetime", "last28")
    };
    
    // ONE SNAPSHOT PER DAY: Check if a snapshot exists for today with the same dateRange
    const snapshotTimestamp = new Date(snapshot.timestamp);
    const snapshotDate = snapshotTimestamp.toDateString(); // e.g., "Mon Oct 27 2025"
    
    let analyticsHistory = video.analyticsHistory || [];
    
    // Find existing snapshot from today with the same dateRange
    // IMPORTANT: For milestone snapshots, also check if there's an existing milestone with the same milestone value
    const existingTodayIndex = analyticsHistory.findIndex(s => {
      const sDate = new Date(s.timestamp).toDateString();
      const sameDay = sDate === snapshotDate;
      const sameDateRange = s.dateRange === snapshot.dateRange;
      
      // If this is a milestone snapshot, only match other milestone snapshots with the same milestone value
      if (snapshot.milestone !== undefined) {
        return sameDay && sameDateRange && s.milestone === snapshot.milestone;
      }
      
      // For regular snapshots, only match non-milestone snapshots
      return sameDay && sameDateRange && s.milestone === undefined;
    });
    
    if (existingTodayIndex !== -1) {
      const existingSnapshot = analyticsHistory[existingTodayIndex];
      const snapshotType = snapshot.milestone !== undefined ? `MILESTONE ${snapshot.milestone}` : 'REGULAR';
      const existingType = existingSnapshot.milestone !== undefined ? `MILESTONE ${existingSnapshot.milestone}` : 'REGULAR';
      console.log(`📝 Found existing ${existingType} snapshot from ${snapshotDate} (dateRange=${snapshot.dateRange})`);
      console.log(`   Replacing with ${snapshotType} snapshot`);
      
      // Preserve impressions and CTR from the existing snapshot
      if (existingSnapshot.impressions !== undefined) {
        snapshot.impressions = existingSnapshot.impressions;
      }
      if (existingSnapshot.ctr !== undefined) {
        snapshot.ctr = existingSnapshot.ctr;
      }
      
      // Replace the existing snapshot
      analyticsHistory[existingTodayIndex] = snapshot;
    } else {
      const snapshotType = snapshot.milestone !== undefined ? `MILESTONE ${snapshot.milestone}` : 'REGULAR';
      console.log(`📌 No existing ${snapshotType} snapshot from ${snapshotDate} (dateRange=${snapshot.dateRange}), adding new snapshot`);
      analyticsHistory = [...analyticsHistory, snapshot];
    }
    
    // IMPORTANT: Do NOT update currentViews/currentLikes/currentComments here
    // These should only be updated by the YouTube Data API sync, not by snapshots
    // Snapshots may contain date-range-specific data (e.g., last 28 days)
    // which should NOT overwrite the lifetime totals in currentViews
    const updatedVideo = {
      ...video,
      analyticsHistory,
      lastSnapshotDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`video:${videoId}`, updatedVideo);
    
    return c.json({ success: true, video: updatedVideo });
  } catch (error) {
    console.log("Error adding analytics snapshot:", error);
    return c.json({ error: "Failed to add snapshot", details: String(error) }, 500);
  }
});

// Delete a milestone snapshot for a video
app.delete("/make-server-6ab9c767/videos/:videoId/snapshots/milestone/:milestone", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const milestone = parseInt(c.req.param("milestone"));
    
    console.log(`🗑️ Deleting milestone ${milestone} snapshot for video:`, videoId);
    
    const video = await retryKvOperation(() => kv.get(`video:${videoId}`));
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      return c.json({ error: "No snapshots found" }, 404);
    }
    
    // Filter out the milestone snapshot
    const updatedHistory = video.analyticsHistory.filter(
      snapshot => snapshot.milestone !== milestone
    );
    
    if (updatedHistory.length === video.analyticsHistory.length) {
      return c.json({ error: "Milestone snapshot not found" }, 404);
    }
    
    const updatedVideo = {
      ...video,
      analyticsHistory: updatedHistory,
      updatedAt: new Date().toISOString(),
    };
    
    await retryKvOperation(() => kv.set(`video:${videoId}`, updatedVideo));
    
    console.log(`✅ Deleted milestone ${milestone} snapshot successfully`);
    
    return c.json({ success: true, video: updatedVideo });
  } catch (error) {
    console.log("Error deleting milestone snapshot:", error);
    return c.json({ error: "Failed to delete snapshot", details: String(error) }, 500);
  }
});

// Add advanced analytics snapshot for a video
app.post("/make-server-6ab9c767/videos/:videoId/advanced-snapshot", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const { 
      views,
      likes,
      comments,
      impressions, 
      ctr, 
      averageViewDuration, 
      averageViewPercentage,
      estimatedMinutesWatched, // Watch time in minutes
      topTrafficSource,
      topTrafficSourcePercentage,
      allTrafficSources, // NEW: All traffic sources
      note,
      timestamp,
      milestone,
      dateRange
    } = await c.req.json();
    
    console.log("📸 Adding advanced snapshot for video:", videoId);
    
    // Use retry logic for KV operations
    const video = await retryKvOperation(() => kv.get(`video:${videoId}`));
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    // Get the latest snapshot or create a new one
    const latestSnapshot = video.analyticsHistory?.[video.analyticsHistory.length - 1];
    
    // IMPORTANT: Preserve existing impressions/CTR if new values are undefined
    // This protects manually imported engagement data from being overwritten
    const advancedSnapshot = {
      timestamp: timestamp || new Date().toISOString(), // Use custom timestamp if provided
      views: views !== undefined ? views : (latestSnapshot?.views || video.currentViews || 0),
      likes: likes !== undefined ? likes : (latestSnapshot?.likes || video.currentLikes || 0),
      comments: comments !== undefined ? comments : (latestSnapshot?.comments || video.currentComments || 0),
      impressions: impressions !== undefined ? impressions : latestSnapshot?.impressions,
      ctr: ctr !== undefined ? ctr : latestSnapshot?.ctr,
      averageViewDuration: averageViewDuration !== undefined ? averageViewDuration : latestSnapshot?.averageViewDuration,
      averageViewPercentage: averageViewPercentage !== undefined ? averageViewPercentage : latestSnapshot?.averageViewPercentage,
      estimatedMinutesWatched: estimatedMinutesWatched !== undefined ? estimatedMinutesWatched : latestSnapshot?.estimatedMinutesWatched, // Watch time
      topTrafficSource: topTrafficSource !== undefined ? topTrafficSource : latestSnapshot?.topTrafficSource,
      topTrafficSourcePercentage: topTrafficSourcePercentage !== undefined ? topTrafficSourcePercentage : latestSnapshot?.topTrafficSourcePercentage,
      allTrafficSources: allTrafficSources || undefined, // NEW: All traffic sources
      note: note || undefined,
      milestone: milestone || undefined, // Store milestone marker if provided
      dateRange: dateRange || undefined, // Store date range (e.g., "lifetime", "last28")
    };
    
    console.log("📊 Advanced snapshot data:", advancedSnapshot);
    console.log("📊 Received averageViewDuration:", averageViewDuration);
    console.log("📊 Will store averageViewDuration:", advancedSnapshot.averageViewDuration);
    console.log("📊 Received watch time (estimatedMinutesWatched):", estimatedMinutesWatched);
    console.log("📊 Will store watch time:", advancedSnapshot.estimatedMinutesWatched);
    
    // ONE SNAPSHOT PER DAY: Check if a snapshot exists for today with the same dateRange
    const snapshotTimestamp = new Date(advancedSnapshot.timestamp);
    const snapshotDate = snapshotTimestamp.toDateString(); // e.g., "Mon Oct 27 2025"
    
    let analyticsHistory = video.analyticsHistory || [];
    
    // Normalize dateRange for comparison: treat undefined, null, and empty string as equivalent
    const normalizedDateRange = advancedSnapshot.dateRange || 'lifetime';
    
    // Find existing snapshot from today with the same dateRange
    // IMPORTANT: For milestone snapshots, also check if there's an existing milestone with the same milestone value
    const existingTodayIndex = analyticsHistory.findIndex(s => {
      const sDate = new Date(s.timestamp).toDateString();
      const sameDay = sDate === snapshotDate;
      // Normalize both dateRanges for comparison
      const existingDateRange = s.dateRange || 'lifetime';
      const sameDateRange = existingDateRange === normalizedDateRange;
      
      // If this is a milestone snapshot, only match other milestone snapshots with the same milestone value
      if (advancedSnapshot.milestone !== undefined) {
        return sameDay && sameDateRange && s.milestone === advancedSnapshot.milestone;
      }
      
      // For regular snapshots, only match non-milestone snapshots
      return sameDay && sameDateRange && s.milestone === undefined;
    });
    
    if (existingTodayIndex !== -1) {
      const existingSnapshot = analyticsHistory[existingTodayIndex];
      const snapshotType = advancedSnapshot.milestone !== undefined ? `MILESTONE ${advancedSnapshot.milestone}` : 'REGULAR';
      const existingType = existingSnapshot.milestone !== undefined ? `MILESTONE ${existingSnapshot.milestone}` : 'REGULAR';
      console.log(`📝 Found existing ${existingType} snapshot from ${snapshotDate} (dateRange=${normalizedDateRange})`);
      console.log(`   Replacing with ${snapshotType} snapshot`);
      
      // Preserve manually-entered data from the existing snapshot if not provided in new snapshot
      
      // Preserve impressions and CTR
      if (advancedSnapshot.impressions === undefined && existingSnapshot.impressions !== undefined) {
        advancedSnapshot.impressions = existingSnapshot.impressions;
      }
      if (advancedSnapshot.ctr === undefined && existingSnapshot.ctr !== undefined) {
        advancedSnapshot.ctr = existingSnapshot.ctr;
      }
      
      // Preserve retention data (average view duration & percentage)
      if (advancedSnapshot.averageViewDuration === undefined && existingSnapshot.averageViewDuration !== undefined) {
        advancedSnapshot.averageViewDuration = existingSnapshot.averageViewDuration;
        console.log(`📋 Preserving manual averageViewDuration: ${existingSnapshot.averageViewDuration}s`);
      }
      if (advancedSnapshot.averageViewPercentage === undefined && existingSnapshot.averageViewPercentage !== undefined) {
        advancedSnapshot.averageViewPercentage = existingSnapshot.averageViewPercentage;
        console.log(`📋 Preserving manual averageViewPercentage: ${existingSnapshot.averageViewPercentage}%`);
      }
      
      // Preserve watch time data
      if (advancedSnapshot.estimatedMinutesWatched === undefined && existingSnapshot.estimatedMinutesWatched !== undefined) {
        advancedSnapshot.estimatedMinutesWatched = existingSnapshot.estimatedMinutesWatched;
        console.log(`📋 Preserving watch time: ${existingSnapshot.estimatedMinutesWatched} minutes`);
      }
      
      // Preserve traffic source data
      if (advancedSnapshot.topTrafficSource === undefined && existingSnapshot.topTrafficSource !== undefined) {
        advancedSnapshot.topTrafficSource = existingSnapshot.topTrafficSource;
        advancedSnapshot.topTrafficSourcePercentage = existingSnapshot.topTrafficSourcePercentage;
        console.log(`📋 Preserving manual traffic source: ${existingSnapshot.topTrafficSource}`);
      }
      if (advancedSnapshot.allTrafficSources === undefined && existingSnapshot.allTrafficSources !== undefined) {
        advancedSnapshot.allTrafficSources = existingSnapshot.allTrafficSources;
      }
      
      // Preserve the note if new snapshot doesn't have one
      if (!advancedSnapshot.note && existingSnapshot.note) {
        advancedSnapshot.note = existingSnapshot.note;
      }
      
      // IMPORTANT: Determine if metrics should be allowed to decrease
      // For LIFETIME data: metrics should NEVER decrease
      // For LAST28 data: metrics CAN decrease if video is >28 days old (older views fall out of window)
      //                  but should NOT decrease if video is <28 days old (all views still in window)
      let shouldPreventDecrease = false;
      
      if (normalizedDateRange === 'lifetime') {
        // Lifetime metrics should always increase
        shouldPreventDecrease = true;
        console.log(`📊 Snapshot is LIFETIME data - metrics should not decrease`);
      } else if (normalizedDateRange === 'last28') {
        // For 28-day data, check video age
        if (video.publishedAt) {
          const publishDate = new Date(video.publishedAt);
          const now = new Date();
          const daysOld = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysOld < 28) {
            // Video is newer than 28 days - all views are within window, shouldn't decrease
            shouldPreventDecrease = true;
            console.log(`📊 Snapshot is LAST28 data, video is ${daysOld} days old (<28) - metrics should not decrease`);
          } else {
            // Video is older than 28 days - views can decrease as they fall out of window
            shouldPreventDecrease = false;
            console.log(`📊 Snapshot is LAST28 data, video is ${daysOld} days old (>28) - metrics CAN decrease`);
          }
        } else {
          // No publish date - be conservative and prevent decrease
          shouldPreventDecrease = true;
          console.log(`📊 Snapshot is LAST28 data, no publish date - defaulting to prevent decrease`);
        }
      } else {
        // Unknown date range - be conservative and prevent decrease
        shouldPreventDecrease = true;
        console.log(`📊 Snapshot has unknown dateRange - defaulting to prevent decrease`);
      }
      
      // Apply decrease prevention logic if needed
      if (shouldPreventDecrease) {
        if (existingSnapshot.views !== undefined && advancedSnapshot.views < existingSnapshot.views) {
          console.log(`⚠️  WARNING: Views decreased from ${existingSnapshot.views} to ${advancedSnapshot.views}. Keeping higher value.`);
          advancedSnapshot.views = existingSnapshot.views;
        }
        if (existingSnapshot.likes !== undefined && advancedSnapshot.likes < existingSnapshot.likes) {
          console.log(`⚠️  WARNING: Likes decreased from ${existingSnapshot.likes} to ${advancedSnapshot.likes}. Keeping higher value.`);
          advancedSnapshot.likes = existingSnapshot.likes;
        }
        if (existingSnapshot.comments !== undefined && advancedSnapshot.comments < existingSnapshot.comments) {
          console.log(`⚠️  WARNING: Comments decreased from ${existingSnapshot.comments} to ${advancedSnapshot.comments}. Keeping higher value.`);
          advancedSnapshot.comments = existingSnapshot.comments;
        }
      } else {
        console.log(`✅ Allowing metrics to change freely (can decrease for old videos with 28-day window)`);
        if (existingSnapshot.views !== undefined && advancedSnapshot.views < existingSnapshot.views) {
          console.log(`  Views: ${existingSnapshot.views} → ${advancedSnapshot.views} (decreased by ${existingSnapshot.views - advancedSnapshot.views})`);
        }
        if (existingSnapshot.likes !== undefined && advancedSnapshot.likes < existingSnapshot.likes) {
          console.log(`  Likes: ${existingSnapshot.likes} → ${advancedSnapshot.likes} (decreased by ${existingSnapshot.likes - advancedSnapshot.likes})`);
        }
        if (existingSnapshot.comments !== undefined && advancedSnapshot.comments < existingSnapshot.comments) {
          console.log(`  Comments: ${existingSnapshot.comments} → ${advancedSnapshot.comments} (decreased by ${existingSnapshot.comments - advancedSnapshot.comments})`);
        }
      }
      
      // Replace the existing snapshot
      analyticsHistory[existingTodayIndex] = advancedSnapshot;
    } else {
      const snapshotType = advancedSnapshot.milestone !== undefined ? `MILESTONE ${advancedSnapshot.milestone}` : 'REGULAR';
      console.log(`📌 No existing ${snapshotType} snapshot from ${snapshotDate} (dateRange=${normalizedDateRange}), adding new snapshot`);
      analyticsHistory = [...analyticsHistory, advancedSnapshot];
    }
    
    // IMPORTANT: Do NOT update currentViews/currentLikes/currentComments here
    // These should only be updated by the YouTube Data API sync, not by snapshots
    // Snapshots may contain date-range-specific data (e.g., last 28 days)
    // which should NOT overwrite the lifetime totals in currentViews
    const updatedVideo = {
      ...video,
      analyticsHistory,
      lastSnapshotDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Use retry logic for saving
    await retryKvOperation(() => kv.set(`video:${videoId}`, updatedVideo));
    
    console.log("✅ Advanced snapshot saved successfully");
    
    return c.json({ success: true, video: updatedVideo });
  } catch (error) {
    console.log("❌ Error adding advanced analytics snapshot:", error);
    return c.json({ error: "Failed to add advanced snapshot", details: String(error) }, 500);
  }
});

// Update snapshot note
app.put("/make-server-6ab9c767/videos/:videoId/snapshot/:timestamp/note", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const timestamp = c.req.param("timestamp");
    const { note } = await c.req.json();
    
    console.log(`📝 Updating note for snapshot ${timestamp} in video ${videoId}`);
    
    const video = await retryKvOperation(() => kv.get(`video:${videoId}`));
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    // Find the snapshot by timestamp
    let analyticsHistory = video.analyticsHistory || [];
    const snapshotIndex = analyticsHistory.findIndex(s => s.timestamp === timestamp);
    
    if (snapshotIndex === -1) {
      return c.json({ error: "Snapshot not found" }, 404);
    }
    
    // Update the note
    analyticsHistory[snapshotIndex] = {
      ...analyticsHistory[snapshotIndex],
      note: note || undefined, // Set to undefined if empty string
    };
    
    const updatedVideo = {
      ...video,
      analyticsHistory,
      updatedAt: new Date().toISOString(),
    };
    
    await retryKvOperation(() => kv.set(`video:${videoId}`, updatedVideo));
    
    console.log("✅ Snapshot note updated successfully");
    
    return c.json({ success: true, video: updatedVideo });
  } catch (error) {
    console.log("❌ Error updating snapshot note:", error);
    return c.json({ error: "Failed to update snapshot note", details: String(error) }, 500);
  }
});

// Clear all analytics data while preserving core video information
app.post("/make-server-6ab9c767/videos/clear-analytics", async (c) => {
  try {
    console.log("🧹 CLEARING ALL ANALYTICS DATA");
    
    const videos = await retryKvOperation(() => kv.getByPrefix("video:"));
    console.log(`Found ${videos.length} videos to clear analytics from`);
    
    if (videos.length === 0) {
      return c.json({ 
        success: true, 
        message: "No videos found to clear",
        clearedCount: 0 
      });
    }
    
    let clearedCount = 0;
    let errorCount = 0;
    
    for (const video of videos) {
      try {
        // Keep only the core video information
        const clearedVideo = {
          videoId: video.videoId,
          title: video.title,
          description: video.description,
          publishedAt: video.publishedAt,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          // Preserve user-created content
          notes: video.notes || "",
          nextSteps: video.nextSteps || "",
          tags: video.tags || [],
          // Preserve performance goals - do not clear them
          performanceGoals: video.performanceGoals || [],
          // Clear all analytics (both old 'views' and new 'currentViews' fields)
          views: 0,
          likes: 0,
          comments: 0,
          subscribers: 0,
          currentViews: 0,
          currentLikes: 0,
          currentComments: 0,
          impressions: undefined,
          ctr: undefined,
          percentageViewed: undefined,
          watchTime: undefined,
          avgViewDuration: undefined,
          topTrafficSource: undefined,
          topTrafficSourcePercentage: undefined,
          analyticsHistory: [],
          last28_views: undefined,
          last28_likes: undefined,
          last28_comments: undefined,
          last28_subscribers: undefined,
          last28_impressions: undefined,
          last28_ctr: undefined,
          last28_percentageViewed: undefined,
          last28_watchTime: undefined,
          last28_avgViewDuration: undefined,
          last28_topTrafficSource: undefined,
          last28_topTrafficSourcePercentage: undefined,
          // Preserve metadata
          autoSnapshotEnabled: video.autoSnapshotEnabled || false,
          snapshotFrequency: video.snapshotFrequency || 'daily',
          videoUpdated: false,
          createdAt: video.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await retryKvOperation(() => kv.set(`video:${video.videoId}`, clearedVideo));
        clearedCount++;
        
        // Log progress every 10 videos
        if (clearedCount % 10 === 0) {
          console.log(`Progress: Cleared ${clearedCount}/${videos.length} videos`);
        }
      } catch (error) {
        console.log(`Failed to clear analytics for video ${video.videoId}:`, error);
        errorCount++;
      }
    }
    
    console.log(`✅ Successfully cleared analytics from ${clearedCount} videos (${errorCount} errors)`);
    
    if (errorCount > 0) {
      return c.json({ 
        success: true, 
        message: `Analytics data cleared from ${clearedCount} videos (${errorCount} failures)`,
        clearedCount,
        errorCount
      });
    }
    
    return c.json({ 
      success: true, 
      message: `Analytics data cleared from ${clearedCount} videos`,
      clearedCount 
    });
  } catch (error) {
    console.error("❌ Error clearing analytics data:", error);
    return c.json({ error: "Failed to clear analytics data", details: String(error) }, 500);
  }
});

// Delete a video
app.delete("/make-server-6ab9c767/videos/:videoId", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    
    await kv.del(`video:${videoId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting video from database:", error);
    return c.json({ error: "Failed to delete video", details: String(error) }, 500);
  }
});

// OAuth: Get authorization URL
app.get("/make-server-6ab9c767/oauth/youtube-analytics/auth-url", async (c) => {
  try {
    const CLIENT_ID = YOUTUBE_OAUTH_CLIENT_ID;
    const originHeader = c.req.header("origin");
    // If no Origin header is present (non-browser caller), fall back to the production app domain.
    // This was previously a stale figma-make-app.com default from the Figma Make export.
    const redirectUri = `${originHeader || "https://tubelab.app"}/oauth-callback.html`;
    
    console.log("=== GENERATING OAUTH URL ===");
    console.log("Origin header received:", originHeader);
    console.log("Redirect URI being used:", redirectUri);
    console.log("Client ID:", CLIENT_ID);
    console.log("===========================");
    
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    
    console.log("Generated auth URL (first 200 chars):", authUrl.toString().substring(0, 200));
    
    return c.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("Error generating OAuth URL:", error);
    return c.json({ error: "Failed to generate auth URL", details: String(error) }, 500);
  }
});

// OAuth: Exchange code for tokens
app.post("/make-server-6ab9c767/oauth/youtube-analytics/callback", async (c) => {
  try {
    const { code, redirectUri } = await c.req.json();
    const CLIENT_ID = YOUTUBE_OAUTH_CLIENT_ID;
    const CLIENT_SECRET = Deno.env.get("YOUTUBE_OAUTH_CLIENT_SECRET");
    
    // Get userId from Authorization header
    const authHeader = c.req.header("Authorization");
    const accessToken = authHeader?.split(" ")[1];
    
    if (!accessToken) {
      console.error("No authorization header provided");
      return c.json({ error: "Authorization required" }, 401);
    }
    
    // Validate user with Supabase (use ANON_KEY for user token validation)
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error("Invalid user token:", authError);
      console.error("Auth error details:", JSON.stringify(authError));
      return c.json({ error: "Unauthorized", details: authError?.message }, 401);
    }
    
    const userId = user.id;
    
    // Create service role client for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    console.log("OAuth callback received for user:", userId);
    console.log("Redirect URI:", redirectUri);
    console.log("CLIENT_SECRET exists:", !!CLIENT_SECRET);
    console.log("CLIENT_SECRET length:", CLIENT_SECRET?.length || 0);
    
    if (!CLIENT_SECRET) {
      console.error("YOUTUBE_OAUTH_CLIENT_SECRET environment variable is not set");
      return c.json({ error: "OAuth client secret not configured" }, 500);
    }
    
    // Exchange code for tokens
    const tokenParams = {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };
    
    console.log("Token exchange params (secret hidden):", { 
      ...tokenParams, 
      client_secret: "***" + CLIENT_SECRET.slice(-4) 
    });
    
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(tokenParams),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      let errorObj;
      try {
        errorObj = JSON.parse(errorText);
      } catch {
        errorObj = { error: errorText };
      }
      
      console.error("=== TOKEN EXCHANGE FAILED ===");
      console.error("Status:", tokenResponse.status);
      console.error("Error:", errorText);
      console.error("Redirect URI used:", redirectUri);
      console.error("=============================");
      
      // Provide helpful error messages
      let helpfulMessage = errorObj.error_description || errorObj.error || "Unknown error";
      
      if (errorObj.error === "invalid_client") {
        helpfulMessage = "Invalid Client ID or Client Secret. Please verify both in Google Cloud Console.";
      } else if (errorObj.error === "redirect_uri_mismatch") {
        helpfulMessage = `Redirect URI mismatch. Expected: ${redirectUri}. Check Google Cloud Console.`;
      } else if (errorObj.error === "invalid_grant") {
        helpfulMessage = "Authorization code expired or already used. Please try connecting again.";
      }
      
      return c.json({ 
        error: "Token exchange failed", 
        details: helpfulMessage,
        googleError: errorObj 
      }, 500);
    }
    
    const tokens = await tokenResponse.json();
    
    // Fetch channel ID using the access token
    console.log("🔍 Fetching channel ID...");
    try {
      const channelResponse = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=id&mine=true",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );
      
      if (channelResponse.ok) {
        const channelData = await channelResponse.json();
        if (channelData.items && channelData.items.length > 0) {
          const channelId = channelData.items[0].id;
          console.log(`✅ Channel ID fetched: ${channelId}`);
          
          // Store channel ID for this user
          await kv.set(`youtube:channel:${userId}`, channelId);
          console.log(`✅ Channel ID stored for user: ${userId}`);
        } else {
          console.warn("⚠️ No channel found for user");
        }
      } else {
        console.warn("⚠️ Failed to fetch channel ID:", channelResponse.status);
      }
    } catch (error) {
      console.warn("⚠️ Error fetching channel ID (non-fatal):", error);
      // Don't fail the OAuth flow if channel ID fetch fails
    }
    
    // Store tokens per-user in KV store
    await kv.set(`youtube:oauth:tokens:${userId}`, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
      tokenType: tokens.token_type,
    });
    
    console.log(`✅ OAuth tokens stored for user: ${userId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return c.json({ error: "Failed to complete OAuth flow", details: String(error) }, 500);
  }
});

// OAuth: Check connection status
app.get("/make-server-6ab9c767/oauth/youtube-analytics/status", async (c) => {
  try {
    // Get userId from Authorization header
    const authHeader = c.req.header("Authorization");
    const accessToken = authHeader?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ connected: false });
    }
    
    // Validate user with Supabase (use ANON_KEY for user token validation)
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ connected: false });
    }
    
    const userId = user.id;
    const tokens = await kv.get(`youtube:oauth:tokens:${userId}`);
    
    if (!tokens) {
      return c.json({ connected: false });
    }
    
    // Try to validate/refresh the token to ensure it's actually valid
    try {
      await getValidAccessToken(userId);
      return c.json({ 
        connected: true,
        expiresAt: tokens.expiresAt,
      });
    } catch (error) {
      // Token is invalid/expired and couldn't be refreshed
      console.log("ℹ️  OAuth tokens invalid or expired, clearing...");
      return c.json({ connected: false });
    }
  } catch (error) {
    // Don't log errors for this endpoint - it runs frequently on page load
    return c.json({ connected: false });
  }
});

// OAuth: Disconnect
app.post("/make-server-6ab9c767/oauth/youtube-analytics/disconnect", async (c) => {
  try {
    // Get userId from Authorization header
    const authHeader = c.req.header("Authorization");
    const accessToken = authHeader?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ error: "Authorization required" }, 401);
    }
    
    // Validate user with Supabase (use ANON_KEY for user token validation)
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const userId = user.id;
    await kv.del(`youtube:oauth:tokens:${userId}`);
    await kv.del(`youtube:channel:${userId}`);
    console.log(`✅ OAuth tokens and channel ID deleted for user: ${userId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting OAuth:", error);
    return c.json({ error: "Failed to disconnect", details: String(error) }, 500);
  }
});

// OAuth: Get channel ID
app.get("/make-server-6ab9c767/youtube/channel-id", async (c) => {
  try {
    // Get userId from Authorization header
    const authHeader = c.req.header("Authorization");
    const accessToken = authHeader?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ error: "Authorization required" }, 401);
    }
    
    // Validate user with Supabase
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const userId = user.id;
    const channelId = await kv.get(`youtube:channel:${userId}`);
    
    if (!channelId) {
      return c.json({ channelId: null });
    }
    
    return c.json({ channelId });
  } catch (error) {
    console.error("Error fetching channel ID:", error);
    return c.json({ error: "Failed to fetch channel ID", details: String(error) }, 500);
  }
});

// OAuth: Set channel ID manually
app.post("/make-server-6ab9c767/youtube/channel-id", async (c) => {
  try {
    // Get userId from Authorization header
    const authHeader = c.req.header("Authorization");
    const accessToken = authHeader?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ error: "Authorization required" }, 401);
    }
    
    // Validate user with Supabase
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const userId = user.id;
    const body = await c.req.json();
    const { channelId } = body;
    
    if (!channelId || typeof channelId !== 'string') {
      return c.json({ error: "Invalid channel ID" }, 400);
    }
    
    // Save channel ID
    await kv.set(`youtube:channel:${userId}`, channelId.trim());
    console.log(`✅ Channel ID manually saved for user: ${userId}`);
    
    return c.json({ success: true, channelId: channelId.trim() });
  } catch (error) {
    console.error("Error saving channel ID:", error);
    return c.json({ error: "Failed to save channel ID", details: String(error) }, 500);
  }
});

// Helper: Get userId from Authorization header
async function getUserIdFromAuth(c: any): Promise<string> {
  const authHeader = c.req.header("Authorization");
  const accessToken = authHeader?.split(" ")[1];
  
  console.log("🔐 getUserIdFromAuth: Authorization header present:", !!authHeader);
  console.log("🔐 getUserIdFromAuth: Token extracted:", accessToken ? `${accessToken.substring(0, 20)}...` : "NO TOKEN");
  
  if (!accessToken) {
    console.error("❌ getUserIdFromAuth: No access token in Authorization header");
    throw new Error("Authorization required");
  }
  
  // Validate user with Supabase (use ANON_KEY for user token validation)
  const { createClient } = await import("npm:@supabase/supabase-js@2");
  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );
  
  console.log("🔐 getUserIdFromAuth: Calling supabase.auth.getUser()...");
  
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(accessToken);
  
  if (authError) {
    console.error("❌ getUserIdFromAuth: Supabase auth error:", authError.message);
    console.error("❌ Full auth error:", JSON.stringify(authError));
    throw new Error(`Unauthorized: ${authError.message}`);
  }
  
  if (!user) {
    console.error("❌ getUserIdFromAuth: No user returned from Supabase");
    throw new Error("Unauthorized: User not found");
  }
  
  console.log("✅ getUserIdFromAuth: User authenticated:", user.id);
  
  return user.id;
}

// Helper: Refresh access token if needed
async function getValidAccessToken(userId: string) {
  const tokens = await kv.get(`youtube:oauth:tokens:${userId}`);
  
  if (!tokens) {
    throw new Error("No OAuth tokens found. Please connect YouTube Analytics.");
  }
  
  // Check if token is expired or will expire in next 5 minutes
  if (Date.now() >= tokens.expiresAt - (5 * 60 * 1000)) {
    // Refresh token
    const CLIENT_ID = YOUTUBE_OAUTH_CLIENT_ID;
    const CLIENT_SECRET = Deno.env.get("YOUTUBE_OAUTH_CLIENT_SECRET");
    
    console.log("🔄 Access token expired, refreshing...");
    
    const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        refresh_token: tokens.refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET!,
        grant_type: "refresh_token",
      }),
    });
    
    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.error("❌ Token refresh failed:", refreshResponse.status, errorText);
      
      // If refresh token is invalid or revoked, clear stored tokens
      if (refreshResponse.status === 400 || refreshResponse.status === 401) {
        await kv.del(`youtube:oauth:tokens:${userId}`);
        console.warn(`🔑 OAuth tokens cleared for user ${userId} due to expired/revoked session`);
        throw new Error("OAuth session expired. Please reconnect YouTube Analytics in Settings.");
      }
      
      throw new Error(`Failed to refresh access token: ${errorText}`);
    }
    
    const newTokens = await refreshResponse.json();
    
    // Google may return a new refresh token, so we should update it if provided
    const updatedTokens = {
      accessToken: newTokens.access_token,
      refreshToken: newTokens.refresh_token || tokens.refreshToken,
      expiresAt: Date.now() + (newTokens.expires_in * 1000),
      tokenType: newTokens.token_type,
    };
    
    await kv.set(`youtube:oauth:tokens:${userId}`, updatedTokens);
    console.log(`✅ Token refreshed successfully for user: ${userId}`);
    
    return updatedTokens.accessToken;
  }
  
  return tokens.accessToken;
}

// Fetch top videos from YouTube Analytics
// IMPORTANT: This route must come BEFORE /analytics/:videoId to avoid matching "top-videos" as a videoId
app.get("/make-server-6ab9c767/analytics/top-videos", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "10");
    const dateRange = c.req.query("dateRange") || "last28"; // 'last28' or 'last90' or 'lifetime'
    
    console.log("==========================================");
    console.log("🌟 FETCHING TOP VIDEOS FROM YOUTUBE");
    console.log("Limit:", limit);
    console.log("Date Range:", dateRange);
    console.log("==========================================");
    
    let accessToken;
    try {
      const userId = await getUserIdFromAuth(c);
      accessToken = await getValidAccessToken(userId);
      console.log("Access token obtained successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("OAuth session expired") || errorMessage.includes("Please reconnect") || errorMessage.includes("No OAuth tokens found")) {
        console.log("ℹ️  OAuth not connected or session expired");
        return c.json({ 
          error: "OAuth session expired. Please reconnect YouTube Analytics in Settings.",
          oauthExpired: true
        }, 401);
      }
      
      console.error("❌ OAuth error:", errorMessage);
      return c.json({ error: errorMessage }, 500);
    }
    
    // Calculate date range
    const today = new Date();
    const endDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    let startDate;
    
    if (dateRange === "last90") {
      startDate = new Date(today.getTime() - 93 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (dateRange === "lifetime") {
      // Go back 3 years for "lifetime" (YouTube Analytics limit)
      startDate = new Date(today.getTime() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else {
      // Default: last 28 days
      startDate = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
    
    console.log("Date range:", startDate, "to", endDate);
    
    // Fetch top videos by views
    const analyticsUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
    analyticsUrl.searchParams.set("ids", "channel==MINE");
    analyticsUrl.searchParams.set("startDate", startDate);
    analyticsUrl.searchParams.set("endDate", endDate);
    analyticsUrl.searchParams.set("metrics", "views,estimatedMinutesWatched,averageViewDuration");
    analyticsUrl.searchParams.set("dimensions", "video");
    analyticsUrl.searchParams.set("sort", "-views"); // Sort by views descending
    analyticsUrl.searchParams.set("maxResults", limit.toString());
    
    console.log("📡 Top Videos URL:", analyticsUrl.toString());
    
    const analyticsResponse = await retryYouTubeApiCall(
      analyticsUrl.toString(),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    console.log("Analytics API response status:", analyticsResponse.status);
    
    if (!analyticsResponse.ok) {
      const errorText = await analyticsResponse.text();
      console.error("Top videos API error:", errorText);
      
      // Parse error for helpful messages
      try {
        const errorData = JSON.parse(errorText);
        
        if (errorData.error?.code === 403 && 
            errorData.error?.details?.some((d: any) => d.reason === "SERVICE_DISABLED")) {
          return c.json({ 
            error: "API_NOT_ENABLED",
            message: "YouTube Analytics API is not enabled",
            details: errorText 
          }, 403);
        }
        
        if (errorData.error?.code === 500 || analyticsResponse.status === 500) {
          return c.json({ 
            error: "ANALYTICS_UNAVAILABLE",
            message: "YouTube Analytics API is temporarily unavailable.",
            details: errorText 
          }, 503);
        }
      } catch (parseError) {
        // Ignore JSON parse errors
      }
      
      return c.json({ 
        error: "Failed to fetch top videos",
        details: errorText 
      }, analyticsResponse.status);
    }
    
    const analyticsData = await analyticsResponse.json();
    console.log("Analytics data rows:", analyticsData.rows?.length || 0);
    
    if (!analyticsData.rows || analyticsData.rows.length === 0) {
      console.log("No top videos data available");
      return c.json({ 
        success: true,
        topVideos: []
      });
    }
    
    // Parse the results
    const topVideos = analyticsData.rows.map((row: any[]) => ({
      videoId: row[0], // video dimension
      views: row[1],
      estimatedMinutesWatched: row[2],
      averageViewDuration: row[3],
    }));
    
    console.log("✅ Top videos fetched:", topVideos.length);
    console.log("Top 3 video IDs:", topVideos.slice(0, 3).map((v: any) => v.videoId));
    
    return c.json({ 
      success: true,
      topVideos,
      dateRange,
      limit
    });
  } catch (error) {
    console.error("=== ERROR FETCHING TOP VIDEOS ===");
    console.error("Error:", error);
    console.error("==================================");
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Determine appropriate status code and user-friendly message
    let statusCode = 500;
    let userMessage = errorMessage;
    
    if (errorMessage.includes('OAuth session expired') || errorMessage.includes('No OAuth tokens found')) {
      statusCode = 401;
      userMessage = "OAuth session expired. Please reconnect YouTube Analytics in Settings.";
    }
    
    return c.json({ error: userMessage }, statusCode);
  }
});

// Fetch analytics data for a specific video
app.get("/make-server-6ab9c767/analytics/:videoId", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const dateRange = c.req.query("dateRange") || "last28"; // 'last28' or 'sincePublished'
    
    console.log("===========================================");
    console.log("🔥 SERVER v2.6.1 - FETCHING ANALYTICS 🔥");
    console.log("Video ID:", videoId);
    console.log("Date Range:", dateRange);
    console.log("NOTE: Impressions/CTR excluded (manual import only)");
    console.log("===========================================");
    
    // Safety check: This should not happen as top-videos has its own route above
    if (videoId === "top-videos") {
      console.error("⚠️ WARNING: top-videos matched the :videoId route. This should not happen!");
      return c.json({ error: "Invalid route - use /analytics/top-videos endpoint" }, 400);
    }
    
    // Special handling for channel-stats request
    if (videoId === "channel-stats") {
      console.log("📊 Fetching channel-level analytics (watch time)");
      
      try {
        const userId = await getUserIdFromAuth(c);
        const accessToken = await getValidAccessToken(userId);
        
        // Fetch channel-level watch time (lifetime)
        const today = new Date();
        const endDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const startDate = '2005-02-01'; // YouTube's founding date - gets lifetime stats
        
        const analyticsUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
        analyticsUrl.searchParams.set("ids", "channel==MINE");
        analyticsUrl.searchParams.set("startDate", startDate);
        analyticsUrl.searchParams.set("endDate", endDate);
        analyticsUrl.searchParams.set("metrics", "estimatedMinutesWatched");
        
        const analyticsResponse = await retryYouTubeApiCall(
          analyticsUrl.toString(),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (analyticsResponse.ok) {
          const data = await analyticsResponse.json();
          const watchTimeMinutes = data.rows?.[0]?.[0] || 0;
          
          console.log("✅ Channel watch time fetched:", watchTimeMinutes, "minutes");
          
          return c.json({ 
            watchTimeMinutes,
            success: true 
          });
        } else {
          console.error("Failed to fetch channel analytics");
          return c.json({ 
            error: "Failed to fetch channel analytics",
            watchTimeMinutes: null 
          }, 500);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error fetching channel stats";
        
        // Determine appropriate status code and user-friendly message
        let statusCode = 500;
        let userMessage = errorMessage;
        
        if (errorMessage.includes('OAuth session expired') || errorMessage.includes('No OAuth tokens found') || errorMessage.includes('Please reconnect')) {
          console.log("ℹ️  Channel stats: OAuth not connected or session expired");
        } else {
          console.error("Error fetching channel stats:", error);
        }
        
        if (errorMessage.includes('OAuth session expired') || errorMessage.includes('No OAuth tokens found')) {
          statusCode = 401;
          userMessage = "OAuth session expired. Please reconnect YouTube Analytics in Settings.";
        }
        
        return c.json({ 
          error: userMessage,
          watchTimeMinutes: null 
        }, statusCode);
      }
    }
    
    // Validate YouTube video ID format
    const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
    if (!videoIdPattern.test(videoId)) {
      console.error("Invalid video ID format:", videoId);
      return c.json({ 
        error: "Invalid YouTube video ID format",
        analyticsData: null 
      }, 400);
    }
    
    let accessToken;
    try {
      const userId = await getUserIdFromAuth(c);
      accessToken = await getValidAccessToken(userId);
      console.log("Access token obtained successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ OAuth error:", errorMessage);
      
      if (errorMessage.includes("OAuth session expired") || errorMessage.includes("Please reconnect")) {
        return c.json({ 
          error: "OAuth session expired. Please reconnect YouTube Analytics in Settings.",
          analyticsData: null,
          oauthExpired: true
        }, 401);
      }
      
      return c.json({ 
        error: errorMessage,
        analyticsData: null
      }, 500);
    }
    
    // Get video data to check publish date
    // First try to get from query parameter (for new videos not yet in DB)
    const publishedAtParam = c.req.query("publishedAt");
    const video = await kv.get(`video:${videoId}`);
    let videoPublishDate = null;
    
    // Prefer query param if provided, otherwise fall back to DB
    const publishedAtSource = publishedAtParam || video?.publishedAt;
    
    if (publishedAtSource) {
      videoPublishDate = new Date(publishedAtSource);
      // Check if date is valid
      if (isNaN(videoPublishDate.getTime())) {
        console.error("Invalid publishedAt date for video:", videoId, publishedAtSource);
        videoPublishDate = null;
      } else {
        console.log("Video published on:", videoPublishDate.toISOString().split('T')[0]);
        console.log("  (source:", publishedAtParam ? "query param" : "database", ")");
      }
    }
    
    // Get date range for analytics
    const today = new Date();
    const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
    let endDate, startDate;
    let effectiveDateRange = dateRange; // Track what we actually use
    
    // Check if video is less than 28 days old
    let videoAge = null;
    if (videoPublishDate) {
      videoAge = Math.floor((today.getTime() - videoPublishDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`📅 Video age: ${videoAge} days old`);
    }
    
    if (dateRange === "sincePublished" && videoPublishDate) {
      // For lifetime data: from publish date to yesterday (YouTube Studio shows up to yesterday)
      startDate = videoPublishDate.toISOString().split('T')[0];
      endDate = yesterday.toISOString().split('T')[0];
      console.log("Using 'Since Published' (lifetime) mode");
      console.log("  - startDate:", startDate, "(publish date)");
      console.log("  - endDate:", endDate, "(yesterday)");
    } else {
      // For Last 28 Days: Calculate actual dates (YouTube doesn't support "28daysAgo" syntax)
      endDate = yesterday.toISOString().split('T')[0];
      const twentyEightDaysAgo = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000);
      startDate = twentyEightDaysAgo.toISOString().split('T')[0];
      console.log("Using 'Last 28 Days' mode");
      console.log("  - startDate:", startDate, "(28 days ago)");
      console.log("  - endDate:", endDate, "(yesterday)");
    }
    
    // Validate date range before making API call
    // This catches cases where startDate > endDate (e.g., video published today)
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (startDateObj > endDateObj) {
      console.log(`⚠️ Invalid date range: startDate (${startDate}) is after endDate (${endDate})`);
      console.log("   This happens when video is too new for analytics");
      return c.json({ 
        error: "Video is too new for analytics. YouTube shows data starting from the day after publish. Please try again tomorrow.",
        analyticsData: null 
      }, 404);
    }
    
    // Additional check: For lifetime queries, ensure video is not too new for analytics
    if (dateRange === "sincePublished" || effectiveDateRange === "sincePublished") {
      // Validate that video has been published long enough for analytics data
      const publishDate = new Date(startDate);
      const today = new Date();
      const yesterday = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
      
      if (publishDate >= yesterday) {
        console.log("Video is too new for analytics (published yesterday or today)");
        return c.json({ 
          error: "Video is too new for analytics. YouTube shows data starting from the day after publish. Please try again tomorrow.",
          analyticsData: null 
        }, 404);
      }
    }
    
    console.log("Date range:", startDate, "to", endDate);
    
    // Fetch analytics data from YouTube Analytics API
    console.log("🎯 REQUESTING ANALYTICS");
    console.log("🎯 Video ID:", videoId);
    console.log("🎯 Date Range Mode:", dateRange);
    console.log("🎯 Start Date:", startDate);
    console.log("🎯 End Date:", endDate);
    console.log("🎯 Video Published:", videoPublishDate?.toISOString().split('T')[0] || 'unknown');
    
    const analyticsUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
    analyticsUrl.searchParams.set("ids", "channel==MINE");
    analyticsUrl.searchParams.set("startDate", startDate);
    analyticsUrl.searchParams.set("endDate", endDate);
    // Basic metrics that are available to all creators
    analyticsUrl.searchParams.set("metrics", "views,likes,comments,estimatedMinutesWatched,averageViewDuration,averageViewPercentage");
    analyticsUrl.searchParams.set("dimensions", "video");
    analyticsUrl.searchParams.set("filters", `video==${videoId}`);
    
    console.log("📡 FULL Analytics API URL:", analyticsUrl.toString());
    
    const analyticsResponse = await retryYouTubeApiCall(
      analyticsUrl.toString(),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    console.log("Analytics API response status:", analyticsResponse.status);
    
    if (!analyticsResponse.ok) {
      const errorText = await analyticsResponse.text();
      console.error("Analytics API error:", errorText);
      console.error("Analytics request params:", {
        videoId,
        startDate,
        endDate,
        dateRange,
        publishDate: videoPublishDate?.toISOString()
      });
      
      // Parse the error to check for specific error types
      try {
        const errorData = JSON.parse(errorText);
        
        // Check for SERVICE_DISABLED error
        if (errorData.error?.code === 403 && 
            errorData.error?.details?.some((d: any) => d.reason === "SERVICE_DISABLED")) {
          return c.json({ 
            error: "API_NOT_ENABLED",
            message: "YouTube Analytics API is not enabled",
            activationUrl: errorData.error.details.find((d: any) => d["@type"]?.includes("ErrorInfo"))?.metadata?.activationUrl,
            details: errorText 
          }, 403);
        }
        
        // Check for 500 Internal Server Error
        if (errorData.error?.code === 500 || analyticsResponse.status === 500) {
          console.error("YouTube Analytics API 500 error - this is usually a temporary issue");
          return c.json({ 
            error: "ANALYTICS_UNAVAILABLE",
            message: "YouTube Analytics API is temporarily unavailable. This is a temporary issue on Google's side. Please try again in 30-60 minutes, or use 'Add Advanced Data' to manually enter metrics.",
            suggestion: "You can still take basic snapshots (views, likes, comments) or manually add advanced analytics data.",
            details: errorText 
          }, 503); // Service Unavailable
        }
        
        // Check for invalid date filter error
        if (errorData.error?.code === 400 && 
            errorData.error?.message?.includes("Invalid value") && 
            errorData.error?.message?.includes("parameters.filters")) {
          console.error("Invalid date in filters - likely video published after requested date");
          return c.json({ 
            error: "Video too new or date range invalid",
            message: "The requested date range may be before the video was published or too recent. YouTube Analytics has a 2-3 day delay.",
            details: errorText 
          }, 400);
        }
        
        // Check for quota exceeded
        if (errorData.error?.code === 403 && 
            errorData.error?.errors?.some((e: any) => e.reason === "quotaExceeded")) {
          return c.json({ 
            error: "QUOTA_EXCEEDED",
            message: "YouTube Analytics API quota exceeded. Please try again later.",
            details: errorText 
          }, 429);
        }
      } catch (e) {
        console.error("Error parsing analytics error response:", e);
      }
      
      return c.json({ error: "Failed to fetch analytics", details: errorText }, 500);
    }
    
    const analyticsData = await analyticsResponse.json();
    
    console.log("🔥🔥🔥 YOUTUBE ANALYTICS API RAW RESPONSE 🔥🔥🔥");
    console.log("📊 Column Headers:", JSON.stringify(analyticsData.columnHeaders, null, 2));
    console.log("📊 Data Rows:", JSON.stringify(analyticsData.rows, null, 2));
    console.log("📊 Kind:", analyticsData.kind);
    console.log("🔥🔥🔥 END RAW RESPONSE 🔥🔥🔥");
    console.log("");
    console.log("🎯 CRITICAL DEBUG INFO:");
    console.log("   Requested date range:", startDate, "to", endDate);
    console.log("   Date range parameter:", dateRange);
    console.log("   Effective date range:", effectiveDateRange);
    console.log("   Views returned by API:", analyticsData.rows?.[0]?.[1]);
    console.log("   This data will be labeled as:", effectiveDateRange === "sincePublished" ? "lifetime" : "last28");
    
    // NOTE: Impressions and CTR are NOT available through YouTube Analytics API
    // They can only be viewed in YouTube Studio and must be manually imported via CSV
    console.log("ℹ️ Impressions and CTR must be manually imported - not available via API");
    
    // Fetch traffic source data (ALL sources, not just top 1)
    const trafficUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
    trafficUrl.searchParams.set("ids", "channel==MINE");
    trafficUrl.searchParams.set("startDate", startDate);
    trafficUrl.searchParams.set("endDate", endDate);
    trafficUrl.searchParams.set("metrics", "views");
    trafficUrl.searchParams.set("dimensions", "insightTrafficSourceType");
    trafficUrl.searchParams.set("filters", `video==${videoId}`);
    trafficUrl.searchParams.set("sort", "-views");
    trafficUrl.searchParams.set("maxResults", "25"); // Get up to 25 traffic sources
    
    const trafficResponse = await retryYouTubeApiCall(
      trafficUrl.toString(),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    let topTrafficSource = null;
    let topTrafficSourcePercentage = null;
    let allTrafficSources: Array<{source: string, views: number, percentage: number}> = [];
    
    if (trafficResponse.ok) {
      const trafficData = await trafficResponse.json();
      console.log("🚦 TRAFFIC SOURCE RAW DATA:", JSON.stringify(trafficData, null, 2));
      if (trafficData.rows && trafficData.rows.length > 0) {
        const totalViews = analyticsData.rows?.[0]?.[1] || 0;
        
        // Get top source for backward compatibility
        topTrafficSource = trafficData.rows[0][0];
        const topTrafficViews = trafficData.rows[0][1];
        topTrafficSourcePercentage = totalViews > 0 ? (topTrafficViews / totalViews) * 100 : 0;
        console.log("🚦 TOP TRAFFIC SOURCE VALUE:", topTrafficSource);
        console.log("🚦 TRAFFIC SOURCE PERCENTAGE:", topTrafficSourcePercentage);
        
        // Get all traffic sources
        allTrafficSources = trafficData.rows.map((row: any[]) => ({
          source: row[0],
          views: row[1],
          percentage: totalViews > 0 ? (row[1] / totalViews) * 100 : 0
        }));
        console.log("🚦 ALL TRAFFIC SOURCES:", JSON.stringify(allTrafficSources, null, 2));
      }
    }
    
    // Parse analytics data
    console.log("Analytics data rows:", analyticsData.rows);
    console.log("Analytics column headers:", analyticsData.columnHeaders);
    
    if (!analyticsData.rows || analyticsData.rows.length === 0) {
      console.log("No analytics data available for video:", videoId);
      return c.json({ 
        error: "No analytics data available for this video. It may be too new or private.",
        analyticsData: null 
      }, 404);
    }
    
    const row = analyticsData.rows[0];
    console.log("🎯 Parsed analytics row:", row);
    
    // NOTE: impressions and CTR are excluded - they must be manually imported
    // Row format: [video, views, likes, comments, estimatedMinutesWatched, averageViewDuration, averageViewPercentage]
    const videoIdFromRow = row[0];
    const views = row[1] || 0;
    const likes = row[2] || 0;
    const comments = row[3] || 0;
    
    console.log("🎯 PARSED VALUES:");
    console.log("  - Video ID from row:", videoIdFromRow);
    console.log("  - Views (index 1):", views);
    console.log("  - Likes (index 2):", likes);
    console.log("  - Comments (index 3):", comments);
    console.log("  - Watch time (index 4):", row[4]);
    console.log("  - Watch time type:", typeof row[4]);
    console.log("  - Avg duration (index 5):", row[5]);
    console.log("  - Avg percentage (index 6):", row[6]);
    console.log("  - Row length:", row.length);
    console.log("  - Column headers count:", analyticsData.columnHeaders?.length);
    
    // Check if watch time data is actually present
    const hasWatchTimeData = row[4] !== null && row[4] !== undefined;
    console.log("  - Has watch time data:", hasWatchTimeData);
    if (!hasWatchTimeData) {
      console.log("  ⚠️ WARNING: YouTube API did not return watch time data for this video!");
      console.log("  ⚠️ This can happen if the video has no views/watch time in the selected date range.");
    }
    
    // Determine whether to use realtime data override
    // - For "last28": Use Analytics API data (that's what the user requested)
    // - For "lifetime": Use realtime current data (more accurate than yesterday's Analytics data)
    let shouldUseRealtimeData = false;
    let daysSincePublish = null;
    
    if (videoPublishDate) {
      const today = new Date();
      daysSincePublish = Math.floor((today.getTime() - videoPublishDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Use realtime data for lifetime mode (effectiveDateRange, not the original requested dateRange)
      // This includes cases where we converted "last28" to "sincePublished" for young videos
      if (effectiveDateRange === "sincePublished") {
        shouldUseRealtimeData = true;
        console.log("⚠️ LIFETIME MODE - Will use realtime current values");
        console.log("  - Days since publish:", daysSincePublish);
        console.log("  - Analytics API views (up to yesterday):", views);
        console.log("  - Frontend should use current realtime views instead");
      } else {
        console.log("✅ LAST 28 DAYS MODE - Using Analytics API data as-is");
        console.log("  - Days since publish:", daysSincePublish);
        console.log("  - Analytics API views (last 28 days):", views);
        console.log("  - This data will be saved to 'last28' snapshot");
      }
    }
    
    const result = {
      success: true,
      analytics: {
        views: views,
        likes: likes,
        comments: comments,
        estimatedMinutesWatched: (row[4] !== null && row[4] !== undefined) ? row[4] : undefined,
        averageViewDuration: (row[5] !== null && row[5] !== undefined) ? row[5] : undefined,
        averageViewPercentage: (row[6] !== null && row[6] !== undefined) ? row[6] : undefined,
        // impressions and ctr are NOT included - manual import only
        topTrafficSource,
        topTrafficSourcePercentage,
        allTrafficSources, // NEW: All traffic sources with percentages
      },
      // Flag to tell frontend to use realtime data instead
      useRealtimeViews: shouldUseRealtimeData,
      daysSincePublish: daysSincePublish,
      // The actual dateRange that was used (may differ from requested if video is <28 days old)
      effectiveDateRange: effectiveDateRange,
      // DEBUG: Include raw API response for inspection
      _debug: {
        videoId: videoId,
        requestedDateRange: dateRange,
        effectiveDateRange: effectiveDateRange,
        startDate: startDate,
        endDate: endDate,
        columnHeaders: analyticsData.columnHeaders,
        rows: analyticsData.rows,
        requestedMetrics: "views,likes,comments,estimatedMinutesWatched,averageViewDuration,averageViewPercentage",
        note: "Impressions and CTR are not available via YouTube Analytics API - must be manually imported",
        shouldUseRealtimeData: shouldUseRealtimeData,
        reason: shouldUseRealtimeData ? "Lifetime mode - Using current realtime data (Analytics only goes to yesterday)" : "Last 28 days mode - Using Analytics API data as requested"
      }
    };
    
    console.log("📤 RETURNING TO FRONTEND:", JSON.stringify(result, null, 2));
    console.log("=========================");
    
    return c.json(result);
  } catch (error) {
    console.error("=== ERROR FETCHING ANALYTICS ===");
    console.error("Error:", error);
    console.error("================================");
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Determine appropriate status code and user-friendly message
    let statusCode = 500;
    let userMessage = errorMessage;
    
    if (errorMessage.includes('OAuth session expired') || errorMessage.includes('No OAuth tokens found')) {
      statusCode = 401;
      userMessage = "OAuth session expired. Please reconnect YouTube Analytics in Settings.";
    }
    
    return c.json({ error: userMessage }, statusCode);
  }
});

// Test impressions endpoint - diagnostic tool
app.get("/make-server-6ab9c767/test-impressions/:videoId", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    
    if (!accessToken) {
      return c.json({ error: "No access token provided" }, 401);
    }
    
    console.log("🧪 TESTING IMPRESSIONS FOR VIDEO:", videoId);
    
    // Calculate date range (last 28 days)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log("Date range:", startDateStr, "to", endDateStr);
    
    // Test impressions fetch
    const impressionsUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
    impressionsUrl.searchParams.set("ids", "channel==MINE");
    impressionsUrl.searchParams.set("startDate", startDateStr);
    impressionsUrl.searchParams.set("endDate", endDateStr);
    impressionsUrl.searchParams.set("metrics", "impressions");
    impressionsUrl.searchParams.set("dimensions", "video");
    impressionsUrl.searchParams.set("filters", `video==${videoId}`);
    
    console.log("Request URL:", impressionsUrl.toString());
    
    const response = await retryYouTubeApiCall(
      impressionsUrl.toString(),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    console.log("Response status:", response.status);
    
    const responseText = await response.text();
    console.log("Response text:", responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawText: responseText };
    }
    
    return c.json({
      success: response.ok,
      status: response.status,
      requestUrl: impressionsUrl.toString(),
      dateRange: { start: startDateStr, end: endDateStr },
      response: responseData,
      impressionsValue: responseData?.rows?.[0]?.[1] || 0,
    });
  } catch (error) {
    console.error("Test impressions error:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Fix milestone snapshot timestamps
app.post("/make-server-6ab9c767/videos/:videoId/fix-milestone-timestamps", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const video = await kv.get(`video:${videoId}`);
    
    if (!video) {
      return c.json({ error: "Video not found" }, 404);
    }
    
    if (!video.analyticsHistory || video.analyticsHistory.length === 0) {
      return c.json({ success: true, message: "No snapshots to fix", video });
    }
    
    const publishDate = new Date(video.publishedAt);
    let fixedCount = 0;
    
    // Fix timestamps for milestone snapshots
    const fixedHistory = video.analyticsHistory.map((snapshot: any) => {
      if (snapshot.milestone) {
        // Calculate the correct milestone date
        const milestoneDate = new Date(publishDate);
        milestoneDate.setDate(milestoneDate.getDate() + snapshot.milestone);
        
        // Check if timestamp is incorrect (not on the milestone date)
        const currentTimestamp = new Date(snapshot.timestamp);
        const currentDateOnly = new Date(currentTimestamp.toDateString());
        const milestoneDateOnly = new Date(milestoneDate.toDateString());
        
        if (currentDateOnly.getTime() !== milestoneDateOnly.getTime()) {
          fixedCount++;
          console.log(`Fixing ${snapshot.milestone}-day snapshot: ${currentTimestamp.toISOString()} -> ${milestoneDate.toISOString()}`);
          return {
            ...snapshot,
            timestamp: milestoneDate.toISOString(),
          };
        }
      }
      return snapshot;
    });
    
    if (fixedCount > 0) {
      const updatedVideo = {
        ...video,
        analyticsHistory: fixedHistory,
        updatedAt: new Date().toISOString(),
      };
      
      await kv.set(`video:${videoId}`, updatedVideo);
      console.log(`Fixed ${fixedCount} milestone snapshot timestamp(s) for video: ${video.title}`);
      
      return c.json({ 
        success: true, 
        message: `Fixed ${fixedCount} milestone snapshot timestamp(s)`,
        video: updatedVideo 
      });
    } else {
      return c.json({ 
        success: true, 
        message: "All milestone timestamps are already correct",
        video 
      });
    }
  } catch (error) {
    console.error("Error fixing milestone timestamps:", error);
    return c.json({ error: "Failed to fix timestamps", details: String(error) }, 500);
  }
});

// Fetch historical analytics for a specific date (for milestone backfill)
// Returns analytics data from publish date up to the specified milestone date
app.get("/make-server-6ab9c767/analytics/:videoId/historical", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    const milestoneDate = c.req.query("milestoneDate"); // ISO date string for the milestone date
    
    if (!milestoneDate) {
      return c.json({ error: "milestoneDate query parameter required" }, 400);
    }
    
    console.log("==========================================");
    console.log("📅 FETCHING HISTORICAL ANALYTICS");
    console.log("Video ID:", videoId);
    console.log("Milestone Date:", milestoneDate);
    console.log("==========================================");
    
    // Validate YouTube video ID format
    const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
    if (!videoIdPattern.test(videoId)) {
      return c.json({ error: "Invalid YouTube video ID format" }, 400);
    }
    
    const userId = await getUserIdFromAuth(c);
    const accessToken = await getValidAccessToken(userId);
    
    // Get video to find publish date
    const video = await kv.get(`video:${videoId}`);
    if (!video || !video.publishedAt) {
      return c.json({ error: "Video not found or missing publish date" }, 404);
    }
    
    const publishDate = new Date(video.publishedAt);
    const endDate = new Date(milestoneDate);
    
    // Validate dates
    if (endDate <= publishDate) {
      return c.json({ error: "Milestone date must be after publish date" }, 400);
    }
    
    const startDateStr = publishDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log("  - Start Date:", startDateStr, "(publish date)");
    console.log("  - End Date:", endDateStr, "(milestone date)");
    
    // Fetch analytics data from YouTube Analytics API
    const analyticsUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
    analyticsUrl.searchParams.set("ids", "channel==MINE");
    analyticsUrl.searchParams.set("startDate", startDateStr);
    analyticsUrl.searchParams.set("endDate", endDateStr);
    analyticsUrl.searchParams.set("filters", `video==${videoId}`);
    analyticsUrl.searchParams.set("metrics", "views,likes,comments,estimatedMinutesWatched,averageViewDuration,averageViewPercentage");
    
    console.log("📡 Calling YouTube Analytics API...");
    const analyticsResponse = await retryYouTubeApiCall(
      analyticsUrl.toString(),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!analyticsResponse.ok) {
      const errorText = await analyticsResponse.text();
      console.error("YouTube Analytics API error:", errorText);
      return c.json({ 
        error: "Failed to fetch analytics data",
        details: errorText 
      }, analyticsResponse.status);
    }
    
    const data = await analyticsResponse.json();
    console.log("✅ Analytics data received");
    
    if (!data.rows || data.rows.length === 0) {
      console.log("⚠️  No analytics data available for this date range");
      return c.json({ 
        analytics: null,
        message: "No analytics data available for this date range" 
      });
    }
    
    const row = data.rows[0];
    const analytics = {
      views: row[0] || 0,
      likes: row[1] || 0,
      comments: row[2] || 0,
      estimatedMinutesWatched: (row[3] !== null && row[3] !== undefined) ? row[3] : undefined,
      averageViewDuration: (row[4] !== null && row[4] !== undefined) ? row[4] : undefined,
      averageViewPercentage: (row[5] !== null && row[5] !== undefined) ? row[5] : undefined,
    };
    
    console.log("📊 Historical Analytics:", analytics);
    
    return c.json({ analytics });
  } catch (error) {
    console.error("Error fetching historical analytics:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const statusCode = errorMessage.includes('OAuth session expired') ? 401 : 500;
    return c.json({ error: errorMessage, details: String(error) }, statusCode);
  }
});

// Fetch analytics for BOTH 28 days AND lifetime (views, watch time, engagement, traffic sources)
// Creates two snapshots: one for recent performance, one for all-time
// NOTE: Impressions/CTR are NOT available via YouTube Analytics API - use CSV import instead
app.post("/make-server-6ab9c767/analytics/:videoId/dual-snapshot", async (c) => {
  try {
    const videoId = c.req.param("videoId");
    
    console.log("===========================================");
    console.log("🎯 DUAL SNAPSHOT: 28 Days + Lifetime");
    console.log("Video ID:", videoId);
    console.log("===========================================");
    
    // Validate YouTube video ID format
    const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
    if (!videoIdPattern.test(videoId)) {
      console.error("Invalid video ID format:", videoId);
      return c.json({ error: "Invalid YouTube video ID format" }, 400);
    }
    
    const userId = await getUserIdFromAuth(c);
    const accessToken = await getValidAccessToken(userId);
    console.log("Access token obtained successfully");
    
    // Get video data to check publish date
    const video = await kv.get(`video:${videoId}`);
    if (!video) {
      return c.json({ error: "Video not found in database" }, 404);
    }
    
    const videoPublishDate = video.publishedAt ? new Date(video.publishedAt) : null;
    if (!videoPublishDate || isNaN(videoPublishDate.getTime())) {
      return c.json({ error: "Video missing valid publish date" }, 400);
    }
    
    console.log("Video published on:", videoPublishDate.toISOString().split('T')[0]);
    
    // YouTube Analytics API has a 2-3 day delay
    const today = new Date();
    const endDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Calculate date ranges
    const lifetimeStartDate = videoPublishDate.toISOString().split('T')[0];
    const twentyEightDaysAgo = new Date(today.getTime() - 31 * 24 * 60 * 60 * 1000);
    const last28StartDate = (twentyEightDaysAgo > videoPublishDate ? twentyEightDaysAgo : videoPublishDate).toISOString().split('T')[0];
    
    console.log("Date ranges:");
    console.log("  Lifetime:", lifetimeStartDate, "to", endDate);
    console.log("  Last 28 days:", last28StartDate, "to", endDate);
    
    // Ensure endDate is after startDate
    if (endDate < lifetimeStartDate) {
      return c.json({ 
        error: "Video too new - published less than 3 days ago. YouTube Analytics has a 2-3 day delay." 
      }, 400);
    }
    
    // Helper function to fetch analytics for a date range
    async function fetchAnalyticsForRange(startDate: string, rangeLabel: string) {
      console.log(`\n📊 Fetching ${rangeLabel} analytics...`);
      
      // Fetch main analytics metrics including impressions and CTR
      const analyticsUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
      analyticsUrl.searchParams.set("ids", "channel==MINE");
      analyticsUrl.searchParams.set("startDate", startDate);
      analyticsUrl.searchParams.set("endDate", endDate);
      analyticsUrl.searchParams.set("metrics", "views,likes,comments,estimatedMinutesWatched,averageViewDuration,averageViewPercentage");
      analyticsUrl.searchParams.set("dimensions", "video");
      analyticsUrl.searchParams.set("filters", `video==${videoId}`);
      
      console.log("Request URL:", analyticsUrl.toString());
      
      const analyticsResponse = await retryYouTubeApiCall(
        analyticsUrl.toString(),
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      if (!analyticsResponse.ok) {
        const errorText = await analyticsResponse.text();
        console.error(`${rangeLabel} API error:`, errorText);
        throw new Error(`Failed to fetch ${rangeLabel} analytics: ${errorText}`);
      }
      
      const analyticsData = await analyticsResponse.json();
      console.log(`${rangeLabel} data rows:`, analyticsData.rows);
      console.log(`${rangeLabel} column headers:`, analyticsData.columnHeaders);
      
      if (!analyticsData.rows || analyticsData.rows.length === 0) {
        throw new Error(`No analytics data available for ${rangeLabel}`);
      }
      
      const row = analyticsData.rows[0];
      
      // Fetch traffic source data
      const trafficUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
      trafficUrl.searchParams.set("ids", "channel==MINE");
      trafficUrl.searchParams.set("startDate", startDate);
      trafficUrl.searchParams.set("endDate", endDate);
      trafficUrl.searchParams.set("metrics", "views");
      trafficUrl.searchParams.set("dimensions", "insightTrafficSourceType");
      trafficUrl.searchParams.set("filters", `video==${videoId}`);
      trafficUrl.searchParams.set("sort", "-views");
      trafficUrl.searchParams.set("maxResults", "1");
      
      const trafficResponse = await retryYouTubeApiCall(
        trafficUrl.toString(),
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      let topTrafficSource = null;
      let topTrafficSourcePercentage = null;
      
      if (trafficResponse.ok) {
        const trafficData = await trafficResponse.json();
        if (trafficData.rows && trafficData.rows.length > 0) {
          topTrafficSource = trafficData.rows[0][0];
          const trafficViews = trafficData.rows[0][1];
          const totalViews = row[1] || 0;
          topTrafficSourcePercentage = totalViews > 0 ? (trafficViews / totalViews) * 100 : 0;
        }
      }
      
      // Parse analytics data
      // Column order: video, views, likes, comments, estimatedMinutesWatched, averageViewDuration, averageViewPercentage
      // NOTE: impressions and CTR are NOT available via YouTube Analytics API
      return {
        views: row[1] || 0,
        likes: row[2] || 0,
        comments: row[3] || 0,
        estimatedMinutesWatched: (row[4] !== null && row[4] !== undefined) ? row[4] : undefined,
        averageViewDuration: (row[5] !== null && row[5] !== undefined) ? row[5] : undefined,
        averageViewPercentage: (row[6] !== null && row[6] !== undefined) ? row[6] : undefined,
        topTrafficSource,
        topTrafficSourcePercentage,
      };
    }
    
    // Fetch both date ranges
    const [lifetimeData, last28Data] = await Promise.all([
      fetchAnalyticsForRange(lifetimeStartDate, "Lifetime"),
      fetchAnalyticsForRange(last28StartDate, "Last 28 days"),
    ]);
    
    console.log("\n✅ Both analytics fetched successfully");
    console.log("Lifetime views:", lifetimeData.views, "Watch time:", lifetimeData.estimatedMinutesWatched + " min");
    console.log("28-day views:", last28Data.views, "Watch time:", last28Data.estimatedMinutesWatched + " min");
    
    // Create two snapshots
    const lifetimeSnapshot = {
      timestamp: new Date().toISOString(),
      ...lifetimeData,
      note: "Lifetime analytics (auto-fetched)",
      dateRange: "lifetime",
    };
    
    const last28Snapshot = {
      timestamp: new Date().toISOString(),
      ...last28Data,
      note: "Last 28 days analytics (auto-fetched)",
      dateRange: "last28",
    };
    
    // Add both snapshots to the video
    const updatedVideo = {
      ...video,
      analyticsHistory: [
        ...(video.analyticsHistory || []),
        lifetimeSnapshot,
        last28Snapshot,
      ],
      currentViews: lifetimeData.views,
      currentLikes: lifetimeData.likes,
      currentComments: lifetimeData.comments,
      lastSnapshotDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`video:${videoId}`, updatedVideo);
    
    console.log("✅ Dual snapshot saved successfully");
    console.log("===========================================");
    
    return c.json({ 
      success: true,
      lifetimeData,
      last28Data,
      video: updatedVideo,
    });
  } catch (error) {
    console.error("=== ERROR IN DUAL SNAPSHOT ===");
    console.error("Error:", error);
    console.error("===============================");
    return c.json({ error: "Failed to fetch dual snapshot", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
