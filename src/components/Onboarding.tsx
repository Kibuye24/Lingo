"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { languages } from "@/content";
import { useHydrated, useSelectedLanguages } from "@/lib/hooks";
import { setSelectedLanguages, pullRemoteLanguages } from "@/lib/languagePrefs";
import { getSupabase, syncConfigured } from "@/lib/supabase";
import { syncNow } from "@/lib/sync";

/**
 * First-run screen: sign in (optional), then pick the languages to learn.
 *
 * Login is offered, not forced — signing in syncs progress and language choices
 * across devices, but the whole app still works as a guest. The chosen
 * languages are what the Meer switcher later offers, so this is also the
 * settings screen for "which languages am I studying".
 */
export default function Onboarding() {
  const router = useRouter();
  const hydrated = useHydrated();
  const chosen = useSelectedLanguages();
  const [picked, setPicked] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authState, setAuthState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [authMessage, setAuthMessage] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Seed the picker from whatever's already chosen once hydrated.
  useEffect(() => {
    if (hydrated) setPicked(chosen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const onSession = async (session: unknown) => {
      if (!session) return;
      await pullRemoteLanguages();
      await syncNow();
      setPicked(readLocalLanguages());
    };

    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
      void onSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user.email ?? null);
      void onSession(session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const toggle = (code: string) =>
    setPicked((current) =>
      current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
    );

  const start = () => {
    const codes = picked.length ? picked : [languages[0].code];
    setSelectedLanguages(codes);
    router.push(`/${codes[0]}`);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-md flex-col">
      <div className="pt-6">
        <span
          aria-hidden
          className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-2xl font-bold text-white"
        >
          L
        </span>
        <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight">
          Leer hardop.
          <span className="block text-muted">Learn out loud.</span>
        </h1>
        <p className="mt-3 text-muted">
          Whole phrases, spoken aloud and listened back. Pick a language — or a few.
        </p>
      </div>

      {/* Language multi-select */}
      <div className="mt-6 space-y-2.5">
        {languages.map((language) => {
          const on = picked.includes(language.code);
          return (
            <button
              key={language.code}
              onClick={() => toggle(language.code)}
              aria-pressed={on}
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${
                on ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-accent"
              }`}
            >
              <span aria-hidden className="text-3xl leading-none">
                {language.flag}
              </span>
              <span className="flex-1">
                <span className="target block text-lg font-semibold">{language.name}</span>
                <span className="block text-sm text-muted">{language.nameEn}</span>
              </span>
              <span
                aria-hidden
                className={`grid h-6 w-6 place-items-center rounded-full border-2 text-sm ${
                  on ? "border-accent bg-accent text-white" : "border-line"
                }`}
              >
                {on ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={start}
        className="mt-5 h-12 rounded-2xl bg-accent font-semibold text-white transition-transform active:scale-[0.99]"
      >
        {picked.length > 1 ? `Start met ${picked.length} talen` : "Beginnen · Start"}
      </button>

      {/* Login / Sign Up (optional) */}
      {syncConfigured() && (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-4">
          {userEmail ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted">Synced as</span>
              <span className="min-w-0 flex-1 truncate font-medium">{userEmail}</span>
              <button
                onClick={() => getSupabase()?.auth.signOut()}
                className="shrink-0 text-xs text-muted hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const supabase = getSupabase();
                if (!supabase || !email.trim() || !password) return;
                setAuthState("sending");
                setAuthMessage("");

                const { data, error } = isSignUp
                  ? await supabase.auth.signUp({
                      email: email.trim(),
                      password,
                    })
                  : await supabase.auth.signInWithPassword({
                      email: email.trim(),
                      password,
                    });

                if (error) {
                  setAuthState("error");
                  setAuthMessage(error.message);
                } else {
                  setAuthState("sent");
                  if (isSignUp && !data.session) {
                    setAuthMessage("Account created! Check your email if confirmation is required.");
                  }
                }
              }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {isSignUp ? "Create an account" : "Sign in to sync"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAuthMessage("");
                    setAuthState("idle");
                  }}
                  className="text-xs text-accent hover:underline font-medium"
                >
                  {isSignUp ? "Already have an account? Log in" : "Need an account? Sign up"}
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-10 w-full rounded-xl border border-line bg-background px-3 text-sm outline-none focus:border-accent"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="h-10 w-full rounded-xl border border-line bg-background px-3 text-sm outline-none focus:border-accent"
                />
              </div>
              <button
                type="submit"
                disabled={authState === "sending"}
                className="h-10 w-full rounded-xl bg-accent text-sm font-medium text-white disabled:opacity-50"
              >
                {authState === "sending"
                  ? "…"
                  : isSignUp
                  ? "Sign Up"
                  : "Log In"}
              </button>
              {authMessage && (
                <p className={`text-xs ${authState === "error" ? "text-bad" : "text-muted"}`}>
                  {authMessage}
                </p>
              )}
            </form>
          )}
        </div>
      )}

      <p className="mt-auto pt-8 text-center text-xs text-muted">
        Speech runs in your browser — no API keys, no quotas.
      </p>

      <noscript>
        <Link href="/nl" className="underline">
          Continue
        </Link>
      </noscript>
    </div>
  );
}

// Read helper that doesn't need the hook (used inside an async callback).
function readLocalLanguages(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("lingo.languages.v1");
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
