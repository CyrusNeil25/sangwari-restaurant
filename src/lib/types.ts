export type OrderType = "delivery" | "takeaway" | "dinein";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID";
export type PaymentMethod = "upi" | "cod"; // cod = cash on delivery

export interface Category {
  id: string;
  name: string;
  emoji?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number; // rupees
  emoji?: string; // used for the placeholder tile when no image
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  spiceLevel?: 0 | 1 | 2 | 3;
  tags?: string[]; // "bestseller" | "chef-special" | "local"
  sortOrder?: number;
}

export interface CartLine {
  item: MenuItem;
  qty: number;
  note?: string;
}

export interface RestaurantSettings {
  name: string;
  tagline?: string;
  welcome?: string; // short local greeting shown on hero
  upiId: string;
  upiName: string;
  whatsappNumber: string; // digits only incl. country code, e.g. 919876543210
  phoneDisplay?: string;
  address: string;
  mapUrl?: string;
  hours: string;
  isOpen: boolean;
  deliveryFee: number;
  minOrder: number;
  taxPercent: number;
  instagram?: string;
}

export interface OrderLine {
  itemId: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
}

export interface Order {
  code: string;
  type: OrderType;
  customerName: string;
  customerPhone: string;
  address?: string;
  tableNumber?: string;
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

/** What the client sends to POST /api/orders. Prices are NOT trusted — the
 *  server recomputes everything from the menu. */
export interface CreateOrderInput {
  type: OrderType;
  customerName: string;
  customerPhone: string;
  address?: string;
  tableNumber?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  items: { itemId: string; qty: number; note?: string }[];
}
