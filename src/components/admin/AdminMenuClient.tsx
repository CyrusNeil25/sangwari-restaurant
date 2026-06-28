"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Edit2, Plus, QrCode, Trash2, X, CheckCircle, XCircle } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { DietMark } from "@/components/ui/DietMark";
import { cn, formatINR } from "@/lib/utils";
import type { Category, MenuItem } from "@/lib/types";

const inputCls = "w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-terracotta";
const SPICE = [0, 1, 2, 3] as const;

export function AdminMenuClient({
  initialItems,
  categories,
}: {
  initialItems: MenuItem[];
  categories: Category[];
}) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("all");

  const visible = filterCat === "all" ? items : items.filter(i => i.categoryId === filterCat);
  const catName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

  async function toggleAvail(id: string) {
    setToggling(id);
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleAvailability: true }),
      });
      const updated: MenuItem = await res.json();
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    } finally { setToggling(null); }
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/menu/${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== id));
    } finally { setDeleting(null); }
  }

  async function save() {
    if (!editing) return;
    if (!editing.name?.trim()) return alert("Name is required.");
    if (!editing.categoryId) return alert("Category is required.");
    if (!editing.price || editing.price < 1) return alert("Price must be > 0.");
    setSaving(true);
    try {
      const method = editing.id && items.find(i => i.id === editing!.id) ? "PATCH" : "POST";
      const url = method === "PATCH" ? `/api/admin/menu/${editing.id}` : "/api/admin/menu";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const saved: MenuItem = await res.json();
      setItems(prev => {
        const idx = prev.findIndex(i => i.id === saved.id);
        if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
        return [saved, ...prev];
      });
      setEditing(null);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Menu</h1>
          <p className="text-sm text-muted">{items.length} items</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/tables" className="btn-ghost btn-sm">
            <QrCode className="h-4 w-4" /> Table QRs
          </a>
          <button
            type="button"
            onClick={() => setEditing({ isVeg: true, isAvailable: true, spiceLevel: 0 })}
            className="btn-primary btn-sm"
          >
            <Plus className="h-4 w-4" /> Add item
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <button onClick={() => setFilterCat("all")} className={cn("chip shrink-0", filterCat === "all" && "chip-active")}>All</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} className={cn("chip shrink-0", filterCat === c.id && "chip-active")}>
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* Item list */}
      <div className="space-y-2">
        {visible.map(item => (
          <div key={item.id} className={cn("card flex items-center gap-4 p-4", !item.isAvailable && "opacity-60")}>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-saffron-50 to-terracotta-50 text-2xl">
              {item.emoji ?? "🍽️"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <DietMark veg={item.isVeg} />
                <span className="font-medium text-ink truncate">{item.name}</span>
              </div>
              <p className="text-xs text-muted truncate">{catName(item.categoryId)} · {formatINR(item.price)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {/* Availability toggle */}
              <button
                type="button"
                onClick={() => toggleAvail(item.id)}
                disabled={toggling === item.id}
                title={item.isAvailable ? "Mark sold out" : "Mark available"}
                className={cn("chip text-xs", item.isAvailable ? "border-leaf/30 bg-leaf/10 text-leaf" : "border-chili/30 bg-chili/10 text-chili")}
              >
                {toggling === item.id
                  ? <Spinner size={14} />
                  : item.isAvailable ? <><CheckCircle className="h-3 w-3" /> Available</> : <><XCircle className="h-3 w-3" /> Sold out</>
                }
              </button>
              <button type="button" onClick={() => setEditing({ ...item })} className="btn-ghost btn-sm p-2">
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => deleteItem(item.id)}
                disabled={deleting === item.id}
                className="btn-ghost btn-sm p-2 text-chili hover:border-chili/40"
              >
                {deleting === item.id ? <Spinner size={16} /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="py-12 text-center text-muted">No items in this category.</p>
        )}
      </div>

      {/* Add / Edit modal */}
      <AnimatePresence>
        {editing !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setEditing(null)} />
            <motion.div
              className="card relative z-10 w-full max-w-lg overflow-hidden rounded-b-none sm:rounded-3xl"
              initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 32, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="flex items-center justify-between border-b border-line bg-paper px-5 py-4">
                <h2 className="font-display text-lg font-semibold">{editing.id && items.find(i => i.id === editing!.id) ? "Edit item" : "Add item"}</h2>
                <button type="button" onClick={() => setEditing(null)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-cream">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[65vh] space-y-3 overflow-y-auto p-5">
                <Field label="Name *">
                  <input className={inputCls} value={editing.name ?? ""} onChange={e => setEditing(p => ({ ...p!, name: e.target.value }))} placeholder="e.g. Paneer Tikka" />
                </Field>
                <Field label="Category *">
                  <select className={inputCls} value={editing.categoryId ?? ""} onChange={e => setEditing(p => ({ ...p!, categoryId: e.target.value }))}>
                    <option value="">Select…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price (₹) *">
                    <input className={inputCls} type="number" min={1} value={editing.price ?? ""} onChange={e => setEditing(p => ({ ...p!, price: Number(e.target.value) }))} placeholder="120" />
                  </Field>
                  <Field label="Emoji tile">
                    <input className={inputCls} value={editing.emoji ?? ""} onChange={e => setEditing(p => ({ ...p!, emoji: e.target.value }))} placeholder="🍛" />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea className={cn(inputCls, "resize-none")} rows={2} value={editing.description ?? ""} onChange={e => setEditing(p => ({ ...p!, description: e.target.value }))} />
                </Field>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editing.isVeg ?? true} onChange={e => setEditing(p => ({ ...p!, isVeg: e.target.checked }))} className="accent-leaf" />
                    Vegetarian
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={editing.isAvailable ?? true} onChange={e => setEditing(p => ({ ...p!, isAvailable: e.target.checked }))} className="accent-terracotta" />
                    Available
                  </label>
                </div>
                <Field label="Spice level">
                  <div className="flex gap-2">
                    {SPICE.map(n => (
                      <button key={n} type="button" onClick={() => setEditing(p => ({ ...p!, spiceLevel: n }))}
                        className={cn("chip", editing.spiceLevel === n && "chip-active")}>
                        {n === 0 ? "None" : "🌶".repeat(n)}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="flex gap-3 border-t border-line bg-paper p-4">
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost flex-1">Cancel</button>
                <button type="button" onClick={save} disabled={saving} className="btn-primary flex-1">
                  {saving ? <Spinner size={16} /> : null}
                  Save item
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
