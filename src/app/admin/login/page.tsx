import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "Admin login" };

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-terracotta text-white shadow-soft">
            <span className="font-display text-2xl">स</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Admin login</h1>
          <p className="mt-1 text-sm text-muted">Sangwari Restaurant</p>
        </div>
        <AdminLoginForm nextParam={searchParams.then((p) => p.next)} />
      </div>
    </div>
  );
}
