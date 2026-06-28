"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { dark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border border-line",
        "bg-paper text-muted transition-colors",
        "hover:border-terracotta/40 hover:text-ink",
        className,
      )}
    >
      {dark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
