import type { RestaurantSettings } from "./types";

/**
 * Build a UPI deep link / QR payload with the exact amount pre-filled.
 * Format: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR&tn=<note>
 * Any UPI app (GPay, PhonePe, Paytm…) can scan/open it.
 */
export function buildUpiUri(
  settings: Pick<RestaurantSettings, "upiId" | "upiName">,
  amount: number,
  note: string,
) {
  const parts = [
    `pa=${encodeURIComponent(settings.upiId)}`,
    `pn=${encodeURIComponent(settings.upiName)}`,
    `am=${amount.toFixed(2)}`,
    `cu=INR`,
    `tn=${encodeURIComponent(note)}`,
  ];
  return `upi://pay?${parts.join("&")}`;
}
