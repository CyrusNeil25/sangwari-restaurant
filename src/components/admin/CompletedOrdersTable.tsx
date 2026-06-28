"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn, formatINR, orderTypeLabel } from "@/lib/utils";
import type { Order } from "@/lib/types";

const PAGE_SIZE = 10;

type StatusFilter  = "all" | "COMPLETED" | "CANCELLED";
type PaymentFilter = "all" | "upi" | "cod";
type TypeFilter    = "all" | "delivery" | "takeaway" | "dinein";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("chip shrink-0 transition-colors", active && "chip-active")}
    >
      {children}
    </button>
  );
}

export function CompletedOrdersTable({ orders }: { orders: Order[] }) {
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [typeFilter,    setTypeFilter]    = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter  !== "all" && o.status         !== statusFilter)  return false;
      if (paymentFilter !== "all" && o.paymentMethod  !== paymentFilter) return false;
      if (typeFilter    !== "all" && o.type           !== typeFilter)    return false;
      return true;
    });
  }, [orders, statusFilter, paymentFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const slice      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetPage() { setPage(1); }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-ink">
        History
        <span className="ml-2 text-base font-normal text-muted">({filtered.length})</span>
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Status */}
        <div className="flex gap-1.5">
          {(["all","COMPLETED","CANCELLED"] as StatusFilter[]).map((s) => (
            <Chip key={s} active={statusFilter === s} onClick={() => { setStatusFilter(s); resetPage(); }}>
              {s === "all" ? "All statuses" : s === "COMPLETED" ? "✓ Completed" : "✗ Cancelled"}
            </Chip>
          ))}
        </div>

        <div className="w-px bg-line" />

        {/* Payment mode */}
        <div className="flex gap-1.5">
          {(["all","upi","cod"] as PaymentFilter[]).map((p) => (
            <Chip key={p} active={paymentFilter === p} onClick={() => { setPaymentFilter(p); resetPage(); }}>
              {p === "all" ? "All payments" : p === "upi" ? "📲 UPI" : "💵 COD"}
            </Chip>
          ))}
        </div>

        <div className="w-px bg-line" />

        {/* Order type */}
        <div className="flex gap-1.5">
          {(["all","delivery","takeaway","dinein"] as TypeFilter[]).map((t) => (
            <Chip key={t} active={typeFilter === t} onClick={() => { setTypeFilter(t); resetPage(); }}>
              {t === "all" ? "All types" : orderTypeLabel(t)}
            </Chip>
          ))}
        </div>
      </div>

      {/* Table */}
      {slice.length === 0 ? (
        <div className="rounded-2xl border border-line bg-paper py-12 text-center text-muted">
          No orders match the selected filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {slice.map((o) => (
                <tr key={o.code} className="transition-colors hover:bg-cream/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/order/${o.code}`}
                      target="_blank"
                      className="font-display font-semibold text-terracotta hover:underline"
                    >
                      #{o.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{o.customerName}</p>
                    <p className="text-xs text-muted">{o.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{orderTypeLabel(o.type)}</td>
                  <td className="px-4 py-3">
                    <span className="text-muted">
                      {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">
                    {formatINR(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      o.paymentMethod === "cod"
                        ? "bg-saffron-50 text-bronze"
                        : "bg-terracotta-50 text-terracotta",
                    )}>
                      {o.paymentMethod === "cod" ? "💵 COD" : "📲 UPI"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      o.status === "COMPLETED"
                        ? "bg-leaf/10 text-leaf"
                        : "bg-chili/10 text-chili",
                    )}>
                      {o.status === "COMPLETED" ? "✓ Done" : "✗ Cancelled"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                    {new Date(o.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <PagBtn onClick={() => setPage(1)}           disabled={safePage === 1}><ChevronsLeft  className="h-4 w-4" /></PagBtn>
            <PagBtn onClick={() => setPage(p => p - 1)} disabled={safePage === 1}><ChevronLeft   className="h-4 w-4" /></PagBtn>
            {/* Page number pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="px-1 text-muted">…</span>
                ) : (
                  <PagBtn key={p} onClick={() => setPage(p as number)} active={safePage === p}>
                    {p}
                  </PagBtn>
                ),
              )}
            <PagBtn onClick={() => setPage(p => p + 1)} disabled={safePage === totalPages}><ChevronRight  className="h-4 w-4" /></PagBtn>
            <PagBtn onClick={() => setPage(totalPages)} disabled={safePage === totalPages}><ChevronsRight className="h-4 w-4" /></PagBtn>
          </div>
        </div>
      )}
    </section>
  );
}

function PagBtn({
  onClick,
  disabled,
  active,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-8 min-w-8 place-items-center rounded-lg px-2 text-sm font-medium transition-colors",
        active
          ? "bg-terracotta text-white"
          : "border border-line bg-paper text-muted hover:border-terracotta/40 hover:text-ink",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {children}
    </button>
  );
}
