import type { Metadata } from "next";
import { OrdersBoard } from "@/components/admin/OrdersBoard";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const settings = await getSettings();
  return (
    <div className="container-app py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Orders</h1>
          <p className="text-sm text-muted">Manage incoming orders in real time.</p>
        </div>
      </div>
      <OrdersBoard settings={settings} />
    </div>
  );
}
