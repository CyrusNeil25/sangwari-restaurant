import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ name = "Sangwari", className }: { name?: string; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-terracotta text-white shadow-soft transition-transform group-hover:-rotate-6">
        {/* Devanagari "sa" — a small nod to the local roots of the name */}
        <span className="font-display text-lg leading-none">स</span>
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-ink">{name}</span>
    </Link>
  );
}
