import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function SpiceMeter({ level, className }: { level?: number; className?: string }) {
  if (!level || level < 1) return null;
  return (
    <span
      className={cn("inline-flex items-center", className)}
      title={`Spice level ${level}/3`}
      aria-label={`Spice level ${level} of 3`}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <Flame
          key={i}
          className={cn("h-3.5 w-3.5", i < level ? "text-chili" : "text-line")}
          fill={i < level ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}
