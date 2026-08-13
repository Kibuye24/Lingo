"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileSwitcher from "./ProfileSwitcher";
import ThemeToggle from "./ThemeToggle";
import { getLanguage } from "@/content";

/**
 * Slim top bar — identity and settings only.
 *
 * All navigation moved to the bottom tab bar, where thumbs are. This keeps the
 * top reserved for the two things that aren't destinations: which theme you're
 * in, and who's learning.
 */
export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [, code = ""] = pathname.split("/");
  const language = getLanguage(code);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[var(--shell)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-2.5">
        <Link
          href={language ? `/${language.code}` : "/"}
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-sm text-white"
          >
            L
          </span>
          <span>{language ? language.name : "Lingo"}</span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <ProfileSwitcher />
        </div>
      </div>
    </header>
  );
}
