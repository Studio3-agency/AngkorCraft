import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Service-role Supabase client. Bypasses Row-Level Security — use ONLY on the
 * server, and always after verifying the caller's identity/role.
 */
export const supabaseAdmin = createClient(
  env.supabaseUrl || 'https://placeholder.supabase.co',
  env.supabaseServiceRoleKey || 'placeholder',
  { auth: { autoRefreshToken: false, persistSession: false } },
);
