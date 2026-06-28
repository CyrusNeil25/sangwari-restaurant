/**
 * Data-access layer — single import point for the whole app.
 *
 * When NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set,
 * all functions delegate to the Supabase implementation.
 * Otherwise they use the in-memory mock (great for local dev without a DB).
 */

import {
  categories as mockCategories,
  menuItems as mockMenu,
  settings as mockSettings,
} from "./mock-data";
import type {
  Category,
  CreateOrderInput,
  MenuItem,
  Order,
  OrderLine,
  OrderStatus,
  PaymentStatus,
  RestaurantSettings,
} from "./types";
import { generateOrderCode } from "./utils";

const USE_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

/* ---- Lazy-load Supabase implementation ----------------------- */
// We use a dynamic require so the Supabase SDK is never bundled or executed
// when the env vars are absent (keeps dev fast and avoids import errors).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sb(): any {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./supabase/data-supabase");
}

/* ============================================================== */
/* Settings                                                        */
/* ============================================================== */

export async function getSettings(): Promise<RestaurantSettings> {
  if (USE_SUPABASE) return sb().getSettings();
  return { ...settingsStore.v };
}

export async function updateSettings(
  patch: Partial<RestaurantSettings>,
): Promise<RestaurantSettings> {
  if (USE_SUPABASE) return sb().updateSettings(patch);
  settingsStore.v = { ...settingsStore.v, ...patch };
  g.__sangwariSettings = settingsStore.v;
  return { ...settingsStore.v };
}

/* ============================================================== */
/* Categories                                                      */
/* ============================================================== */

export async function getCategories(): Promise<Category[]> {
  if (USE_SUPABASE) return sb().getCategories();
  return [...catStore].filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAllCategories(): Promise<Category[]> {
  if (USE_SUPABASE) return sb().getAllCategories();
  return [...catStore].sort((a, b) => a.sortOrder - b.sortOrder);
}

/* ============================================================== */
/* Menu items                                                      */
/* ============================================================== */

export async function getMenuItems(): Promise<MenuItem[]> {
  if (USE_SUPABASE) return sb().getMenuItems();
  return [...menuStore].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getMenuItemById(id: string): Promise<MenuItem | undefined> {
  if (USE_SUPABASE) return sb().getMenuItemById(id);
  return menuStore.find((m) => m.id === id);
}

export async function upsertMenuItem(item: MenuItem): Promise<MenuItem> {
  if (USE_SUPABASE) return sb().upsertMenuItem(item);
  const idx = menuStore.findIndex((m) => m.id === item.id);
  if (idx >= 0) menuStore[idx] = item;
  else menuStore.push(item);
  return item;
}

export async function deleteMenuItem(id: string): Promise<void> {
  if (USE_SUPABASE) return sb().deleteMenuItem(id);
  const idx = menuStore.findIndex((m) => m.id === id);
  if (idx >= 0) menuStore.splice(idx, 1);
}

export async function toggleItemAvailability(id: string): Promise<MenuItem | undefined> {
  if (USE_SUPABASE) return sb().toggleItemAvailability(id);
  const item = menuStore.find((m) => m.id === id);
  if (!item) return undefined;
  item.isAvailable = !item.isAvailable;
  return item;
}

/* ============================================================== */
/* Orders                                                          */
/* ============================================================== */

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (USE_SUPABASE) return sb().createOrder(input);
  return _mockCreateOrder(input);
}

export async function getOrderByCode(code: string): Promise<Order | undefined> {
  if (USE_SUPABASE) return sb().getOrderByCode(code);
  return orderStore.get(code.toUpperCase());
}

export async function getOrders(): Promise<Order[]> {
  if (USE_SUPABASE) return sb().getOrders();
  return [...orderStore.values()].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function updateOrder(
  code: string,
  patch: { status?: OrderStatus; paymentStatus?: PaymentStatus },
): Promise<Order | undefined> {
  if (USE_SUPABASE) return sb().updateOrder(code, patch);
  const order = orderStore.get(code.toUpperCase());
  if (!order) return undefined;
  if (patch.status) order.status = patch.status;
  if (patch.paymentStatus) order.paymentStatus = patch.paymentStatus;
  orderStore.set(order.code, order);
  return order;
}

/* ============================================================== */
/* In-memory mock stores (used when USE_SUPABASE is false)        */
/* ============================================================== */

type G = {
  __sangwariSettings?: RestaurantSettings;
  __sangwariCategories?: Category[];
  __sangwariMenu?: MenuItem[];
  __sangwariOrders?: Map<string, Order>;
};
const g = globalThis as unknown as G;

const settingsStore: { v: RestaurantSettings } = {
  v: g.__sangwariSettings ?? { ...mockSettings },
};
const catStore: Category[] = (g.__sangwariCategories ??= [
  ...mockCategories.map((c) => ({ ...c })),
]);
const menuStore: MenuItem[] = (g.__sangwariMenu ??= [
  ...mockMenu.map((m) => ({ ...m })),
]);
const orderStore: Map<string, Order> = (g.__sangwariOrders ??= new Map());

async function _mockCreateOrder(input: CreateOrderInput): Promise<Order> {
  const lines: OrderLine[] = [];
  for (const it of input.items) {
    const mi = menuStore.find((m) => m.id === it.itemId);
    if (!mi || !mi.isAvailable) continue;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 1)));
    lines.push({ itemId: mi.id, name: mi.name, price: mi.price, qty, note: it.note });
  }
  if (lines.length === 0) throw new Error("Your cart is empty or items are unavailable.");

  const s = settingsStore.v;
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  if (input.type === "delivery" && subtotal < s.minOrder) {
    throw new Error(`Minimum order for delivery is ₹${s.minOrder}.`);
  }
  const deliveryFee = input.type === "delivery" ? s.deliveryFee : 0;
  const tax = Math.round((subtotal * s.taxPercent) / 100);
  const total = subtotal + deliveryFee + tax;

  // Auto-scale: after 5 misses at current length, add a character.
  let len = 4, attempts = 0;
  let code = generateOrderCode(len);
  while (orderStore.has(code)) {
    if (++attempts % 5 === 0) len++;
    code = generateOrderCode(len);
  }

  const order: Order = {
    code,
    type: input.type,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    address: input.address,
    tableNumber: input.tableNumber,
    items: lines,
    subtotal,
    deliveryFee,
    tax,
    total,
    status: "PENDING",
    paymentStatus: input.type === "delivery" && input.paymentMethod === "cod" ? "PAID" : "UNPAID",
    paymentMethod: input.paymentMethod ?? "upi",
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };
  orderStore.set(code, order);
  return order;
}
