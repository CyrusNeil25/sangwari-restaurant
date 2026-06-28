import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Sangwari Admin" },
  robots: { index: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <AdminNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
