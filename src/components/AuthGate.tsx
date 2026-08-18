"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { startAuth, useSession } from "@/lib/auth";
import { useHydrated, useSelectedLanguages } from "@/lib/hooks";

/**
 * The front door.
 *
 * Runs the auth bootstrap once, then routes the user to the right place:
 * signed out → the login page, signed in but no language chosen → onboarding,
 * otherwise the app. Protected content is held behind a splash until a
 * decision is made, so nothing flashes before a redirect.
 *
 * When auth isn't configured (local dev without keys) it steps out of the way
 * entirely and the app runs as a single guest.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, ready, configured } = useSession();
  const languages = useSelectedLanguages();
  const hydrated = useHydrated();
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  const onLogin = pathname === "/login";
  const onWelcome = pathname === "/welcome";
  const chosen = languages.length > 0;

  useEffect(() => {
    startAuth();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (configured) {
      if (!ready) return;
      if (!user) {
        if (!onLogin) router.replace("/login");
        return;
      }
      if (!chosen) {
        if (!onWelcome) router.replace("/welcome");
        return;
      }
      if (onLogin || pathname === "/") router.replace(`/${languages[0]}`);
      return;
    }

    // Guest build: no login, but still choose a language once.
    if (!chosen) {
      if (!onWelcome) router.replace("/welcome");
      return;
    }
    if (onLogin || pathname === "/") router.replace(`/${languages[0]}`);
  }, [hydrated, ready, user, chosen, languages, pathname, configured, onLogin, onWelcome, router]);

  // Decide whether the current page is allowed to show yet.
  let blocked = false;
  if (hydrated) {
    if (configured && ready) {
      if (!user) blocked = !onLogin;
      else if (!chosen) blocked = !onWelcome;
      else if (pathname === "/") blocked = true;
    } else if (configured && !ready) {
      blocked = !onLogin && !onWelcome;
    } else if (!chosen) {
      blocked = !onWelcome;
    } else if (pathname === "/") {
      blocked = true;
    }
  } else {
    blocked = pathname === "/";
  }

  if (blocked) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <span
          aria-hidden
          className="grid h-14 w-14 animate-pulse place-items-center rounded-2xl bg-accent text-2xl font-bold text-white"
        >
          L
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
