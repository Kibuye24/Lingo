/*
 * Applies the saved theme before first paint, so there is never a flash of
 * the wrong one.
 *
 * A real file rather than an inline script, and a plain <script src> rather
 * than next/script: `beforeInteractive` emits only a <link rel="preload"> in
 * the App Router, so the file downloads but never runs.
 *
 * This executes during HTML parse, before paint. React's hydration then drops
 * the attribute (it never rendered it), so ThemeToggle re-applies on mount —
 * this script's job is purely to stop the flash in between.
 *
 * The storage key must stay in sync with KEY in src/lib/theme.ts.
 */
(function () {
  try {
    var saved = localStorage.getItem("lingo.theme.v1");
    var dark =
      saved === "dark" ||
      (saved !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0f1115" : "#ffffff");
  } catch {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
