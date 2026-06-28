"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { getOrderCodes, clearOrderCode } from "@/lib/order-history";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/types";

const DONE = new Set(["COMPLETED", "CANCELLED"]);

const STATUS_LABEL: Partial<Record<string, string>> = {
  PENDING:           "⏳ Waiting for confirmation",
  CONFIRMED:         "✅ Order confirmed!",
  PREPARING:         "👨‍🍳 Being prepared",
  READY:             "🔔 Ready for pickup!",
  OUT_FOR_DELIVERY:  "🛵 On the way!",
  COMPLETED:         "✓ Delivered",
  CANCELLED:         "✗ Cancelled",
};

export function ActiveOrderBar() {
  const pathname = usePathname() ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Don't show on order page itself, admin, or checkout
  const hide =
    dismissed ||
    pathname.startsWith("/order/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/checkout");

  useEffect(() => {
    if (hide) return;

    async function fetchLatest() {
      const codes = getOrderCodes();
      if (!codes.length) return;

      // Try codes from newest to oldest, find the first active one
      for (const code of codes) {
        try {
          const res = await fetch(`/api/orders/${code}`);
          if (!res.ok) continue;
          const data: Order = await res.json();
          if (DONE.has(data.status)) {
            // Quietly remove completed/cancelled from history
            clearOrderCode(code);
            continue;
          }
          setOrder(data);
          return;
        } catch { continue; }
      }
      setOrder(null);
    }

    fetchLatest();
    const id = setInterval(fetchLatest, 15_000);
    return () => clearInterval(id);
  }, [hide, pathname]);

  if (hide || !order) return null;

  return (
    <div className={cn(
      "fixed inset-x-0 z-30 px-3 transition-all",
      // Sit just above the sticky cart bar when it's visible
      "bottom-20 sm:bottom-6",
    )}>
      <div className="container-app">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-terracotta/20 bg-paper px-4 py-3 shadow-card">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">
              Order #{order.code}
            </p>
            <p className="truncate text-sm font-medium text-ink">
              {STATUS_LABEL[order.status] ?? order.status}
            </p>
          </div>

          <Link
            href={`/order/${order.code}`}
            className="btn-primary btn-sm shrink-0"
          >
            Track <ChevronRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted hover:bg-cream"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
