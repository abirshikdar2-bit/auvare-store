import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Public Supabase client for static storefront rendering (ISR)
// Does NOT touch cookies(), allowing Next.js to pre-render and cache pages on Vercel Edge CDN
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ypwnmocyzqwhbfptteql.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Erw40_uRIk9yvz-nH-L8rQ_7vzIrCIA';

  return createSupabaseClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
