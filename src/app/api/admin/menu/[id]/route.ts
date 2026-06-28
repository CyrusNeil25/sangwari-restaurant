import { NextResponse } from "next/server";
import { deleteMenuItem, getMenuItemById, toggleItemAvailability, upsertMenuItem } from "@/lib/data";
import type { MenuItem } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }
  const b = body as Record<string, unknown>;

  if (b.toggleAvailability) {
    const item = await toggleItemAvailability(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  }

  const existing = await getMenuItemById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated: MenuItem = { ...existing, ...(b as Partial<MenuItem>), id };
  return NextResponse.json(await upsertMenuItem(updated));
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteMenuItem(id);
  return NextResponse.json({ ok: true });
}
