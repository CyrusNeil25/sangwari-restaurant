import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth";

export async function POST() {
  const USE_SUPABASE =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (USE_SUPABASE) {
    const supabase = await createAuthClient();
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(
    new URL("/admin/login", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
    { status: 302 },
  );
}
