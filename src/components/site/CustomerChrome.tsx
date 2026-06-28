"use client";

import { usePathname } from "next/navigation";
import type { RestaurantSettings } from "@/lib/types";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { StickyCartBar } from "@/components/cart/StickyCartBar";
import { ActiveOrderBar } from "./ActiveOrderBar";
import { PWAInstallBanner } from "./PWAInstallBanner";

export function CustomerChrome({
  settings,
  children,
}: {
  settings: RestaurantSettings;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <CartDrawer settings={settings} />
      <StickyCartBar />
      <ActiveOrderBar />
      <PWAInstallBanner />
    </>
  );
}
