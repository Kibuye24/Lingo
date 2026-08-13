"use client";

import { getSupabase } from "./supabase";

/**
 * Which languages the learner has chosen to study.
 *
 * Local-first like everything else: the choice lives in localStorage and works
 * with no account. When signed in it also syncs to `user_languages`, so the
 * Meer switcher shows the same set on every device.
 *
 * An empty selection means "not chosen yet" — callers treat that as "offer all
 * of them", so a fresh or guest install still works before onboarding.
 */

const KEY = "lingo.languages.v1";

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

const EMPTY: string[] = [];

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

function write(codes: string[]) {
  if (!isBrowser()) return;
  const unique = [...new Set(codes)];
  window.localStorage.setItem(KEY, JSON.stringify(unique));
  cache = unique;
  for (const listener of listeners) listener();
  void pushRemote(unique);
}

export function setSelectedLanguages(codes: string[]) {
  write(codes);
}

export function toggleLanguage(code: string) {
  const current = selectedLanguages();
  write(
    current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
  );
}

export function subscribeLanguages(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ── Cloud sync ────────────────────────────────────────────────────────────

async function currentUserId(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

async function pushRemote(codes: string[]) {
  const supabase = getSupabase();
  const userId = await currentUserId();
  if (!supabase || !userId) return;

  // Replace the set: clear rows this device dropped, then upsert the rest.
  await supabase.from("user_languages").delete().eq("user_id", userId);
  if (codes.length) {
    await supabase
      .from("user_languages")
      .upsert(codes.map((lang_code) => ({ user_id: userId, lang_code })));
  }
}

/** Merge the account's chosen languages into the local set (called after sign-in). */
export async function pullRemoteLanguages() {
  const supabase = getSupabase();
  const userId = await currentUserId();
  if (!supabase || !userId) return;

  const { data } = await supabase
    .from("user_languages")
    .select("lang_code")
    .eq("user_id", userId);

  const remote = (data ?? []).map((r) => (r as { lang_code: string }).lang_code);
  const merged = [...new Set([...selectedLanguages(), ...remote])];

  if (isBrowser()) {
    window.localStorage.setItem(KEY, JSON.stringify(merged));
    cache = merged;
    for (const listener of listeners) listener();
  }
  // Push the union back so both sides converge.
  await pushRemote(merged);
}
