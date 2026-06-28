import type { OrderType, RestaurantSettings } from "./types";
import { formatINR, orderTypeLabel } from "./utils";

export interface OrderMessageInput {
  settings: Pick<RestaurantSettings, "name" | "upiId">;
  code: string;
  type: OrderType;
  name: string;
  phone: string;
  address?: string;
  table?: string;
  lines: { name: string; qty: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  notes?: string;
}

/** Readable WhatsApp message (uses *bold* markup that WhatsApp renders). */
export function buildOrderMessage(o: OrderMessageInput): string {
  const L: string[] = [];
  L.push(`*New order at ${o.settings.name}* 🧾`);
  L.push(`Order *#${o.code}*  •  ${orderTypeLabel(o.type)}`);
  L.push("");
  for (const line of o.lines) {
    L.push(`• ${line.qty} × ${line.name} — ${formatINR(line.price * line.qty)}`);
  }
  L.push("");
  L.push(`Subtotal: ${formatINR(o.subtotal)}`);
  if (o.deliveryFee) L.push(`Delivery: ${formatINR(o.deliveryFee)}`);
  if (o.tax) L.push(`Taxes: ${formatINR(o.tax)}`);
  L.push(`*Total: ${formatINR(o.total)}*`);
  L.push("");
  L.push(`*Customer:* ${o.name}`);
  L.push(`*Phone:* ${o.phone}`);
  if (o.type === "delivery" && o.address) L.push(`*Address:* ${o.address}`);
  if (o.type === "dinein" && o.table) L.push(`*Table:* ${o.table}`);
  if (o.notes) L.push(`*Note:* ${o.notes}`);
  L.push("");
  L.push(`I'll pay ${formatINR(o.total)} via UPI (${o.settings.upiId}). Please confirm. 🙏`);
  return L.join("\n");
}

/** Build a wa.me click-to-chat link with the message pre-filled. */
export function waLink(whatsappNumber: string, text: string) {
  const num = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/**
 * Status-specific update messages the admin sends to the customer.
 * Each is short, friendly, and includes the order code for reference.
 */
export function buildStatusMessage(
  restaurantName: string,
  order: { code: string; status: string; type: string; customerName: string; total: number },
): string {
  const name = order.customerName.split(" ")[0]; // first name only
  const ref = `Order #${order.code}`;
  const r = restaurantName;

  const map: Record<string, string> = {
    PENDING: `Hi ${name}! We received your ${ref} at ${r}. Please complete the UPI payment of ${formatINR(order.total)} so we can start preparing. 🙏`,
    CONFIRMED: `Hi ${name}! ✅ Your ${ref} at ${r} is confirmed and we're getting started. Thank you for your payment!`,
    PREPARING: `Hi ${name}! 👨‍🍳 Your ${ref} is being prepared fresh right now. Sit tight!`,
    READY: `Hi ${name}! 🔔 Your ${ref} is ready for pickup at ${r}. Please come collect it!`,
    OUT_FOR_DELIVERY: `Hi ${name}! 🛵 Your ${ref} is on its way! Our delivery partner will reach you shortly.`,
    COMPLETED: `Hi ${name}! 🎉 Your ${ref} has been delivered. We hope you enjoy your meal! Do visit us again at ${r}. 🙏`,
    CANCELLED: `Hi ${name}, we regret to inform you that your ${ref} at ${r} has been cancelled. Please call us for assistance.`,
  };

  return map[order.status] ?? `Hi ${name}, update on your ${ref} at ${r}: ${order.status}.`;
}
