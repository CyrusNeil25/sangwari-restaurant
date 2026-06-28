import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const USE_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
  // Without Supabase (local dev) or screenshot mode — admin is open.
  if (!USE_SUPABASE) return NextResponse.next();

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session (keeps token alive).
  const { data: { user } } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && !user) {
    // Not logged in → redirect to login, remember where they were going.
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && user) {
    // Already logged in → send to admin home.
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
