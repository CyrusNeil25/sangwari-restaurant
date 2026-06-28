import { cn } from "@/lib/utils";

/** A subtle Godna / tribal-line inspired divider — used sparingly. */
export function FolkDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("flex items-center justify-center gap-3 text-bronze/55", className)}
    >
      <span className="h-px w-10 bg-current sm:w-20" />
      <svg
        width="64"
        height="14"
        viewBox="0 0 64 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      >
        <path d="M32 1 L37 7 L32 13 L27 7 Z" />
        <path d="M18 3.5 L21.5 7 L18 10.5 L14.5 7 Z" />
        <path d="M46 3.5 L49.5 7 L46 10.5 L42.5 7 Z" />
        <circle cx="6" cy="7" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="58" cy="7" r="1.4" fill="currentColor" stroke="none" />
      </svg>
      <span className="h-px w-10 bg-current sm:w-20" />
    </div>
  );
}
