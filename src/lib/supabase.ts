import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      '缺少 Supabase 环境变量：请检查 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
  }
  return createClient(supabaseUrl, supabaseKey);
}
