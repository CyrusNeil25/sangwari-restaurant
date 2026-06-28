"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sangwari-theme";

export function useTheme() {
  const [dark, setDark] = useState(false);

  // Sync state from the class the anti-flash script already applied.
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = useCallback(() => {
    const next = !dark;
    setDark(next);
    const html = document.documentElement;
    if (next) {
      html.classList.add("dark");
      localStorage.setItem(STORAGE_KEY, "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem(STORAGE_KEY, "light");
    }
  }, [dark]);

  return { dark, toggle };
}
