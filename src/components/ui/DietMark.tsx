import { cn } from "@/lib/utils";

/** Indian-style veg / non-veg indicator (green dot in a square / red dot). */
export function DietMark({ veg, className }: { veg: boolean; className?: string }) {
  return (
    <span
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      title={veg ? "Veg" : "Non-veg"}
      className={cn("diet-mark", veg ? "diet-veg" : "diet-nonveg", className)}
    />
  );
}
