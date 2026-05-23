import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./info";

// Singleton Supabase client instance
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
          storageKey: 'tubelab-auth-token',
        },
      }
    );
  }
  return supabaseClient;
}