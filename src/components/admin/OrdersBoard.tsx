"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  MessageCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { cn, formatINR, orderTypeLabel } from "@/lib/utils";
import { buildStatusMessage, waLink } from "@/lib/whatsapp";
import type { Order, OrderStatus, RestaurantSettings } from "@/lib/types";

/* Status groups shown on the board */
const COLUMNS: { key: OrderStatus; label: string; color: string }[] = [
  { key: "PENDING",    label: "New",        color: "text-bronze bg-saffron-50 border-saffron/40" },
  { key: "CONFIRMED",  label: "Confirmed",  color: "text-terracotta bg-terracotta-50 border-terracotta/30" },
  { key: "PREPARING",  label: "Preparing",  color: "text-ink bg-paper border-line" },
  { key: "READY",      label: "Ready",      color: "text-leaf bg-leaf/10 border-leaf/30" },
  { key: "OUT_FOR_DELIVERY", label: "On the way", color: "text-leaf bg-leaf/10 border-leaf/30" },
  { key: "COMPLETED",  label: "Done",       color: "text-muted bg-paper border-line" },
];

// Delivery skips READY — goes straight PREPARING → OUT_FOR_DELIVERY.
const NEXT_DELIVERY: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING:          "CONFIRMED",
  CONFIRMED:        "PREPARING",
  PREPARING:        "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "COMPLETED",
};
const NEXT_LABEL_DELIVERY: Partial<Record<OrderStatus, string>> = {
  PENDING:          "Accept order",
  CONFIRMED:        "Mark preparing",
  PREPARING:        "Out for delivery",
  OUT_FOR_DELIVERY: "Mark delivered",
};

// Pickup / dine-in uses READY ("food is ready, come collect").
const NEXT_PICKUP: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING:   "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY:     "COMPLETED",
};
const NEXT_LABEL_PICKUP: Partial<Record<OrderStatus, string>> = {
  PENDING:   "Accept order",
  CONFIRMED: "Mark preparing",
  PREPARING: "Mark ready",
  READY:     "Mark completed",
};

