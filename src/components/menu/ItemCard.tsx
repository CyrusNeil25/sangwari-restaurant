"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DietMark } from "@/components/ui/DietMark";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { SpiceMeter } from "./SpiceMeter";
import { TagBadge } from "./TagBadge";
import { useCart } from "@/lib/cart-context";
import { cn, formatINR } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

export function ItemCard({
  item,
  onOpen,
}: {
  item: MenuItem;
  onOpen: (item: MenuItem) => void;
}) {
  const { lines, add, setQty } = useCart();
  const qty = lines.find((l) => l.item.id === item.id)?.qty ?? 0;
  const soldOut = !item.isAvailable;
  const [popping, setPopping] = useState(false);

  function handleAdd() {
    add(item);
    setPopping(true);
    setTimeout(() => setPopping(false), 400);
  }

  return (
    <article
      className={cn(
        "card flex gap-4 p-3 transition-shadow",
        soldOut ? "opacity-60" : "hover:shadow-card",
      )}
    >
      {/* Text */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-1 flex items-center gap-2">
          <DietMark veg={item.isVeg} />
          {item.tags?.map((t) => (
            <TagBadge key={t} tag={t} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => onOpen(item)}
          className="text-left"
        >
          <h3 className="font-display text-lg font-semibold leading-tight text-ink hover:text-terracotta">
            {item.name}
          </h3>
        </button>

        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-ink">{formatINR(item.price)}</span>
          <SpiceMeter level={item.spiceLevel} />
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{item.description}</p>
      </div>

      {/* Image tile + add control */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => onOpen(item)}
          className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-saffron-50 to-terracotta-50 ring-1 ring-line sm:h-28 sm:w-28"
          aria-label={`View ${item.name}`}
        >
          <span className="text-4xl sm:text-5xl">{item.emoji ?? "🍽️"}</span>
          {soldOut && (
            <span className="absolute inset-0 grid place-items-center bg-ink/45 text-xs font-bold uppercase tracking-wide text-white">
              Sold out
            </span>
          )}
        </button>

        <div className="w-24 sm:w-28">
          {soldOut ? (
            <div className="rounded-full border border-line py-2 text-center text-xs font-medium text-muted">
              Unavailable
            </div>
          ) : qty === 0 ? (
            <motion.button
              type="button"
              onClick={handleAdd}
              className="btn-primary btn-sm w-full"
              animate={popping ? { scale: [1, 1.18, 1] } : {}}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Plus className="h-4 w-4" /> Add
            </motion.button>
          ) : (
            <QtyStepper
              size="sm"
              value={qty}
              removable
              onDec={() => setQty(item.id, qty - 1)}
              onInc={() => setQty(item.id, qty + 1)}
              className="w-full"
            />
          )}
        </div>
      </div>
    </article>
  );
}
