import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { CustomerChrome } from "@/components/site/CustomerChrome";
import { NavigationLoader } from "@/components/site/NavigationLoader";
import { getSettings } from "@/lib/data";
import { Analytics } from "@vercel/analytics/next"

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Sangwari — Home-style food, ordered online",
    template: "%s · Sangwari",
  },
  description:
    "Order Chhattisgarhi specials and North-Indian favourites from Sangwari. Delivery, takeaway and dine-in — pay easily by UPI.",
  keywords: ["Sangwari", "Raipur", "Chhattisgarh", "food delivery", "order online", "restaurant"],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Sangwari" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Sangwari",
    title: "Sangwari — Home-style food, ordered online",
    description: "Order Chhattisgarhi specials and North-Indian favourites from Sangwari.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Sangwari Restaurant" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sangwari — Home-style food, ordered online",
    description: "Order Chhattisgarhi specials from Sangwari. Easy UPI payment.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
    shortcut: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#c0492b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();

  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`} suppressHydrationWarning>
      {/* Anti-flash: runs before React hydration to apply the saved theme class */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('sangwari-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <CartProvider>
          <NavigationLoader />
          <CustomerChrome settings={settings}>
            {children}
            <Analytics />
          </CustomerChrome>
        </CartProvider>
      </body>
    </html>
  );
}
