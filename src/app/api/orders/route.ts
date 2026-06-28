import { NextResponse } from "next/server";
import { createOrder } from "@/lib/data";
import type { OrderType, PaymentMethod } from "@/lib/types";

const PAYMENT_METHODS: PaymentMethod[] = ["upi", "cod"];

const ORDER_TYPES: OrderType[] = ["delivery", "takeaway", "dinein"];

function str(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  if (!ORDER_TYPES.includes(b.type as OrderType)) {
    return NextResponse.json({ error: "Please choose a valid order type." }, { status: 400 });
  }

  const name = str(b.customerName, 80);
  const phone = str(b.customerPhone, 20);
  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Please enter a valid 10-digit phone number." }, { status: 400 });
  }

  const type = b.type as OrderType;
  if (type === "delivery" && str(b.address, 300).length < 6) {
    return NextResponse.json({ error: "Please enter a delivery address." }, { status: 400 });
  }
  if (type === "dinein" && !str(b.tableNumber, 10)) {
    return NextResponse.json({ error: "Please enter your table number." }, { status: 400 });
  }

  const rawItems = Array.isArray(b.items) ? b.items : [];
  const items = rawItems
    .map((i) => {
      const it = i as Record<string, unknown>;
      return {
        itemId: str(it.itemId, 60),
        qty: Number(it.qty) || 1,
        note: it.note ? str(it.note, 200) : undefined,
      };
    })
    .filter((i) => i.itemId);

  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  try {
    const pm = b.paymentMethod as PaymentMethod;
    const paymentMethod = type === "delivery" && PAYMENT_METHODS.includes(pm) ? pm : "upi";

    const order = await createOrder({
      type,
      customerName: name,
      customerPhone: phone,
      address: type === "delivery" ? str(b.address, 300) : undefined,
      tableNumber: type === "dinein" ? str(b.tableNumber, 10) : undefined,
      notes: str(b.notes, 300) || undefined,
      paymentMethod,
      items,
    });
    return NextResponse.json({ code: order.code, total: order.total });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not place the order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
