import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ypwnmocyzqwhbfptteql.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Erw40_uRIk9yvz-nH-L8rQ_7vzIrCIA';

  return createBrowserClient(url, anonKey);
}