async function patchOrder(code: string, patch: Record<string, string>) {
  const res = await fetch(`/api/admin/orders/${code}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return res.json() as Promise<Order>;
}

export function OrdersBoard({ settings }: { settings: RestaurantSettings }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);
  const prevCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data: Order[] = await res.json();
      setOrders(data);
      // New-order alert
      const newCount = data.filter((o) => o.status === "PENDING").length;
      if (newCount > prevCount.current) {
        audioRef.current?.play().catch(() => {});
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New order!", { body: `${newCount} order${newCount > 1 ? "s" : ""} waiting.` });
        }
      }
      prevCount.current = newCount;
    } catch { /* ignore poll failures */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + Supabase realtime (falls back to 8 s poll without env vars)
  useEffect(() => {
    fetchOrders();

    const hasSupabase = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (hasSupabase) {
      // Live push: re-fetch the full list whenever any order row changes
      const supabase = createClient();
      const channel = supabase
        .channel("orders-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
          fetchOrders(true);
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } else {
      const id = setInterval(() => fetchOrders(true), 8000);
      return () => clearInterval(id);
    }
  }, [fetchOrders]);

  // Request notification permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  function applyUpdate(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.code === updated.code ? updated : o)));
  }

  async function advance(order: Order) {
    const isDelivery = order.type === "delivery";
    const nextMap  = isDelivery ? NEXT_DELIVERY      : NEXT_PICKUP;
    const labelMap = isDelivery ? NEXT_LABEL_DELIVERY : NEXT_LABEL_PICKUP;
    const next = nextMap[order.status];
    if (!next || !labelMap[order.status]) return;
    setActioning(order.code + "-advance");
    try {
      const updated = await patchOrder(order.code, { status: next });
      applyUpdate(updated);
      // Auto-send WhatsApp update when marked delivered / completed.
      if (next === "COMPLETED") {
        const msg = buildStatusMessage(settings.name, updated);
        const phone = updated.customerPhone.replace(/\D/g, "");
        const to = phone.length >= 10 ? `91${phone.slice(-10)}` : settings.whatsappNumber;
        window.open(waLink(to, msg));
      }
    } finally { setActioning(null); }
  }

  async function markPaid(order: Order) {
    setActioning(order.code + "-paid");
    try { applyUpdate(await patchOrder(order.code, { paymentStatus: "PAID" })); }
    finally { setActioning(null); }
  }

  async function cancel(order: Order) {
    if (!confirm(`Cancel order #${order.code}?`)) return;
    setActioning(order.code + "-cancel");
    try { applyUpdate(await patchOrder(order.code, { status: "CANCELLED" })); }
    finally { setActioning(null); }
  }

  function waCustomer(order: Order) {
    const msg = buildStatusMessage(settings.name, order);
    const phone = order.customerPhone.replace(/\D/g, "");
    const to = phone.length >= 10 ? `91${phone.slice(-10)}` : settings.whatsappNumber;
    window.open(waLink(to, msg));
  }

  const pending = orders.filter((o) => o.status === "PENDING");
  const active = orders.filter((o) => !["PENDING","COMPLETED","CANCELLED"].includes(o.status));
  const done = orders.filter((o) => ["COMPLETED","CANCELLED"].includes(o.status));

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading orders…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Auto-refreshes every 8 s · Last updated just now
        </p>
        <button
          type="button"
          onClick={() => fetchOrders()}
          className="btn-ghost btn-sm"
          disabled={refreshing}
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* New orders — highlighted */}
      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold text-bronze">
            <Clock className="h-5 w-5" />
            New orders ({pending.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pending.map((o) => (
              <OrderCard
                key={o.code}
                order={o}
                actioning={actioning}
                onAdvance={advance}
                onMarkPaid={markPaid}
                onCancel={cancel}
                onWa={waCustomer}
                isPickup={o.type !== "delivery"}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active */}
      {active.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">In progress ({active.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {active.map((o) => (
              <OrderCard
                key={o.code}
                order={o}
                actioning={actioning}
                onAdvance={advance}
                onMarkPaid={markPaid}
                onCancel={cancel}
                onWa={waCustomer}
                isPickup={o.type !== "delivery"}
              />
            ))}
          </div>
        </section>
      )}

      {/* Done */}
      {done.length > 0 && (
        <CollapsibleSection title={`Completed / Cancelled (${done.length})`}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {done.map((o) => (
              <OrderCard
                key={o.code}
                order={o}
                actioning={actioning}
                onAdvance={advance}
                onMarkPaid={markPaid}
                onCancel={cancel}
                onWa={waCustomer}
                isPickup={o.type !== "delivery"}
                dim
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {orders.length === 0 && (
        <div className="flex min-h-[35vh] flex-col items-center justify-center gap-3 text-center text-muted">
          <span className="text-5xl">🧾</span>
          <p className="font-display text-xl font-semibold text-ink">No orders yet</p>
          <p className="text-sm">New orders will appear here and refresh automatically.</p>
        </div>
      )}

      {/* Inaudible tick audio for new-order alert */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="none">
        <source src="/sounds/ding.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function OrderCard({
  order,
  actioning,
  onAdvance,
  onMarkPaid,
  onCancel,
  onWa,
  isPickup,
  dim,
}: {
  order: Order;
  actioning: string | null;
  onAdvance: (o: Order) => void;
  onMarkPaid: (o: Order) => void;
  onCancel: (o: Order) => void;
  onWa: (o: Order) => void;
  isPickup: boolean;
  dim?: boolean;
}) {
  const col = COLUMNS.find((c) => c.key === order.status);
  const labels = isPickup ? NEXT_LABEL_PICKUP : NEXT_LABEL_DELIVERY;
  const nextLabel = labels[order.status];
  const acting = (suffix: string) => actioning === `${order.code}-${suffix}`;

  return (
    <div className={cn("card flex flex-col gap-0 overflow-hidden", dim && "opacity-60")}>
      {/* Header */}
      <div className="flex items-center justify-between bg-paper px-4 py-3">
        <div>
          <span className="font-display text-lg font-semibold text-ink">#{order.code}</span>
          <span className="ml-2 text-sm text-muted">{orderTypeLabel(order.type)}</span>
        </div>
        <span className={cn("chip text-xs", col?.color)}>{col?.label ?? order.status}</span>
      </div>

      {/* Items */}
      <div className="space-y-0.5 bg-cream/40 px-4 py-2">
        {order.items.map((l) => (
          <p key={l.itemId} className="text-sm text-ink">
            {l.qty} × {l.name}
          </p>
        ))}
      </div>

      {/* Meta */}
      <div className="border-t border-line px-4 py-2 text-sm">
        <p className="font-medium text-ink">{order.customerName}</p>
        <p className="text-muted">{order.customerPhone}</p>
        {order.type === "delivery" && order.address && (
          <p className="mt-0.5 text-xs text-muted">{order.address}</p>
        )}
        {order.type === "dinein" && order.tableNumber && (
          <p className="text-xs text-muted">Table {order.tableNumber}</p>
        )}
        {order.notes && <p className="mt-0.5 text-xs text-bronze">Note: {order.notes}</p>}
        <p className="mt-1 font-semibold text-ink">{formatINR(order.total)}</p>
      </div>

      {/* Actions */}
      {!["COMPLETED", "CANCELLED"].includes(order.status) && (
        <div className="flex flex-wrap gap-2 border-t border-line bg-paper px-4 py-3">
          {order.paymentStatus === "UNPAID" && (
            <button
              type="button"
              onClick={() => onMarkPaid(order)}
              disabled={!!actioning}
              className="btn-ghost btn-sm flex-1"
            >
              {acting("paid") ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-leaf" />}
              Mark paid
            </button>
          )}
          {nextLabel && (
            <button
              type="button"
              onClick={() => onAdvance(order)}
              disabled={!!actioning}
              className="btn-primary btn-sm flex-1"
            >
              {acting("advance") ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {nextLabel}
            </button>
          )}
          <button type="button" onClick={() => onWa(order)} className="btn-ghost btn-sm">
            <MessageCircle className="h-4 w-4" />
          </button>
          {order.status === "PENDING" && (
            <button
              type="button"
              onClick={() => onCancel(order)}
              disabled={!!actioning}
              className="btn-ghost btn-sm text-chili hover:border-chili/40"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-muted hover:text-ink"
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        <span className="font-display text-xl font-semibold">{title}</span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}
