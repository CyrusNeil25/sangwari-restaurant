"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Printer } from "lucide-react";

const COLORS = { dark: "#2a1f16", light: "#fffcf6" };

function useBaseUrl() {
  const [base, setBase] = useState("");
  useEffect(() => {
    setBase(`${window.location.protocol}//${window.location.host}`);
  }, []);
  return base;
}

export function TableQRClient() {
  const [count, setCount] = useState(10);
  const [qrs, setQrs] = useState<string[]>([]);
  const base = useBaseUrl();

  useEffect(() => {
    if (!base) return;
    const n = Math.max(1, Math.min(50, count));
    Promise.all(
      Array.from({ length: n }, (_, i) =>
        QRCode.toDataURL(`${base}/t/${i + 1}`, { width: 240, margin: 1, color: COLORS })
      )
    ).then(setQrs);
  }, [count, base]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Number of tables</span>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="w-28 rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-terracotta"
          />
        </label>
        <button
          type="button"
          onClick={() => window.print()}
          className="btn-primary btn-sm"
        >
          <Printer className="h-4 w-4" /> Print all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 print:grid-cols-3">
        {qrs.map((qr, i) => (
          <div
            key={i}
            className="card flex flex-col items-center gap-3 p-5 print:break-inside-avoid"
          >
            <p className="font-display text-2xl font-semibold text-ink">Table {i + 1}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={`QR code for table ${i + 1}`} width={200} height={200} className="h-40 w-40" />
            <p className="text-center text-xs text-muted">
              Scan to order from your table
            </p>
            <p className="font-display text-lg font-semibold text-terracotta">Sangwari</p>
          </div>
        ))}
      </div>

      <style>{`@media print { header, nav, .no-print { display: none !important; } }`}</style>
    </div>
  );
}
