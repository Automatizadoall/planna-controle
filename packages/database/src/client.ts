import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types/database.types'

// Type for Supabase client
export type SupabaseClient = ReturnType<typeof createSupabaseClient<Database>>

// Create Supabase client for server-side use
export function createClient(supabaseUrl: string, supabaseKey: string): SupabaseClient {
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  })
}

// Create Supabase client with service role (admin operations)
export function createServiceClient(
  supabaseUrl: string,
  supabaseServiceKey: string
): SupabaseClient {
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

