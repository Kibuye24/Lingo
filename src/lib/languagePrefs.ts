"use client";

import { getSupabase } from "./supabase";
import { pushLanguages } from "./cloud";

/**
 * Which languages the learner has chosen to study.
 *
 * Kept in localStorage for instant reads and pushed to `user_languages` so the
 * choice follows the account across devices. An empty set means "not chosen
 * yet" — which is what routes the user into onboarding after they sign up.
 */

const KEY = "lingo.languages.v1";

const EMPTY: string[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

let cache: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return EMPTY;
  }
}

export function selectedLanguages(): string[] {
  if (!isBrowser()) return EMPTY;
  if (!cache) cache = read();
  return cache;
}

export function serverSelectedLanguages(): string[] {
  return EMPTY;
}

export function hasChosen(): boolean {
  return selectedLanguages().length > 0;
}

export function subscribeLanguages(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Write locally only — used when adopting the account's choice on sign-in. */
export function setSelectedLanguagesLocal(codes: string[]) {
  if (!isBrowser()) return;
  const unique = [...new Set(codes)];
  window.localStorage.setItem(KEY, JSON.stringify(unique));
  cache = unique;
  for (const listener of listeners) listener();
}

/** Set the choice and push it to the account (best-effort). */
export function setSelectedLanguages(codes: string[]) {
  setSelectedLanguagesLocal(codes);
  void syncToAccount([...new Set(codes)]);
}

export function toggleLanguage(code: string) {
  const current = selectedLanguages();
  setSelectedLanguages(
    current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
  );
}

async function syncToAccount(codes: string[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (userId) await pushLanguages(userId, codes);
}
