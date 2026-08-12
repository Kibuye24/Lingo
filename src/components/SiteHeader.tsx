"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileSwitcher from "./ProfileSwitcher";
import { getLanguage, languages } from "@/content";
import { levelFromSlug, levels } from "@/content/levels";

/**
 * Nav follows whichever language and level you're inside. On the picker screens
 * there is no context yet, so only the wordmark shows.
 */
export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [, code = "", second = ""] = pathname.split("/");
  const language = getLanguage(code);

  // Level lives in the URL on content routes; fall back to the first level so
  // the nav still points somewhere sensible from /nl/les/... and /nl/klanken.
  const levelSlug = levelFromSlug(second) ? second : levels[0].slug;

  const nav = language
    ? [
        { href: `/${code}/${levelSlug}/pad`, label: language.ui.lessons },
        { href: `/${code}/${levelSlug}/woorden`, label: "Woorden" },
        { href: `/${code}/${levelSlug}/grammatica`, label: "Grammatica" },
        { href: `/${code}/${levelSlug}/bouwen`, label: "Bouwen" },
        { href: `/${code}/${levelSlug}/werkwoorden`, label: "Vervoeging" },
        { href: `/${code}/klanken`, label: language.ui.sounds },
        { href: `/${code}/review`, label: language.ui.review },
        { href: `/${code}/gesprek`, label: language.ui.conversation },
      ]
    : [];

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm text-white"
          >
            L
          </span>
          Lingo
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto text-sm">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 transition-colors hover:bg-sunk hover:text-foreground ${
                  active ? "bg-sunk font-medium text-foreground" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {language && languages.length > 1 && (
          <div className="flex shrink-0 items-center gap-1">
            {languages.map((other) => (
              <Link
                key={other.code}
                href={`/${other.code}`}
                title={other.nameEn}
                className={`rounded-md px-2 py-1 font-mono text-xs uppercase transition-colors ${
                  other.code === code
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-sunk hover:text-foreground"
                }`}
              >
                {other.code}
              </Link>
            ))}
          </div>
        )}

        <ProfileSwitcher />
      </div>
    </header>
  );
}
