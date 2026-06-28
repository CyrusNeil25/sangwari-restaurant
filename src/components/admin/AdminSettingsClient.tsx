"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RestaurantSettings } from "@/lib/types";

const inputCls = "w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-terracotta";

export function AdminSettingsClient({ initial }: { initial: RestaurantSettings }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof RestaurantSettings>(key: K, val: RestaurantSettings[K]) {
    setForm(f => ({ ...f, [key]: val }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-8">
      {/* Open / closed toggle — prominent */}
      <div className="card flex items-center justify-between gap-4 p-5">
        <div>
          <p className="font-display text-lg font-semibold text-ink">Restaurant status</p>
          <p className="text-sm text-muted">
            {form.isOpen ? "Accepting orders" : "Closed — customers see a 'Closed' status"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => set("isOpen", !form.isOpen)}
          className={cn("flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            form.isOpen ? "bg-leaf/15 text-leaf" : "bg-line text-muted")}
        >
          {form.isOpen
            ? <ToggleRight className="h-6 w-6" />
            : <ToggleLeft className="h-6 w-6" />}
          {form.isOpen ? "Open" : "Closed"}
        </button>
      </div>

      <Section title="Restaurant info">
        <Field label="Name"><input className={inputCls} value={form.name} onChange={e => set("name", e.target.value)} /></Field>
        <Field label="Tagline"><input className={inputCls} value={form.tagline ?? ""} onChange={e => set("tagline", e.target.value)} placeholder="Where every guest eats like family" /></Field>
        <Field label="Welcome greeting (Chhattisgarhi)"><input className={inputCls} value={form.welcome ?? ""} onChange={e => set("welcome", e.target.value)} placeholder="Jay Johar!" /></Field>
        <Field label="Address"><textarea className={cn(inputCls, "resize-none")} rows={2} value={form.address} onChange={e => set("address", e.target.value)} /></Field>
        <Field label="Opening hours"><input className={inputCls} value={form.hours} onChange={e => set("hours", e.target.value)} placeholder="11:00 AM – 11:00 PM" /></Field>
        <Field label="Display phone"><input className={inputCls} value={form.phoneDisplay ?? ""} onChange={e => set("phoneDisplay", e.target.value)} placeholder="+91 99999 99999" /></Field>
        <Field label="Google Maps URL"><input className={inputCls} type="url" value={form.mapUrl ?? ""} onChange={e => set("mapUrl", e.target.value)} /></Field>
      </Section>

      <Section title="Payments & WhatsApp">
        <Field label="UPI ID" hint="e.g. yourname@upi — the QR is built from this">
          <input className={inputCls} value={form.upiId} onChange={e => set("upiId", e.target.value)} placeholder="restaurantname@upi" />
        </Field>
        <Field label="UPI display name">
          <input className={inputCls} value={form.upiName} onChange={e => set("upiName", e.target.value)} />
        </Field>
        <Field label="WhatsApp number" hint="Digits only, with country code — e.g. 919876543210">
          <input className={inputCls} value={form.whatsappNumber} onChange={e => set("whatsappNumber", e.target.value)} placeholder="919876543210" />
        </Field>
      </Section>

      <Section title="Delivery & taxes">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Delivery fee (₹)"><input className={inputCls} type="number" min={0} value={form.deliveryFee} onChange={e => set("deliveryFee", Number(e.target.value))} /></Field>
          <Field label="Min order (₹)"><input className={inputCls} type="number" min={0} value={form.minOrder} onChange={e => set("minOrder", Number(e.target.value))} /></Field>
          <Field label="Tax %"><input className={inputCls} type="number" min={0} max={50} value={form.taxPercent} onChange={e => set("taxPercent", Number(e.target.value))} /></Field>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save settings
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-leaf">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
