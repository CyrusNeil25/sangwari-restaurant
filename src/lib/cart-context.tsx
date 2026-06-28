"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine, MenuItem } from "./types";

const STORAGE_KEY = "sangwari-cart-v1";

interface CartState {
  lines: CartLine[];
  tableNumber: string | null;
  hydrated: boolean;
  isOpen: boolean;
  count: number;
  subtotal: number;
  add: (item: MenuItem, qty?: number, note?: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  setTableNumber: (t: string | null) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.lines)) setLines(data.lines);
        if (typeof data.tableNumber === "string") setTableNumber(data.tableNumber);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, tableNumber }));
  }, [lines, tableNumber, hydrated]);

  const add = useCallback((item: MenuItem, qty = 1, note?: string) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.item.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty, note: note ?? next[idx].note };
        return next;
      }
      return [...prev, { item, qty, note }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.item.id !== id)
        : prev.map((l) => (l.item.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback(
    (id: string) => setLines((prev) => prev.filter((l) => l.item.id !== id)),
    [],
  );
  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.qty * l.item.price, 0),
    [lines],
  );

  const value: CartState = {
    lines,
    tableNumber,
    hydrated,
    isOpen,
    count,
    subtotal,
    add,
    setQty,
    remove,
    clear,
    setTableNumber,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
