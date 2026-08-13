"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BuildIcon,
  ChatIcon,
  GrammarIcon,
  HomeIcon,
  MoreIcon,
  PathIcon,
  ReviewIcon,
  SoundIcon,
  VerbIcon,
  WordsIcon,
} from "./Icons";
import { getLanguage, languages } from "@/content";
import { levelFromSlug, levels } from "@/content/levels";

/**
 * Floating pill navigation.
 *
 * Detached from the screen edge rather than welded to it: it reads as a
 * control sitting above the content, which is what makes an app feel like an
 * app instead of a website with a toolbar.
 *
 * Five slots — Home, the three things you reach for daily, and More for the
 * rest. Cramming nine destinations into a thumb-width bar would make every one
 * of them harder to hit.
 */
export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const [, code = "", second = ""] = pathname.split("/");
  const language = getLanguage(code);

  // The sheet remembers which route it was opened on. Navigating makes that
  // stale, which reads as closed — so it dismisses itself without an effect
  // syncing state to state.
  const [sheet, setSheet] = useState({ open: false, at: pathname });
  const sheetOpen = sheet.open && sheet.at === pathname;
  const setSheetOpen = (open: boolean) => setSheet({ open, at: pathname });

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSheet((current) => ({ ...current, open: false }));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  if (!language) return null;

  const levelSlug = levelFromSlug(second) ? second : levels[0].slug;
  const base = `/${code}/${levelSlug}`;

  const primary = [
    { href: `/${code}`, label: "Home", Icon: HomeIcon, exact: true },
    { href: `${base}/pad`, label: language.ui.lessons, Icon: PathIcon },
    { href: `${base}/woorden`, label: "Woorden", Icon: WordsIcon },
    { href: `/${code}/gesprek`, label: language.ui.conversation, Icon: ChatIcon },
  ];

  const overflow = [
    {
      href: `/${code}/review`,
      label: language.ui.review,
      sub: "Spaced repetition",
      Icon: ReviewIcon,
    },
    { href: `${base}/grammatica`, label: "Grammatica", sub: "Grammar", Icon: GrammarIcon },
    { href: `${base}/bouwen`, label: "Zinnen bouwen", sub: "Build sentences", Icon: BuildIcon },
    { href: `${base}/werkwoorden`, label: "Vervoeging", sub: "Verb conjugation", Icon: VerbIcon },
    { href: `/${code}/klanken`, label: language.ui.sounds, sub: "Pronunciation", Icon: SoundIcon },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const overflowActive = overflow.some((item) => isActive(item.href));

  return (
    <>
      {sheetOpen && (
        <div
          className="fade-in fixed inset-0 z-40 bg-black/50"
          onClick={() => setSheetOpen(false)}
          aria-hidden
        />
      )}

      {sheetOpen && (
        <div
          role="dialog"
          aria-label="More sections"
          className="sheet-up fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-line bg-surface pb-safe"
        >
          <div className="mx-auto max-w-lg px-4 pb-6 pt-2">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" aria-hidden />

            <div className="space-y-2">
              {overflow.map(({ href, label, sub, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                    isActive(href)
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line bg-surface hover:border-accent"
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunk">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="target block text-sm font-semibold leading-tight">{label}</span>
                    <span className="block text-xs text-muted">{sub}</span>
                  </span>
                </Link>
              ))}
            </div>

            {languages.length > 1 && (
              <div className="mt-4 border-t border-line pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Taal · Language
                </p>
                <div className="flex gap-2">
                  {languages.map((other) => (
                    <Link
                      key={other.code}
                      href={`/${other.code}`}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                        other.code === code
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line hover:border-accent"
                      }`}
                    >
                      <span aria-hidden>{other.flag}</span>
                      {other.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-safe">
        <nav
          aria-label="Main"
          className="pointer-events-auto mx-auto mb-3 flex max-w-sm items-stretch rounded-full border border-line bg-[var(--shell)] px-1.5 py-1.5 shadow-lg backdrop-blur-xl"
        >
          {primary.map(({ href, label, Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-1 rounded-full py-1.5 transition-colors ${
                  active ? "bg-accent-soft text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate px-1 text-[10px] font-medium leading-none">
                  {label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setSheetOpen(!sheetOpen)}
            aria-expanded={sheetOpen}
            aria-label="More sections"
            className={`flex flex-1 flex-col items-center gap-1 rounded-full py-1.5 transition-colors ${
              sheetOpen || overflowActive
                ? "bg-accent-soft text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            <MoreIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">Meer</span>
          </button>
        </nav>
      </div>
    </>
  );
}
