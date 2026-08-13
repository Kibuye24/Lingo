"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BuildIcon,
  ChatIcon,
  GrammarIcon,
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
 * Mobile-app bottom tab bar.
 *
 * Four primary destinations plus More. Four is the limit at which labels stay
 * legible on a small phone; the app has nine destinations, so the rest live in
 * a sheet rather than being crammed in or hidden behind a hamburger at the top
 * where thumbs can't reach.
 *
 * Hidden on the language picker, which is an onboarding screen with no
 * language context to navigate within.
 */
export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const [, code = "", second = ""] = pathname.split("/");
  const language = getLanguage(code);
  // The sheet remembers which route it was opened on. Navigating makes that
  // stale, which reads as closed — so the sheet dismisses itself on navigation
  // without an effect syncing state to state.
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
    { href: `${base}/pad`, label: language.ui.lessons, Icon: PathIcon },
    { href: `${base}/woorden`, label: "Woorden", Icon: WordsIcon },
    { href: `/${code}/review`, label: language.ui.review, Icon: ReviewIcon },
    { href: `/${code}/gesprek`, label: language.ui.conversation, Icon: ChatIcon },
  ];

  const overflow = [
    { href: `${base}/grammatica`, label: "Grammatica", sub: "Grammar", Icon: GrammarIcon },
    { href: `${base}/bouwen`, label: "Zinnen bouwen", sub: "Build sentences", Icon: BuildIcon },
    { href: `${base}/werkwoorden`, label: "Vervoeging", sub: "Verb conjugation", Icon: VerbIcon },
    { href: `/${code}/klanken`, label: language.ui.sounds, sub: "Pronunciation", Icon: SoundIcon },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const overflowActive = overflow.some((item) => isActive(item.href));

  return (
    <>
      {sheetOpen && (
        <div
          className="fade-in fixed inset-0 z-40 bg-black/40"
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
          <div className="mx-auto max-w-lg px-4 pb-3 pt-2">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" aria-hidden />

            <div className="grid grid-cols-2 gap-2">
              {overflow.map(({ href, label, sub, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col gap-1 rounded-2xl border p-3 transition-colors ${
                    isActive(href)
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line bg-surface hover:border-accent"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="target text-sm font-semibold leading-tight">{label}</span>
                  <span className="text-xs text-muted">{sub}</span>
                </Link>
              ))}
            </div>

            {languages.length > 1 && (
              <div className="mt-3 border-t border-line pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Taal · Language
                </p>
                <div className="flex gap-2">
                  {languages.map((other) => (
                    <Link
                      key={other.code}
                      href={`/${other.code}`}
                      className={`flex-1 rounded-xl border px-3 py-2 text-center text-sm font-medium transition-colors ${
                        other.code === code
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line hover:border-accent"
                      }`}
                    >
                      {other.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[var(--shell)] backdrop-blur-lg pb-safe"
      >
        <div className="mx-auto flex max-w-lg items-stretch">
          {primary.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                  active ? "text-accent" : "text-muted"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="max-w-full truncate px-1 text-[10px] font-medium leading-tight">
                  {label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setSheetOpen(!sheetOpen)}
            aria-expanded={sheetOpen}
            aria-label="More sections"
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
              sheetOpen || overflowActive ? "text-accent" : "text-muted"
            }`}
          >
            <MoreIcon className="h-6 w-6" />
            <span className="text-[10px] font-medium leading-tight">Meer</span>
          </button>
        </div>
      </nav>
    </>
  );
}
