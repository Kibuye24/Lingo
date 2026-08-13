"use client";

/**
 * Theme preference, stored locally.
 *
 * Three states rather than two: "system" follows the device, and an explicit
 * "light"/"dark" pins it. Defaulting to system means the app matches whatever
 * the phone is already doing at night, which is what people expect from a
 * native app.
 */

export type ThemeChoice = "light" | "dark" | "system";

/** Must stay in sync with the key hardcoded in public/theme-boot.js. */
const KEY = "lingo.theme.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readChoice(): ThemeChoice {
  if (!isBrowser()) return "system";
  const stored = window.localStorage.getItem(KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

/** What the choice actually resolves to right now. */
export function resolveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  if (!isBrowser()) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(choice: ThemeChoice) {
  if (!isBrowser()) return;
  const resolved = resolveTheme(choice);
  document.documentElement.setAttribute("data-theme", resolved);

  // Keeps the mobile browser chrome (status bar / address bar) in step, which
  // is most of what makes a PWA feel installed rather than embedded.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved === "dark" ? "#0f1115" : "#ffffff");
}

export function setChoice(choice: ThemeChoice) {
  if (!isBrowser()) return;
  if (choice === "system") window.localStorage.removeItem(KEY);
  else window.localStorage.setItem(KEY, choice);
  applyTheme(choice);
  for (const listener of listeners) listener();
}

// ── External store ──────────────────────────────────────────────────────────

const listeners = new Set<() => void>();

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  if (isBrowser() && listeners.size === 1) {
    // A pinned choice ignores the OS; "system" should track it live.
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", onSystemChange);
  }
  return () => {
    listeners.delete(listener);
    if (isBrowser() && listeners.size === 0) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", onSystemChange);
    }
  };
}

function onSystemChange() {
  if (readChoice() === "system") applyTheme("system");
  for (const listener of listeners) listener();
}

export function serverChoice(): ThemeChoice {
  return "system";
}
