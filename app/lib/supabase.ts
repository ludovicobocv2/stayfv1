import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../types/supabase';

let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>();
  }
  return supabaseInstance;
}; 