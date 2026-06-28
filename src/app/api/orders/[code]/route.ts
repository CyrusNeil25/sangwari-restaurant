import { NextResponse } from "next/server";
import { getOrderByCode } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const order = await getOrderByCode(code.toUpperCase());
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Return only the fields the customer needs — don't expose admin info
  return NextResponse.json({
    code: order.code,
    status: order.status,
    paymentStatus: order.paymentStatus,
    type: order.type,
    total: order.total,
    items: order.items,
    createdAt: order.createdAt,
  });
}
