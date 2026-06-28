"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { DietMark } from "@/components/ui/DietMark";
import { useCart } from "@/lib/cart-context";
import { cn, formatINR } from "@/lib/utils";
import type { RestaurantSettings } from "@/lib/types";

export function CartDrawer({ settings }: { settings: RestaurantSettings }) {
  const { isOpen, closeCart, lines, setQty, subtotal, count } = useCart();
  const belowMin = subtotal > 0 && subtotal < settings.minOrder;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={closeCart} />

          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-pop"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-line bg-paper px-5 py-4">
              <h2 className="font-display text-xl font-semibold">Your order</h2>
              <button
                type="button"
                onClick={closeCart}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {count === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-paper text-4xl shadow-soft">
                  🍽️
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-ink">Your thali is empty</p>
                  <p className="mt-1 text-sm text-muted">Add some dishes to get started.</p>
                </div>
                <Link href="/menu" onClick={closeCart} className="btn-primary">
                  Browse the menu
                </Link>
              </div>
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {lines.map((l) => (
                  <div key={l.item.id} className="flex gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-saffron-50 to-terracotta-50 text-2xl">
                      {l.item.emoji ?? "🍽️"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <DietMark veg={l.item.isVeg} />
                        <p className="truncate font-medium text-ink">{l.item.name}</p>
                      </div>
                      {l.note && <p className="truncate text-xs text-muted">“{l.note}”</p>}
                      <p className="text-sm text-muted">{formatINR(l.item.price)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <QtyStepper
                        size="sm"
                        value={l.qty}
                        removable
                        onDec={() => setQty(l.item.id, l.qty - 1)}
                        onInc={() => setQty(l.item.id, l.qty + 1)}
                      />
                      <span className="text-sm font-semibold text-ink">
                        {formatINR(l.item.price * l.qty)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {count > 0 && (
              <div className="border-t border-line bg-paper px-5 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-semibold text-ink">{formatINR(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">Delivery &amp; taxes calculated at checkout.</p>
                {belowMin && (
                  <p className="mt-2 rounded-xl bg-saffron-50 px-3 py-2 text-xs text-bronze">
                    Add {formatINR(settings.minOrder - subtotal)} more to reach the minimum order
                    of {formatINR(settings.minOrder)}.
                  </p>
                )}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className={cn("btn-primary mt-3 w-full", belowMin && "pointer-events-none opacity-50")}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Proceed to checkout · {formatINR(subtotal)}
                </Link>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
