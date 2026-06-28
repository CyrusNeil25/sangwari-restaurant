import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server component / server action Supabase client that reads+writes cookies.
 * Use this (not the service-role client) for auth checks in server components.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — cookies can't be set here.
            // The middleware will refresh the session.
          }
        },
      },
    },
  );
}
