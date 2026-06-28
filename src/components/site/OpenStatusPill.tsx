import { cn } from "@/lib/utils";

export function OpenStatusPill({
  isOpen,
  hours,
  className,
}: {
  isOpen: boolean;
  hours?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "chip",
        isOpen ? "border-leaf/30 bg-leaf/10 text-leaf" : "border-line text-muted",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          isOpen ? "bg-leaf animate-pulse" : "bg-muted",
        )}
      />
      {isOpen ? "Open now" : "Closed"}
      {hours && <span className="font-normal opacity-70">· {hours}</span>}
    </span>
  );
}
