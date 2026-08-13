"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BuildIcon,
  ChatIcon,
  CloseIcon,
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
import { useSelectedLanguages } from "@/lib/hooks";

/**
 * Floating navigation.
 *
 * The pill itself grows: tapping Meer expands it upward into extra rows of the
 * same icon+label items, rather than throwing up a separate bottom sheet — so
 * it reads as one control revealing more of itself, and Meer flips to a close
 * button. The tutor stays a round compose button off to the side.
 */
export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const [, code = "", second = ""] = pathname.split("/");
  const language = getLanguage(code);
  const selected = useSelectedLanguages();

  // Offer the learner's chosen languages; before onboarding, all of them.
  const switchable = selected.length
    ? languages.filter((l) => selected.includes(l.code))
    : languages;

  // Scope open-state to the route so navigating collapses it, without an effect
  // syncing state to state.
  const [panel, setPanel] = useState({ open: false, at: pathname });
  const open = panel.open && panel.at === pathname;
  const setOpen = (next: boolean) => setPanel({ open: next, at: pathname });

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel((current) => ({ ...current, open: false }));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!language) return null;

  const levelSlug = levelFromSlug(second) ? second : levels[0].slug;
  const base = `/${code}/${levelSlug}`;

  const primary = [
    { href: `/${code}`, label: "Home", Icon: HomeIcon, exact: true },
    { href: `${base}/pad`, label: language.ui.lessons, Icon: PathIcon },
    { href: `${base}/woorden`, label: "Woorden", Icon: WordsIcon },
  ];

  const overflow = [
    { href: `/${code}/review`, label: language.ui.review, Icon: ReviewIcon },
    { href: `${base}/grammatica`, label: "Grammatica", Icon: GrammarIcon },
    { href: `${base}/bouwen`, label: "Bouwen", Icon: BuildIcon },
    { href: `${base}/werkwoorden`, label: "Vervoeging", Icon: VerbIcon },
    { href: `/${code}/klanken`, label: language.ui.sounds, Icon: SoundIcon },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const overflowActive = overflow.some((item) => isActive(item.href));
  const gesprekActive = pathname.startsWith(`/${code}/gesprek`);

  const navItem = (
    href: string,
    label: string,
    Icon: (props: { className?: string }) => React.ReactElement,
    active: boolean
  ) => (
    <Link
      key={href}
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors ${
        active ? "bg-accent-soft text-accent" : "text-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="max-w-full truncate px-1 text-[10px] font-medium leading-none">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Transparent catcher: an outside tap collapses the pill, no dimming. */}
      {open && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-safe">
        <div className="mx-auto mb-3 flex max-w-sm items-end gap-2.5">
          <div
            className={`pointer-events-auto flex-1 border border-line bg-[var(--shell)] shadow-lg backdrop-blur-xl transition-[border-radius] ${
              open ? "rounded-3xl" : "rounded-full"
            }`}
          >
            {open && (
              <div className="fade-in space-y-1 p-1.5 pb-0">
                {switchable.length > 1 && (
                  <div className="flex gap-1 px-1 pb-1">
                    {switchable.map((other) => (
                      <Link
                        key={other.code}
                        href={`/${other.code}`}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-medium transition-colors ${
                          other.code === code
                            ? "bg-accent-soft text-accent"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        <span aria-hidden>{other.flag}</span>
                        {other.name}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-1">
                  {overflow.map((item) => navItem(item.href, item.label, item.Icon, isActive(item.href)))}
                </div>
                <div className="mx-2 border-t border-line pt-1" />
              </div>
            )}

            <nav aria-label="Main" className="flex items-stretch p-1.5">
              {primary.map((item) => navItem(item.href, item.label, item.Icon, isActive(item.href, item.exact)))}

              <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-label={open ? "Close menu" : "More sections"}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors ${
                  open || overflowActive ? "bg-accent-soft text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {open ? <CloseIcon className="h-5 w-5" /> : <MoreIcon className="h-5 w-5" />}
                <span className="text-[10px] font-medium leading-none">{open ? "Sluit" : "Meer"}</span>
              </button>
            </nav>
          </div>

          {/* The tutor, on its own — a compose button, not a tab. */}
          <Link
            href={`/${code}/gesprek`}
            aria-label={language.ui.conversation}
            aria-current={gesprekActive ? "page" : undefined}
            className={`pointer-events-auto grid h-14 w-14 shrink-0 place-items-center rounded-full shadow-lg transition-transform active:scale-95 ${
              gesprekActive
                ? "bg-[#b8410b] text-white ring-2 ring-accent ring-offset-2 ring-offset-[var(--background)]"
                : "bg-accent text-white"
            }`}
          >
            <ChatIcon className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </>
  );
}
