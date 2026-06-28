"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, ExternalLink, MessageCircle, ShieldCheck } from "lucide-react";
import { formatINR } from "@/lib/utils";

export function PaymentPanel({
  upiUri,
  waUrl,
  amount,
  upiId,
  paid,
}: {
  upiUri: string;
  waUrl: string;
  amount: number;
  upiId: string;
  paid: boolean;
}) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let on = true;
    QRCode.toDataURL(upiUri, {
      width: 288,
      margin: 1,
      color: { dark: "#2a1f16", light: "#fffcf6" },
    })
      .then((d) => on && setQr(d))
      .catch(() => {});
    return () => {
      on = false;
    };
  }, [upiUri]);

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  if (paid) {
    return (
      <div className="card flex items-center gap-3 border-leaf/30 bg-leaf/5 p-5">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-leaf/15 text-leaf">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-ink">Payment received</p>
          <p className="text-sm text-muted">Thank you! Your order is being taken care of.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        {/* QR */}
        <div className="mx-auto">
          <div className="rounded-3xl border border-line bg-paper p-3 shadow-soft">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="UPI payment QR code" width={200} height={200} className="h-44 w-44" />
            ) : (
              <div className="h-44 w-44 animate-pulse rounded-2xl bg-cream" />
            )}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">
            Step 1 · Pay by UPI
          </p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink">
            {formatINR(amount)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Scan with any UPI app (GPay, PhonePe, Paytm). The amount is pre-filled.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a href={upiUri} className="btn-ghost btn-sm">
              <ExternalLink className="h-4 w-4" /> Open UPI app
            </a>
            <button type="button" onClick={copyUpi} className="btn-ghost btn-sm">
              {copied ? <Check className="h-4 w-4 text-leaf" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : upiId}
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp handoff */}
      <div className="border-t border-line bg-cream/60 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">
          Step 2 · Confirm on WhatsApp
        </p>
        <p className="mt-1 text-sm text-muted">
          Send us your order so we can confirm payment and start cooking.
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn mt-3 w-full bg-[#25D366] px-5 py-3.5 text-white shadow-soft hover:brightness-95"
        >
          <MessageCircle className="h-5 w-5" /> Send order on WhatsApp
        </a>
      </div>
    </div>
  );
}
