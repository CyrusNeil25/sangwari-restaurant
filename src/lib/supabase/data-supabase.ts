/**
 * Supabase implementation of the data-access layer.
 * Shapes match data.ts exactly — callers don't need to change.
 * Only imported when NEXT_PUBLIC_SUPABASE_URL is set.
 */
import { createServerClient } from "./server";
import type {
  Category,
  CreateOrderInput,
  MenuItem,
  Order,
  OrderLine,
  OrderStatus,
  PaymentStatus,
  RestaurantSettings,
} from "@/lib/types";
import { generateOrderCode } from "@/lib/utils";

function db() {
  return createServerClient();
}

/* ---- Row → domain type mappers -------------------------------- */

function rowToSettings(r: Record<string, unknown>): RestaurantSettings {
  return {
    name: r.name as string,
    tagline: r.tagline as string | undefined,
    welcome: r.welcome as string | undefined,
    upiId: r.upi_id as string,
    upiName: r.upi_name as string,
    whatsappNumber: r.whatsapp_number as string,
    phoneDisplay: r.phone_display as string | undefined,
    address: r.address as string,
    mapUrl: r.map_url as string | undefined,
    hours: r.hours as string,
    isOpen: r.is_open as boolean,
    deliveryFee: r.delivery_fee as number,
    minOrder: r.min_order as number,
    taxPercent: r.tax_percent as number,
    instagram: r.instagram as string | undefined,
  };
}

function rowToCategory(r: Record<string, unknown>): Category {
  return {
    id: r.id as string,
    name: r.name as string,
    emoji: r.emoji as string | undefined,
    sortOrder: r.sort_order as number,
    isActive: r.is_active as boolean,
  };
}

function rowToMenuItem(r: Record<string, unknown>): MenuItem {
  return {
    id: r.id as string,
    categoryId: r.category_id as string,
    name: r.name as string,
    description: r.description as string,
    price: r.price as number,
    emoji: r.emoji as string | undefined,
    image: r.image_url as string | undefined,
    isVeg: r.is_veg as boolean,
    isAvailable: r.is_available as boolean,
    spiceLevel: r.spice_level as 0 | 1 | 2 | 3 | undefined,
    tags: r.tags as string[] | undefined,
    sortOrder: r.sort_order as number | undefined,
  };
}

function rowToOrder(
  r: Record<string, unknown>,
  items: OrderLine[],
): Order {
  return {
    code: r.code as string,
    type: r.type as Order["type"],
    customerName: r.customer_name as string,
    customerPhone: r.customer_phone as string,
    address: r.address as string | undefined,
    tableNumber: r.table_number as string | undefined,
    items,
    subtotal: r.subtotal as number,
    deliveryFee: r.delivery_fee as number,
    tax: r.tax as number,
    total: r.total as number,
    status: r.status as OrderStatus,
    paymentStatus: r.payment_status as PaymentStatus,
    notes: r.notes as string | undefined,
    createdAt: r.created_at as string,
  };
}

function rowToOrderLine(r: Record<string, unknown>): OrderLine {
  return {
    itemId: r.item_id as string,
    name: r.name as string,
    price: r.price as number,
    qty: r.qty as number,
    note: r.note as string | undefined,
  };
}

/* ---- Settings ------------------------------------------------- */

export async function getSettings(): Promise<RestaurantSettings> {
  const { data, error } = await db()
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error || !data) throw new Error("Settings not found");
  return rowToSettings(data as Record<string, unknown>);
}

export async function updateSettings(
  patch: Partial<RestaurantSettings>,
): Promise<RestaurantSettings> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined)            dbPatch.name = patch.name;
  if (patch.tagline !== undefined)         dbPatch.tagline = patch.tagline;
  if (patch.welcome !== undefined)         dbPatch.welcome = patch.welcome;
  if (patch.upiId !== undefined)           dbPatch.upi_id = patch.upiId;
  if (patch.upiName !== undefined)         dbPatch.upi_name = patch.upiName;
  if (patch.whatsappNumber !== undefined)  dbPatch.whatsapp_number = patch.whatsappNumber;
  if (patch.phoneDisplay !== undefined)    dbPatch.phone_display = patch.phoneDisplay;
  if (patch.address !== undefined)         dbPatch.address = patch.address;
  if (patch.mapUrl !== undefined)          dbPatch.map_url = patch.mapUrl;
  if (patch.hours !== undefined)           dbPatch.hours = patch.hours;
  if (patch.isOpen !== undefined)          dbPatch.is_open = patch.isOpen;
  if (patch.deliveryFee !== undefined)     dbPatch.delivery_fee = patch.deliveryFee;
  if (patch.minOrder !== undefined)        dbPatch.min_order = patch.minOrder;
  if (patch.taxPercent !== undefined)      dbPatch.tax_percent = patch.taxPercent;
  if (patch.instagram !== undefined)       dbPatch.instagram = patch.instagram;

  const { data, error } = await db()
    .from("settings")
    .update(dbPatch)
    .eq("id", 1)
    .select()
    .single();
  if (error || !data) throw new Error("Failed to update settings");
  return rowToSettings(data as Record<string, unknown>);
}

/* ---- Categories ----------------------------------------------- */

export async function getCategories(): Promise<Category[]> {
  const { data } = await db()
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []).map((r) => rowToCategory(r as Record<string, unknown>));
}

