"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ItemCard } from "./ItemCard";
import { ItemModal } from "./ItemModal";
import { cn } from "@/lib/utils";
import type { Category, MenuItem } from "@/lib/types";

type Diet = "all" | "veg" | "nonveg";

export function MenuBrowser({
  categories,
  items,
}: {
  categories: Category[];
  items: MenuItem[];
}) {
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<Diet>("all");
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [activeCat, setActiveCat] = useState(categories[0]?.id ?? "");

  const q = query.trim().toLowerCase();
  const sections = useMemo(
    () =>
      categories
        .map((c) => ({
          category: c,
          items: items.filter((i) => {
            if (i.categoryId !== c.id) return false;
            if (diet === "veg" && !i.isVeg) return false;
            if (diet === "nonveg" && i.isVeg) return false;
            if (q) {
              const hay = `${i.name} ${i.description} ${(i.tags ?? []).join(" ")}`.toLowerCase();
              if (!hay.includes(q)) return false;
            }
            return true;
          }),
        }))
        .filter((s) => s.items.length > 0),
    [categories, items, diet, q],
  );

  // Highlight the category currently in view.
  useEffect(() => {
    const headers = sections
      .map((s) => document.getElementById(`cat-${s.category.id}`))
      .filter(Boolean) as HTMLElement[];
    if (!headers.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveCat(visible[0].target.id.replace("cat-", ""));
      },
      { rootMargin: "-150px 0px -70% 0px", threshold: 0 },
    );
    headers.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [sections]);

  function jump(id: string) {
    setActiveCat(id);
    const el = document.getElementById(`cat-${id}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  return (
    <>
      {/* Sticky controls */}
      <div className="sticky top-16 z-30 border-b border-line/70 bg-cream/85 backdrop-blur-md">
        <div className="container-app flex flex-col gap-3 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes…"
                className="w-full rounded-full border border-line bg-paper py-2.5 pl-9 pr-4 text-sm outline-none focus:border-terracotta"
              />
            </div>
            <DietToggle diet={diet} setDiet={setDiet} />
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {sections.map((s) => (
              <button
                key={s.category.id}
                onClick={() => jump(s.category.id)}
                className={cn("chip shrink-0", activeCat === s.category.id && "chip-active")}
              >
                <span>{s.category.emoji}</span> {s.category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="container-app space-y-10 py-8">
        {sections.length === 0 && (
          <p className="py-24 text-center text-muted">
            No dishes match your search. Try something else?
          </p>
        )}
        {sections.map((s) => (
          <section key={s.category.id} id={`cat-${s.category.id}`} className="scroll-mt-32">
            <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-semibold text-ink">
              <span>{s.category.emoji}</span>
              {s.category.name}
              <span className="text-sm font-normal text-muted">({s.items.length})</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {s.items.map((i) => (
                <ItemCard key={i.id} item={i} onOpen={setSelected} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <ItemModal item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function DietToggle({ diet, setDiet }: { diet: Diet; setDiet: (d: Diet) => void }) {
  const opts: { key: Diet; label: string }[] = [
    { key: "all", label: "All" },
    { key: "veg", label: "Veg" },
    { key: "nonveg", label: "Non-veg" },
  ];
  return (
    <div className="flex shrink-0 rounded-full border border-line bg-paper p-1 text-sm">
      {opts.map((o) => (
        <button
          key={o.key}
          onClick={() => setDiet(o.key)}
          className={cn(
            "rounded-full px-3 py-1.5 font-medium transition-colors",
            diet === o.key ? "bg-terracotta text-white" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
