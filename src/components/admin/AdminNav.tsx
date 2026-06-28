"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LogOut, Settings, UtensilsCrossed } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Orders", icon: ClipboardList, exact: true },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function AdminNav() {
  const pathname = usePathname() ?? "";
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur-md">
      <div className="container-app flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="rounded-full bg-terracotta-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-terracotta">
            Admin
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const Icon = l.icon;
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-terracotta text-white"
                    : "text-muted hover:bg-cream hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}

          {/* Sign out — only shown when Supabase auth is active */}
          {USE_SUPABASE && (
            <form action="/admin/logout" method="POST">
              <button
                type="submit"
                title="Sign out"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-cream hover:text-chili"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
