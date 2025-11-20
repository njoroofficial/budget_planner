/**
 * Supabase Client Utilities
 * Provides configured Supabase clients for browser and server environments
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

/**
 * Browser/Client-side Supabase client
 * Use this in client components and hooks
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Create a Supabase client for use in Server Components
 * This should be called per-request to ensure proper auth context
 */
export function createServerClient() {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

/**
 * Helper function to get the current user ID
 * For personal use without authentication, returns a fixed user ID from environment
 * 
 * Note: This is a simplified approach for personal applications.
 * For multi-user applications, implement proper authentication.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const userId = process.env.NEXT_PUBLIC_USER_ID;
  
  if (!userId) {
    console.error('NEXT_PUBLIC_USER_ID not set in environment variables');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));
    return null;
  }
  
  console.log('Retrieved user ID:', userId);
  return userId;
}

/**
 * Helper function to ensure user is authenticated
 * Throws error if no user is found
 * 
 * Note: For personal use, this just ensures the user ID is configured
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User ID not configured. Please set NEXT_PUBLIC_USER_ID in your .env.local file.');
  }
  
  return userId;
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}
