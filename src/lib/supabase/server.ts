import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service-role key.
 * Bypasses RLS — only use in API routes and server components.
 * NEVER import this from client components.
 */
export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
