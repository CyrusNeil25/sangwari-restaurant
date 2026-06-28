import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a rupee amount, e.g. 1234 -> "₹1,234". */
export function formatINR(n: number) {
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

/** Human-friendly short order code, e.g. "A1B2". */
export function generateOrderCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  delivery: "Delivery",
  takeaway: "Takeaway",
  dinein: "Dine-in",
};
export function orderTypeLabel(t: string) {
  return ORDER_TYPE_LABELS[t] ?? t;
}
