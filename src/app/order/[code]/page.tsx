import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrderStatusBar } from "@/components/order/OrderStatusBar";
import { PaymentPanel } from "@/components/order/PaymentPanel";
import { DietMark } from "@/components/ui/DietMark";
import { getOrderByCode, getSettings } from "@/lib/data";
import { buildUpiUri } from "@/lib/upi";
import { buildOrderMessage, waLink } from "@/lib/whatsapp";
import { cn, formatINR, orderTypeLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [order, settings] = await Promise.all([getOrderByCode(code), getSettings()]);

  if (!order) {
    return (
      <div className="container-app max-w-lg py-16 text-center">
        <span className="text-5xl">🧐</span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Order not found</h1>
        <p className="mt-1 text-muted">
          We couldn&apos;t find order <span className="font-semibold">#{code.toUpperCase()}</span>.
          The link may be incorrect.
        </p>
        <Link href="/menu" className="btn-primary mt-6">
          Back to menu
        </Link>
      </div>
    );
  }

  const upiUri = buildUpiUri(settings, order.total, `Order ${order.code}`);
  const message = buildOrderMessage({
    settings: { name: settings.name, upiId: settings.upiId },
    code: order.code,
    type: order.type,
    name: order.customerName,
    phone: order.customerPhone,
    address: order.address,
    table: order.tableNumber,
    lines: order.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    tax: order.tax,
    total: order.total,
    notes: order.notes,
  });
  const wa = waLink(settings.whatsappNumber, message);
  const paid = order.paymentStatus === "PAID";

  return (
    <div className="container-app max-w-3xl space-y-6 py-8">
      <Link href="/menu" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Order #{order.code}
          </h1>
          <p className="text-sm text-muted">
            {orderTypeLabel(order.type)} ·{" "}
            {new Date(order.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span
          className={cn(
            "chip",
            paid ? "border-leaf/30 bg-leaf/10 text-leaf" : "border-saffron/40 bg-saffron-50 text-bronze",
          )}
        >
          {paid ? "Paid" : "Awaiting payment"}
        </span>
      </div>

      <div className="card p-5">
        <OrderStatusBar status={order.status} type={order.type} />
      </div>

      {order.status !== "CANCELLED" && (
        <PaymentPanel
          upiUri={upiUri}
          waUrl={wa}
          amount={order.total}
          upiId={settings.upiId}
          paid={paid}
          paymentMethod={order.paymentMethod}
        />
      )}

      {/* Details */}
      <div className="card p-5">
        <h2 className="font-display text-lg font-semibold text-ink">Order details</h2>
        <div className="mt-3 space-y-2">
          {order.items.map((l) => (
            <div key={l.itemId} className="flex items-start justify-between gap-2 text-sm">
              <span className="min-w-0 text-ink">
                {l.qty} × {l.name}
                {l.note && <span className="block text-xs text-muted">“{l.note}”</span>}
              </span>
              <span className="shrink-0 text-muted">{formatINR(l.price * l.qty)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm">
          <Row label="Subtotal" value={formatINR(order.subtotal)} />
          {order.deliveryFee > 0 && <Row label="Delivery fee" value={formatINR(order.deliveryFee)} />}
          {order.tax > 0 && <Row label="Taxes" value={formatINR(order.tax)} />}
          <div className="flex items-center justify-between border-t border-line pt-2 text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-1 border-t border-line pt-3 text-sm text-muted">
          <p>
            <span className="font-medium text-ink">{order.customerName}</span> · {order.customerPhone}
          </p>
          {order.type === "delivery" && order.address && <p>Deliver to: {order.address}</p>}
          {order.type === "dinein" && order.tableNumber && <p>Table {order.tableNumber}</p>}
          {order.notes && <p>Note: {order.notes}</p>}
        </div>
      </div>

      <p className="text-center text-sm text-muted">
        Keep this page handy — your order status updates here.
      </p>
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
