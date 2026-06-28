import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function PATCH(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  return NextResponse.json(await updateSettings(body as never));
}
