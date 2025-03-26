import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient<Database> | null = null;

export const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createPagesBrowserClient<Database>();
  }
  return supabaseClient;
}; 