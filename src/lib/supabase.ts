import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for authenticated users (with RLS)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Admin client for server-side operations (bypasses RLS) - only available on server
export const supabaseAdmin = serviceRoleKey 
  ? createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey
    )
  : null;