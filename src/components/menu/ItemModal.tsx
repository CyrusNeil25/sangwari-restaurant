"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { DietMark } from "@/components/ui/DietMark";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { SpiceMeter } from "./SpiceMeter";
import { TagBadge } from "./TagBadge";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

export function ItemModal({
  item,
  onClose,
}: {
  item: MenuItem | null;
  onClose: () => void;
}) {
  const { lines, add, setQty, openCart } = useCart();
  const current = item ? lines.find((l) => l.item.id === item.id)?.qty ?? 0 : 0;
  const [qty, setLocalQty] = useState(1);
  const [note, setNote] = useState("");

  // Reset the picker each time a new item opens.
  useEffect(() => {
    if (item) {
      setLocalQty(Math.max(current, 1));
      setNote("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  // Esc to close + lock background scroll while open.
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  function confirm() {
    if (!item) return;
    if (current > 0) setQty(item.id, qty);
    else add(item, qty, note.trim() || undefined);
    onClose();
    openCart();
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="card relative z-10 w-full max-w-lg overflow-hidden rounded-b-none sm:rounded-3xl"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* Banner */}
            <div className="relative grid h-40 place-items-center bg-gradient-to-br from-saffron-50 to-terracotta-50">
              <span className="text-7xl">{item.emoji ?? "🍽️"}</span>
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-paper/90 text-ink shadow-soft hover:bg-paper"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[55vh] overflow-y-auto p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <DietMark veg={item.isVeg} />
                {item.tags?.map((t) => (
                  <TagBadge key={t} tag={t} />
                ))}
              </div>
              <h2 className="font-display text-2xl font-semibold text-ink">{item.name}</h2>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-lg font-semibold text-ink">{formatINR(item.price)}</span>
                <SpiceMeter level={item.spiceLevel} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>

              <label className="mt-4 block">
                <span className="text-sm font-medium text-ink">Special instructions</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. less spicy, no onion…"
                  rows={2}
                  className="mt-1.5 w-full resize-none rounded-2xl border border-line bg-cream/50 px-3 py-2 text-sm outline-none focus:border-terracotta"
                />
              </label>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 border-t border-line bg-paper p-4">
              <QtyStepper
                value={qty}
                onDec={() => setLocalQty((q) => Math.max(1, q - 1))}
                onInc={() => setLocalQty((q) => q + 1)}
              />
              <button
                type="button"
                disabled={!item.isAvailable}
                onClick={confirm}
                className="btn-primary flex-1"
              >
                {item.isAvailable
                  ? `${current > 0 ? "Update" : "Add"} · ${formatINR(item.price * qty)}`
                  : "Sold out"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
