import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <div className="container-app py-8">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Checkout</h1>
      <p className="mt-1 text-muted">Almost there — just a few details.</p>
      <CheckoutForm settings={settings} />
    </div>
  );
}
