import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { getCategories, getMenuItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse Sangwari's full menu and order online.",
};

export default async function MenuPage() {
  const [categories, items] = await Promise.all([getCategories(), getMenuItems()]);

  return (
    <div className="pb-28">
      <div className="container-app pb-1 pt-8">
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Our Menu</h1>
        <p className="mt-1 text-muted">Freshly made, served like family.</p>
      </div>
      <MenuBrowser categories={categories} items={items} />
    </div>
  );
}
