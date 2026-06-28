import type { Metadata } from "next";
import { AdminMenuClient } from "@/components/admin/AdminMenuClient";
import { getAllCategories, getMenuItems } from "@/lib/data";

export const metadata: Metadata = { title: "Menu" };
export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const [items, categories] = await Promise.all([getMenuItems(), getAllCategories()]);
  return (
    <div className="container-app py-6">
      <AdminMenuClient initialItems={items} categories={categories} />
    </div>
  );
}
