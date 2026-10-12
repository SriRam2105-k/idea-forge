import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Public Supabase client — safe to use in browser.
 * Only has access to data permitted by RLS policies (anon role).
 * Use this for public reads (published problems, settings).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
