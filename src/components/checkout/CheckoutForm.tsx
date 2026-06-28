"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Bike, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { DietMark } from "@/components/ui/DietMark";
import { useCart } from "@/lib/cart-context";
import { saveOrderCode } from "@/lib/order-history";
import { cn, formatINR } from "@/lib/utils";
import type { OrderType, PaymentMethod, RestaurantSettings } from "@/lib/types";

const TYPES: { key: OrderType; label: string; icon: typeof Bike }[] = [
  { key: "delivery", label: "Delivery", icon: Bike },
  { key: "takeaway", label: "Takeaway", icon: ShoppingBag },
  { key: "dinein", label: "Dine-in", icon: UtensilsCrossed },
];

const inputCls =
  "w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm outline-none focus:border-terracotta";

export function CheckoutForm({ settings }: { settings: RestaurantSettings }) {
  const router = useRouter();
  const { lines, subtotal, hydrated, tableNumber, clear } = useCart();

  const [type, setType] = useState<OrderType>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [table, setTable] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the customer arrived from a table QR, default to dine-in.
  useEffect(() => {
    if (tableNumber) {
      setTable(tableNumber);
      setType("dinein");
    }
  }, [tableNumber]);

  const deliveryFee = type === "delivery" ? settings.deliveryFee : 0;
  const tax = Math.round((subtotal * settings.taxPercent) / 100);
  const total = subtotal + deliveryFee + tax;
  const belowMin = type === "delivery" && subtotal < settings.minOrder;

  async function placeOrder() {
    setError(null);
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (phone.replace(/\D/g, "").length < 10)
      return setError("Please enter a valid 10-digit phone number.");
    if (type === "delivery" && address.trim().length < 6)
      return setError("Please enter your delivery address.");
    if (type === "dinein" && !table.trim()) return setError("Please enter your table number.");
    if (belowMin) return setError(`Minimum delivery order is ${formatINR(settings.minOrder)}.`);

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          customerName: name,
          customerPhone: phone,
          address,
          tableNumber: table,
          notes,
          paymentMethod: type === "delivery" ? paymentMethod : "upi",
          items: lines.map((l) => ({ itemId: l.item.id, qty: l.qty, note: l.note })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place the order.");
      saveOrderCode(data.code);
      clear();
      router.push(`/order/${data.code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  if (hydrated && lines.length === 0 && !submitting) {
    return (
      <div className="card mt-8 flex flex-col items-center gap-4 p-10 text-center">
        <span className="text-5xl">🍽️</span>
        <div>
          <p className="font-display text-lg font-semibold text-ink">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted">Add a few dishes before checking out.</p>
        </div>
        <Link href="/menu" className="btn-primary">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Form */}
      <div className="space-y-6">
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
            How would you like it?
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const active = type === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-sm font-medium transition-colors",
                    active
                      ? "border-terracotta bg-terracotta-50 text-terracotta"
                      : "border-line bg-paper text-muted hover:border-terracotta/40",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Payment method — delivery only */}
        {type === "delivery" && (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
              How would you like to pay?
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: "upi", label: "UPI / QR", sub: "Scan & pay instantly", emoji: "📲" },
                { key: "cod", label: "Cash on delivery", sub: "Pay when it arrives", emoji: "💵" },
              ] as const).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPaymentMethod(p.key)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4 text-left text-sm transition-colors",
                    paymentMethod === p.key
                      ? "border-terracotta bg-terracotta-50 text-terracotta"
                      : "border-line bg-paper text-muted hover:border-terracotta/40",
                  )}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <p className="font-semibold text-ink">{p.label}</p>
                    <p className="text-xs text-muted">{p.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ink">Name</span>
              <input
                className={cn(inputCls, "mt-1")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Phone</span>
              <input
                className={cn(inputCls, "mt-1")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                inputMode="numeric"
                placeholder="10-digit number"
              />
            </label>
          </div>

          {type === "delivery" && (
            <label className="block">
              <span className="text-sm font-medium text-ink">Delivery address</span>
              <textarea
                className={cn(inputCls, "mt-1 resize-none")}
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / flat, street, landmark…"
              />
            </label>
          )}

          {type === "dinein" && (
            <label className="block">
              <span className="text-sm font-medium text-ink">Table number</span>
              <input
                className={cn(inputCls, "mt-1")}
                value={table}
                onChange={(e) => setTable(e.target.value)}
                placeholder="e.g. 7"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-ink">Notes for the kitchen (optional)</span>
            <input
              className={cn(inputCls, "mt-1")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any preferences…"
            />
          </label>
        </section>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold text-ink">Order summary</h2>
          <div className="mt-3 space-y-2">
            {lines.map((l) => (
              <div key={l.item.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex min-w-0 items-center gap-1.5 text-ink">
                  <DietMark veg={l.item.isVeg} />
                  <span className="truncate">
                    {l.qty} × {l.item.name}
                  </span>
                </span>
                <span className="shrink-0 text-muted">{formatINR(l.item.price * l.qty)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
            <Row label="Subtotal" value={formatINR(subtotal)} />
            {type === "delivery" && <Row label="Delivery fee" value={formatINR(deliveryFee)} />}
            {tax > 0 && <Row label={`Taxes (${settings.taxPercent}%)`} value={formatINR(tax)} />}
            <div className="flex items-center justify-between border-t border-line pt-2 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>

          {error && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-chili/10 px-3 py-2 text-sm text-chili">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          {belowMin && !error && (
            <p className="mt-3 rounded-xl bg-saffron-50 px-3 py-2 text-xs text-bronze">
              Add {formatINR(settings.minOrder - subtotal)} more to reach the {formatINR(settings.minOrder)} delivery minimum.
            </p>
          )}

          <button
            type="button"
            onClick={placeOrder}
            disabled={submitting || belowMin}
            className="btn-primary mt-4 w-full"
          >
            {submitting ? (
              <>
                <Spinner size={16} /> Placing order…
              </>
            ) : (
              <>Place order · {formatINR(total)}</>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-muted">
            Next: scan the UPI QR to pay &amp; send your order on WhatsApp.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-muted">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
