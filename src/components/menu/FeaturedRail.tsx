"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { DietMark } from "@/components/ui/DietMark";
import { TagBadge } from "./TagBadge";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";

export function FeaturedRail({ items }: { items: MenuItem[] }) {
  const { add } = useCart();
  return (
    <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
      {items.map((item) => (
        <div key={item.id} className="card w-44 shrink-0 overflow-hidden">
          <Link href="/menu" className="block">
            <div className="relative grid h-28 place-items-center bg-gradient-to-br from-saffron-50 to-terracotta-50 text-5xl">
              {item.emoji ?? "🍽️"}
              <span className="absolute left-2 top-2">
                <DietMark veg={item.isVeg} />
              </span>
              {item.tags?.[0] && (
                <span className="absolute bottom-2 left-2">
                  <TagBadge tag={item.tags[0]} />
                </span>
              )}
            </div>
          </Link>
          <div className="p-3">
            <h3 className="truncate font-medium text-ink">{item.name}</h3>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-semibold text-ink">{formatINR(item.price)}</span>
              <button
                type="button"
                onClick={() => add(item)}
                className="grid h-8 w-8 place-items-center rounded-full bg-terracotta text-white shadow-soft transition-colors hover:bg-terracotta-600"
                aria-label={`Add ${item.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
