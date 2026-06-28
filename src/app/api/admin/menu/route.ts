import { NextResponse } from "next/server";
import { getMenuItems, upsertMenuItem } from "@/lib/data";
import type { MenuItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getMenuItems());
}

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const b = body as Partial<MenuItem>;
  if (!b.name?.trim() || !b.categoryId || typeof b.price !== "number") {
    return NextResponse.json({ error: "name, categoryId and price are required." }, { status: 400 });
  }
  const item: MenuItem = {
    id: b.id?.trim() || `item-${Date.now()}`,
    categoryId: b.categoryId,
    name: b.name.trim(),
    description: b.description?.trim() ?? "",
    price: Math.max(0, Math.round(b.price)),
    emoji: b.emoji?.trim() || undefined,
    isVeg: b.isVeg ?? true,
    isAvailable: b.isAvailable ?? true,
    spiceLevel: b.spiceLevel,
    tags: b.tags,
    sortOrder: b.sortOrder,
  };
  return NextResponse.json(await upsertMenuItem(item));
}
