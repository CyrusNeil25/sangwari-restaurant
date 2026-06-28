import type { Metadata } from "next";
import { TableQRClient } from "@/components/admin/TableQRClient";

export const metadata: Metadata = { title: "Table QR codes" };

export default function AdminTablesPage() {
  return (
    <div className="container-app py-6">
      <h1 className="font-display text-2xl font-semibold text-ink">Table QR codes</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        Print and stick these QR codes on tables. Guests scan → menu opens with the table
        number pre-filled → order goes straight to you.
      </p>
      <TableQRClient />
    </div>
  );
}
