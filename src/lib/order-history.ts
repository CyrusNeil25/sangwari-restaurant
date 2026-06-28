/**
 * Lightweight localStorage-based order history.
 * Stores the last N order codes so the customer can always get back to
 * their tracking page — no account needed.
 */

const KEY = "sangwari-orders-v1";
const MAX = 5; // keep the last 5 orders

export function saveOrderCode(code: string) {
  try {
    const existing = getOrderCodes();
    const updated = [code, ...existing.filter((c) => c !== code)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch { /* storage unavailable */ }
}

export function getOrderCodes(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function clearOrderCode(code: string) {
  try {
    const updated = getOrderCodes().filter((c) => c !== code);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}
