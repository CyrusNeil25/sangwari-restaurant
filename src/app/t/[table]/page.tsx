"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export default function TableLanding({ params }: { params: Promise<{ table: string }> }) {
  const router = useRouter();
  const { setTableNumber } = useCart();

  useEffect(() => {
    params.then(({ table }) => {
      setTableNumber(decodeURIComponent(table));
      router.replace("/menu");
    });
  }, [params, router, setTableNumber]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted">Loading menu…</p>
    </div>
  );
}
