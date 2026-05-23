/**
 * Utility for fetching YouTube Analytics with automatic retry logic
 * Handles temporary API failures (500/503 errors) with exponential backoff
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

/**
 * Fetches analytics data with automatic retry on temporary failures
 * @param url The analytics API endpoint URL
 * @param authToken The authorization token
 * @param options Retry configuration options
 * @returns The analytics response
 */
export async function fetchAnalyticsWithRetry(
  url: string,
  authToken: string,
  options: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 2,
    initialDelayMs = 2000,
    maxDelayMs = 8000
  } = options;

  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add delay for retry attempts
      if (attempt > 0) {
        const delay = Math.min(
          initialDelayMs * Math.pow(2, attempt - 1),
          maxDelayMs
        );
        console.log(`   🔄 Retry attempt ${attempt}/${maxRetries} after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Success - return immediately
      if (response.ok) {
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
          console.warn(`   ⚠️ Non-retryable error (${response.status}), not retrying`);
        }
        return response;
      }

      // Log retryable error
      try {
        const errorData = await response.clone().json();
        console.warn(
          `   ⚠️ YouTube API temporarily unavailable (${response.status}): ${
            errorData.message || 'Internal error'
          }`
        );
      } catch {
        console.warn(`   ⚠️ YouTube API temporarily unavailable (${response.status})`);
      }

      // Continue to next retry attempt
      if (attempt < maxRetries) {
        console.log(`   ⏳ Will retry (${attempt + 1}/${maxRetries} attempts so far)...`);
      }

    } catch (error) {
      lastError = error as Error;
      console.error(`   ❌ Network error on attempt ${attempt + 1}:`, error);

      // Continue to next retry attempt if not at max
      if (attempt < maxRetries) {
        console.log(`   ⏳ Will retry due to network error...`);
      }
    }
  }

  // All retries exhausted
  console.warn(`   ⚠️ Max retries (${maxRetries}) reached`);

  // Return the last response if available, otherwise throw the last error
  if (lastResponse) {
    return lastResponse;
  }

  if (lastError) {
    throw lastError;
  }

  // This should never happen, but just in case
  throw new Error('Failed to fetch analytics after retries');
}

/**
 * Helper function to parse analytics response with proper error handling
 */
export async function parseAnalyticsResponse(response: Response): Promise<{
  success: boolean;
  analytics?: any;
  error?: string;
  errorCode?: string;
}> {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || errorData.message || 'Failed to fetch analytics',
        errorCode: errorData.errorCode,
      };
    } catch {
      return {
        success: false,
        error: `Failed to fetch analytics (${response.status})`,
      };
    }
  }

  try {
    const data = await response.json();
    return {
      success: true,
      analytics: data.analytics,
    };
  } catch {
    return {
      success: false,
      error: 'Failed to parse analytics response',
    };
  }
}