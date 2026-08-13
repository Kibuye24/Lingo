"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./Icons";
import {
  applyTheme,
  readChoice,
  resolveTheme,
  serverChoice,
  setChoice,
  subscribeTheme,
} from "@/lib/theme";

/**
 * One tap flips light/dark. Long-press territory (back to "system") is left
 * out on purpose — a visible two-state switch is easier to trust than a
 * three-state cycle where the third state looks like nothing happened.
 */
export default function ThemeToggle() {
  const choice = useSyncExternalStore(subscribeTheme, readChoice, serverChoice);
  const resolved = resolveTheme(choice);

  // public/theme-boot.js sets the theme before paint, but React's hydration of
  // <html> drops the attribute it never rendered. Re-applying on mount is the
  // repair; the boot script is still what prevents a visible flash.
  useEffect(() => {
    applyTheme(readChoice());
  }, []);

  const next = resolved === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => setChoice(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-sunk hover:text-foreground"
    >
      {resolved === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
