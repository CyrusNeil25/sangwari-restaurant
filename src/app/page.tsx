import Link from "next/link";
import { ArrowRight, Clock, Home, MapPin, QrCode, Utensils } from "lucide-react";
import { OpenStatusPill } from "@/components/site/OpenStatusPill";
import { FolkDivider } from "@/components/ui/FolkDivider";
import { FeaturedRail } from "@/components/menu/FeaturedRail";
import { PageTransition } from "@/components/site/PageTransition";
import { getCategories, getMenuItems, getSettings } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";

export default async function HomePage() {
  const [settings, categories, items] = await Promise.all([
    getSettings(),
    getCategories(),
    getMenuItems(),
  ]);

  const specials = items.filter((i) => i.tags?.length && i.isAvailable).slice(0, 8);

  return (
    <PageTransition>
    <div className="pb-24">
      {/* Hero */}
      <section className="container-app grid gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="inline-flex flex-wrap items-center gap-2 rounded-full bg-terracotta-50 px-3 py-1.5 text-sm font-semibold text-terracotta">
            🙏 {settings.welcome}
            <span className="font-normal text-muted">a warm Chhattisgarhi welcome</span>
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl">
            {settings.name}
            <span className="text-terracotta">.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted">
            {settings.tagline}. Order your favourites for delivery, takeaway, or right at your
            table.
          </p>
          <div className="mt-5">
            <OpenStatusPill isOpen={settings.isOpen} hours={settings.hours} />
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/menu" className="btn-primary">
              Explore the menu <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={waLink(settings.whatsappNumber, `Hi ${settings.name}! I'd like to place an order.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Order on WhatsApp
            </a>
          </div>
        </div>

        <HeroVisual />
      </section>

      {/* Specials */}
      {specials.length > 0 && (
        <section className="container-app py-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold text-ink">Today&apos;s favourites</h2>
              <p className="text-muted">The dishes our guests keep coming back for.</p>
            </div>
            <Link href="/menu" className="hidden shrink-0 text-sm font-semibold text-terracotta hover:underline sm:block">
              See all →
            </Link>
          </div>
          <FeaturedRail items={specials} />
        </section>
      )}

      {/* Categories */}
      <section className="container-app py-8">
        <h2 className="mb-4 font-display text-3xl font-semibold text-ink">Browse by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/menu#cat-${c.id}`}
              className="card flex flex-col items-center gap-2 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="text-sm font-medium text-ink">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <FolkDivider className="my-6" />

      {/* Why Sangwari */}
      <section className="container-app py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Feature
            icon={<Home className="h-5 w-5" />}
            title="Home-style cooking"
            desc="Recipes made fresh daily — including authentic Chhattisgarhi specials."
          />
          <Feature
            icon={<QrCode className="h-5 w-5" />}
            title="Easy UPI payment"
            desc="Just scan the QR and pay. No cards, no gateway, no fuss."
          />
          <Feature
            icon={<Utensils className="h-5 w-5" />}
            title="Delivery, takeaway & dine-in"
            desc="Order how you like it. Dine-in guests can order from the table."
          />
        </div>
      </section>

      {/* Visit */}
      <section className="container-app py-8">
        <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-ink">Visit us</h2>
            <p className="flex items-center gap-2 text-muted">
              <MapPin className="h-4 w-4 text-bronze" /> {settings.address}
            </p>
            <p className="flex items-center gap-2 text-muted">
              <Clock className="h-4 w-4 text-bronze" /> {settings.hours}
            </p>
          </div>
          {settings.mapUrl && (
            <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Get directions
            </a>
          )}
        </div>
      </section>
    </div>
    </PageTransition>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="card p-6">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-terracotta-50 text-terracotta">
        {icon}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted">{desc}</p>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-saffron-50 via-terracotta-50 to-paper shadow-card" />
      <div className="absolute inset-0 grid place-items-center text-[7rem] sm:text-[9rem]">🍛</div>
      <Floating className="left-5 top-8" rotate="-8deg">🫓</Floating>
      <Floating className="right-6 top-10" rotate="10deg">🍗</Floating>
      <Floating className="bottom-10 left-8" rotate="6deg">🍵</Floating>
      <Floating className="bottom-8 right-7" rotate="-10deg">🍮</Floating>
      <FolkDivider className="absolute inset-x-0 bottom-5" />
    </div>
  );
}

function Floating({
  children,
  className,
  rotate,
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: string;
}) {
  return (
    <div
      className={`absolute grid h-16 w-16 place-items-center rounded-2xl bg-paper text-3xl shadow-soft ${className ?? ""}`}
      style={{ transform: `rotate(${rotate ?? "0deg"})` }}
    >
      {children}
    </div>
  );
}
