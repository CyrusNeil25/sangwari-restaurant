"use client";

import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatINR } from "@/lib/utils";

export function StickyCartBar() {
  const { count, subtotal, openCart, isOpen, hydrated } = useCart();
  const pathname = usePathname() ?? "";

  const hideOnRoute =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/order");

  if (!hydrated || count === 0 || isOpen || hideOnRoute) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
      <button
        type="button"
        onClick={openCart}
        className="container-app flex w-full items-center justify-between rounded-full bg-terracotta px-5 py-3.5 text-white shadow-pop transition-transform active:scale-[0.99]"
      >
        <span className="flex items-center gap-2 font-semibold">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
            <ShoppingBag className="h-3.5 w-3.5" />
          </span>
          {count} item{count > 1 ? "s" : ""}
        </span>
        <span className="font-semibold">View cart · {formatINR(subtotal)}</span>
      </button>
    </div>
  );
}
