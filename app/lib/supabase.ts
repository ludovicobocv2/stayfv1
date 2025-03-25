import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../types/supabase';

let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;

export const createClient = () => {
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClientComponentClient<Database>({
        options: {
          realtime: {
            params: {
              eventsPerSecond: 2
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro ao criar cliente Supabase:', error);
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        return createClient();
      }
    }
  }
  return supabaseInstance;
}; 