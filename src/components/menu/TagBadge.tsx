import { cn } from "@/lib/utils";

const TAGS: Record<string, { label: string; className: string }> = {
  bestseller: { label: "★ Bestseller", className: "bg-saffron-50 text-bronze" },
  "chef-special": { label: "Chef's Special", className: "bg-terracotta-50 text-terracotta" },
  local: { label: "Local", className: "bg-leaf/10 text-leaf" },
};

export function TagBadge({ tag }: { tag: string }) {
  const t = TAGS[tag];
  if (!t) return null;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        t.className,
      )}
    >
      {t.label}
    </span>
  );
}