export async function getAllCategories(): Promise<Category[]> {
  const { data } = await db()
    .from("categories")
    .select("*")
    .order("sort_order");
  return (data ?? []).map((r) => rowToCategory(r as Record<string, unknown>));
}

/* ---- Menu items ----------------------------------------------- */

export async function getMenuItems(): Promise<MenuItem[]> {
  const { data } = await db()
    .from("menu_items")
    .select("*")
    .order("sort_order");
  return (data ?? []).map((r) => rowToMenuItem(r as Record<string, unknown>));
}

export async function getMenuItemById(id: string): Promise<MenuItem | undefined> {
  const { data } = await db()
    .from("menu_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? rowToMenuItem(data as Record<string, unknown>) : undefined;
}

export async function upsertMenuItem(item: MenuItem): Promise<MenuItem> {
  const row = {
    id: item.id,
    category_id: item.categoryId,
    name: item.name,
    description: item.description,
    price: item.price,
    emoji: item.emoji ?? null,
    is_veg: item.isVeg,
    is_available: item.isAvailable,
    spice_level: item.spiceLevel ?? null,
    tags: item.tags ?? [],
    sort_order: item.sortOrder ?? 0,
  };
  const { data, error } = await db()
    .from("menu_items")
    .upsert(row)
    .select()
    .single();
  if (error || !data) throw new Error("Failed to save menu item");
  return rowToMenuItem(data as Record<string, unknown>);
}

export async function deleteMenuItem(id: string): Promise<void> {
  await db().from("menu_items").delete().eq("id", id);
}

export async function toggleItemAvailability(id: string): Promise<MenuItem | undefined> {
  const item = await getMenuItemById(id);
  if (!item) return undefined;
  return upsertMenuItem({ ...item, isAvailable: !item.isAvailable });
}

/* ---- Orders --------------------------------------------------- */

async function fetchOrderLines(code: string): Promise<OrderLine[]> {
  const { data } = await db()
    .from("order_items")
    .select("*")
    .eq("order_code", code);
  return (data ?? []).map((r) => rowToOrderLine(r as Record<string, unknown>));
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const supabase = db();

  // Recompute from DB prices — never trust the client.
  const lines: OrderLine[] = [];
  for (const it of input.items) {
    const mi = await getMenuItemById(it.itemId);
    if (!mi || !mi.isAvailable) continue;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 1)));
    lines.push({ itemId: mi.id, name: mi.name, price: mi.price, qty, note: it.note });
  }
  if (lines.length === 0) throw new Error("Your cart is empty or items are unavailable.");

  const settings = await getSettings();
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  if (input.type === "delivery" && subtotal < settings.minOrder) {
    throw new Error(`Minimum order for delivery is ₹${settings.minOrder}.`);
  }
  const deliveryFee = input.type === "delivery" ? settings.deliveryFee : 0;
  const tax = Math.round((subtotal * settings.taxPercent) / 100);
  const total = subtotal + deliveryFee + tax;

  // Unique code with collision retry
  let code = generateOrderCode();
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase.from("orders").select("code").eq("code", code).maybeSingle();
    if (!data) break;
    code = generateOrderCode();
  }

  const { error: orderErr } = await supabase.from("orders").insert({
    code,
    type: input.type,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    address: input.address ?? null,
    table_number: input.tableNumber ?? null,
    subtotal,
    delivery_fee: deliveryFee,
    tax,
    total,
    notes: input.notes ?? null,
  });
  if (orderErr) throw new Error("Failed to create order.");

  const { error: itemErr } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_code: code,
      item_id: l.itemId,
      name: l.name,
      price: l.price,
      qty: l.qty,
      note: l.note ?? null,
    })),
  );
  if (itemErr) throw new Error("Failed to save order items.");

  const { data: row } = await supabase
    .from("orders")
    .select("*")
    .eq("code", code)
    .single();
  return rowToOrder(row as Record<string, unknown>, lines);
}

export async function getOrderByCode(code: string): Promise<Order | undefined> {
  const { data } = await db()
    .from("orders")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();
  if (!data) return undefined;
  const lines = await fetchOrderLines(code.toUpperCase());
  return rowToOrder(data as Record<string, unknown>, lines);
}

export async function getOrders(): Promise<Order[]> {
  const { data: rows } = await db()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (!rows?.length) return [];

  const codes = rows.map((r) => (r as Record<string, unknown>).code as string);
  const { data: itemRows } = await db()
    .from("order_items")
    .select("*")
    .in("order_code", codes);

  const linesByCode = new Map<string, OrderLine[]>();
  for (const ir of itemRows ?? []) {
    const r = ir as Record<string, unknown>;
    const c = r.order_code as string;
    if (!linesByCode.has(c)) linesByCode.set(c, []);
    linesByCode.get(c)!.push(rowToOrderLine(r));
  }

  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    const c = row.code as string;
    return rowToOrder(row, linesByCode.get(c) ?? []);
  });
}

export async function updateOrder(
  code: string,
  patch: { status?: OrderStatus; paymentStatus?: PaymentStatus },
): Promise<Order | undefined> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.status)        dbPatch.status = patch.status;
  if (patch.paymentStatus) dbPatch.payment_status = patch.paymentStatus;

  const { data } = await db()
    .from("orders")
    .update(dbPatch)
    .eq("code", code.toUpperCase())
    .select()
    .single();
  if (!data) return undefined;
  const lines = await fetchOrderLines(code.toUpperCase());
  return rowToOrder(data as Record<string, unknown>, lines);
}
