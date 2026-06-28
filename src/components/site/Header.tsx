"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Logo } from "./Logo";
import { OpenStatusPill } from "./OpenStatusPill";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCart } from "@/lib/cart-context";
import type { RestaurantSettings } from "@/lib/types";

export function Header({ settings }: { settings: RestaurantSettings }) {
  const { count, openCart, hydrated } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/80 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Logo name={settings.name} />

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted sm:flex">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <Link href="/menu" className="transition-colors hover:text-ink">
            Menu
          </Link>
          <OpenStatusPill isOpen={settings.isOpen} hours={settings.hours} className="text-xs" />
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={openCart}
            className="btn-ghost btn-sm relative"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {hydrated && count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-terracotta px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
