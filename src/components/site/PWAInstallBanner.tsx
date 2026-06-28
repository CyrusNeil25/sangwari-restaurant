"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Don't show if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("pwa-dismissed")) { setDismissed(true); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt || dismissed) return null;

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setPrompt(null);
    else dismiss();
  }

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("pwa-dismissed", "1");
  }

  return (
    <div className="fixed bottom-20 left-3 right-3 z-30 sm:bottom-6 sm:left-auto sm:right-6 sm:w-80">
      <div className="card flex items-center gap-3 p-4 shadow-pop">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-terracotta-50 text-xl">
          🍛
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Add Sangwari to home screen</p>
          <p className="text-xs text-muted">Order faster, just like an app.</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={install}
            className="grid h-8 w-8 place-items-center rounded-full bg-terracotta text-white hover:bg-terracotta-600"
            aria-label="Install app"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-cream"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}
