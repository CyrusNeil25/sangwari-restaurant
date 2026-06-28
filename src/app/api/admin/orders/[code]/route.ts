import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/data";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PAID"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const b = body as Record<string, unknown>;
  const patch: { status?: OrderStatus; paymentStatus?: PaymentStatus } = {};

  if (b.status) {
    if (!STATUSES.includes(b.status as OrderStatus))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    patch.status = b.status as OrderStatus;
  }
  if (b.paymentStatus) {
    if (!PAYMENT_STATUSES.includes(b.paymentStatus as PaymentStatus))
      return NextResponse.json({ error: "Invalid paymentStatus" }, { status: 400 });
    patch.paymentStatus = b.paymentStatus as PaymentStatus;
  }

  const updated = await updateOrder(code.toUpperCase(), patch);
  if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(updated);
}
