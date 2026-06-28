import { Check, PartyPopper, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus, OrderType } from "@/lib/types";

// Delivery: skip READY — food goes straight from kitchen to rider.
const DELIVERY_FLOW: { key: OrderStatus; label: string }[] = [
  { key: "PENDING",           label: "Placed" },
  { key: "CONFIRMED",         label: "Confirmed" },
  { key: "PREPARING",         label: "Preparing" },
  { key: "OUT_FOR_DELIVERY",  label: "On the way" },
  { key: "COMPLETED",         label: "Delivered!" },
];

// Pickup & dine-in: READY means "come collect it / serve it now".
const PICKUP_FLOW: { key: OrderStatus; label: string }[] = [
  { key: "PENDING",    label: "Placed" },
  { key: "CONFIRMED",  label: "Confirmed" },
  { key: "PREPARING",  label: "Preparing" },
  { key: "READY",      label: "Ready!" },
  { key: "COMPLETED",  label: "Done" },
];

export function OrderStatusBar({ status, type }: { status: OrderStatus; type: OrderType }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-chili/10 px-4 py-3 text-sm font-medium text-chili">
        <X className="h-4 w-4" /> This order was cancelled.
      </div>
    );
  }

  if (status === "COMPLETED") {
    const label = type === "delivery" ? "Order delivered! Enjoy your meal 🙏" : "Order completed! Thank you for dining with us 🙏";
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-leaf/10 px-4 py-3 text-sm font-medium text-leaf">
        <PartyPopper className="h-5 w-5 shrink-0" />
        <span>{label}</span>
      </div>
    );
  }

  const flow = type === "delivery" ? DELIVERY_FLOW : PICKUP_FLOW;

  // For delivery, map READY → OUT_FOR_DELIVERY so the stepper never gets
  // a status it doesn't know about (the admin skips READY for delivery anyway,
  // but this guards against any edge case).
  const effectiveStatus: OrderStatus =
    type === "delivery" && status === "READY" ? "OUT_FOR_DELIVERY" : status;

  const current = Math.max(0, flow.findIndex((s) => s.key === effectiveStatus));

  return (
    <div className="no-scrollbar flex items-center overflow-x-auto pb-1">
      {flow.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold transition-colors",
                  done && "border-terracotta bg-terracotta text-white",
                  active && "border-terracotta bg-terracotta-50 text-terracotta",
                  !done && !active && "border-line bg-paper text-muted",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[11px] font-medium",
                  active || done ? "text-ink" : "text-muted",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < flow.length - 1 && (
              <span
                className={cn(
                  "mx-1 h-0.5 flex-1 rounded-full",
                  i < current ? "bg-terracotta" : "bg-line",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
