"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { languages } from "@/content";
import { useHydrated, useSelectedLanguages } from "@/lib/hooks";
import { setSelectedLanguages } from "@/lib/languagePrefs";

/**
 * Post-signup onboarding: choose the languages to learn.
 *
 * This is what the app opens on once someone has an account but hasn't picked
 * anything yet, and it doubles as the "change my languages" screen later. The
 * chosen set is what the Meer switcher offers — so picking is the whole job,
 * and there's nothing about accounts or syncing here.
 */
export default function Onboarding() {
  const router = useRouter();
  const hydrated = useHydrated();
  const chosen = useSelectedLanguages();
  const [picked, setPicked] = useState<string[]>([]);

  // Reflect existing choices once hydrated (also covers the "change" case),
  // without an effect: derive the shown state from the store until first tap.
  const [touched, setTouched] = useState(false);
  const selection = touched ? picked : hydrated ? chosen : [];

  const toggle = (code: string) => {
    const base = touched ? picked : chosen;
    setPicked(base.includes(code) ? base.filter((c) => c !== code) : [...base, code]);
    setTouched(true);
  };

  const start = () => {
    const codes = selection.length ? selection : [languages[0].code];
    setSelectedLanguages(codes);
    router.replace(`/${codes[0]}`);
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
          Welke talen?
          <span className="block text-muted">Which languages?</span>
        </h1>
        <p className="mt-3 text-muted">
          Pick one or more to learn. You can change this anytime.
        </p>
      </div>

      <div className="mt-6 space-y-2.5">
        {languages.map((language) => {
          const on = selection.includes(language.code);
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
        disabled={selection.length === 0}
        className="mt-5 h-12 rounded-2xl bg-accent font-semibold text-white transition-transform active:scale-[0.99] disabled:opacity-40"
      >
        {selection.length > 1 ? `Start met ${selection.length} talen` : "Beginnen · Start"}
      </button>
    </div>
  );
}
