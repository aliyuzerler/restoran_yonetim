/**
 * Central Supabase client — single source of truth for Supabase connection.
 *
 * Uses NEXT_PUBLIC_ env vars (Next.js convention; the user spec mentions
 * VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY for Vite, but this project runs on
 * Next.js 16, so the equivalent is NEXT_PUBLIC_).
 *
 * CRITICAL: The service_role key must NEVER be imported here or anywhere in
 * frontend code. Only the anon key is safe for client-side use.
 *
 * Until Supabase credentials are provided, this module exports a null client
 * and the app falls back to the Prisma-based API routes (src/lib/db.ts +
 * src/lib/auth.ts). When credentials become available, set:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 * and the client will initialize automatically.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Lazily-created Supabase client. Returns null if not configured so callers
 * can gracefully fall back to the REST API layer.
 */
let _client: unknown = null;

export async function getSupabase() {
  if (!isSupabaseConfigured) return null;
  if (_client) return _client;
  // Dynamic import — avoids loading @supabase/supabase-js when not configured
  const { createClient } = await import("@supabase/supabase-js");
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _client;
}
