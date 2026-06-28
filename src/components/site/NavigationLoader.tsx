"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { PageLoader } from "./PageLoader";

/**
 * Shows the PageLoader briefly on client-side route changes.
 * Mounts in the root layout; detects pathname changes.
 */
export function NavigationLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const prev = useRef(pathname);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname === prev.current) return;
    prev.current = pathname;

    // Show loader
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);

    // Hide after a short window — long enough to show the animation, short enough not to be annoying
    timer.current = setTimeout(() => setVisible(false), 900);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname]);

  return <PageLoader visible={visible} />;
}
