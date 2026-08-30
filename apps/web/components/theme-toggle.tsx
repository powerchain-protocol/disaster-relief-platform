"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem("powerchain-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const stored = localStorage.getItem("powerchain-theme");
    const current: Theme = stored === "dark" ? "dark" : "light";
    setTheme(current);
    applyTheme(current);
  }, []);
  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
  };
  const label = `Switch to ${theme === "light" ? "dark" : "light"} theme`;
  return <button type="button" className="theme-toggle icon-only-button" onClick={toggle} aria-label={label} title={label} aria-pressed={theme === "dark"}>
    {theme === "light" ? <MoonIcon/> : <SunIcon/>}
  </button>;
}
