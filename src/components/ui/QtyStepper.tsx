"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  onDec,
  onInc,
  size = "md",
  removable = false,
  className,
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  size?: "sm" | "md";
  removable?: boolean;
  className?: string;
}) {
  const sm = size === "sm";
  const DecIcon = removable && value <= 1 ? Trash2 : Minus;
  const btn = cn(
    "grid place-items-center text-white/90 transition-colors hover:text-white",
    sm ? "h-8 w-8" : "h-10 w-10",
  );
  const icon = sm ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-between rounded-full bg-terracotta font-semibold text-white shadow-soft",
        sm ? "text-sm" : "",
        className,
      )}
    >
      <button type="button" onClick={onDec} className={btn} aria-label="Decrease quantity">
        <DecIcon className={icon} />
      </button>
      <span className="min-w-5 text-center tabular-nums">{value}</span>
      <button type="button" onClick={onInc} className={btn} aria-label="Increase quantity">
        <Plus className={icon} />
      </button>
    </div>
  );
}
