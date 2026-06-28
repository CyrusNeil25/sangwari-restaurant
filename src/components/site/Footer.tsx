import Link from "next/link";
import { AtSign, Clock, MapPin, Phone } from "lucide-react";
import { FolkDivider } from "@/components/ui/FolkDivider";
import type { RestaurantSettings } from "@/lib/types";

export function Footer({ settings }: { settings: RestaurantSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-line bg-paper">
      <div className="container-app py-12">
        <FolkDivider className="mb-10" />

        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <h3 className="font-display text-2xl font-semibold text-ink">{settings.name}</h3>
            {settings.tagline && (
              <p className="mt-2 max-w-xs text-sm text-muted">{settings.tagline}</p>
            )}
          </div>

          <div className="space-y-3 text-sm text-muted">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
              <span>{settings.address}</span>
            </p>
            {settings.phoneDisplay && (
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-bronze" />
                <span>{settings.phoneDisplay}</span>
              </p>
            )}
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-bronze" />
              <span>{settings.hours}</span>
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <p className="font-semibold text-ink">Explore</p>
            <div className="flex flex-col gap-2 text-muted">
              <Link href="/" className="hover:text-terracotta">Home</Link>
              <Link href="/menu" className="hover:text-terracotta">Menu</Link>
              {settings.instagram && (
                <a
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-terracotta"
                >
                  <AtSign className="h-4 w-4" /> {settings.instagram}
                </a>
              )}
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted">
          © {year} {settings.name}. Made with ❤ for good food.
        </p>
      </div>
    </footer>
  );
}
