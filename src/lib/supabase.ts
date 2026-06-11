import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export function createServerClient(cookies: { get: (name: string) => string | undefined }) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        Cookie: Object.entries({
          'sb-access-token': cookies.get('sb-access-token'),
          'sb-refresh-token': cookies.get('sb-refresh-token'),
        })
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}=${v}`)
          .join('; '),
      },
    },
  });
}
