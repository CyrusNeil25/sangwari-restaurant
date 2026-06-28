import type { Metadata } from "next";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div className="container-app max-w-2xl py-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Restaurant details, UPI, WhatsApp & fees.</p>
      <AdminSettingsClient initial={settings} />
    </div>
  );
}
