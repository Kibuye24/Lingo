"use client";

import { useSyncExternalStore } from "react";
import { getSupabase, syncConfigured } from "./supabase";
import { setCurrentIdentity } from "./identity";
import {
  loadProgress,
  replaceProgress,
  subscribeProgress,
  type PhraseRecord,
  type Progress,
} from "./progress";
import { pullLanguages, pullProgress, pushProgress } from "./cloud";
import { setSelectedLanguagesLocal } from "./languagePrefs";

/**
 * Session state and the wiring that makes progress multi-tenant.
 *
 * One module store holds the current user so every component reads the same
 * session through `useSession()` rather than each subscribing to Supabase.
 * `startAuth()` runs once at the top of the tree: it points the progress store
 * at the signed-in user, pulls their data down, and pushes changes back — with
 * no "sync" button anywhere, because being signed in is the whole mechanism.
 */

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  /** False until the first session check resolves — used to hold redirects. */
  ready: boolean;
  /** Whether auth is even configured for this build. */
  configured: boolean;
}

let state: AuthState = { user: null, ready: !syncConfigured(), configured: syncConfigured() };
const listeners = new Set<() => void>();

function set(next: Partial<AuthState>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

function snapshot(): AuthState {
  return state;
}

const serverState: AuthState = { user: null, ready: false, configured: false };

export function useSession(): AuthState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    snapshot,
    () => serverState
  );
}

// ── Actions ──────────────────────────────────────────────────────────────

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) return { error: "Auth is not configured." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message };
}

export async function signUpWithPassword(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) return { error: "Auth is not configured.", needsConfirmation: false };
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message, needsConfirmation: !error && !data.session };
}

export async function signOut() {
  const supabase = getSupabase();
  await supabase?.auth.signOut();
}

// ── Bootstrap ────────────────────────────────────────────────────────────

const EPOCH = "1970-01-01T00:00:00.000Z";

function mergeProgress(local: Progress, remote: Progress): Progress {
  const phrases: Record<string, PhraseRecord> = { ...local.phrases };
  for (const [key, incoming] of Object.entries(remote.phrases)) {
    const mine = phrases[key];
    if (!mine || (incoming.updatedAt ?? EPOCH) > (mine.updatedAt ?? EPOCH)) {
      phrases[key] = incoming;
    }
  }
  return {
    phrases,
    lessonsCompleted: [...new Set([...local.lessonsCompleted, ...remote.lessonsCompleted])],
    activeDays: [...new Set([...local.activeDays, ...remote.activeDays])].sort(),
    testsPassed: [...new Set([...local.testsPassed, ...remote.testsPassed])],
  };
}

let started = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;

async function adopt(user: AuthUser) {
  set({ user, ready: true });
  setCurrentIdentity(user.id);

  // Bring the account's data down, union with anything held locally under this
  // user's key, write it back locally, and push the union so both converge.
  const remote = await pullProgress(user.id);
  const merged = mergeProgress(loadProgress(), remote);
  replaceProgress(merged);
  void pushProgress(user.id, merged);

  const langs = await pullLanguages(user.id);
  if (langs.length) setSelectedLanguagesLocal(langs);
}

/** Idempotent; call once from a client component mounted at the app root. */
export function startAuth() {
  const supabase = getSupabase();
  if (!supabase || started) {
    if (!supabase) set({ ready: true });
    return;
  }
  started = true;

  supabase.auth.getSession().then(({ data }) => {
    const session = data.session;
    if (session) void adopt({ id: session.user.id, email: session.user.email ?? null });
    else set({ user: null, ready: true });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      void adopt({ id: session.user.id, email: session.user.email ?? null });
    } else {
      set({ user: null, ready: true });
      setCurrentIdentity("guest");
    }
  });

  // Background push: whenever progress changes and someone is signed in, save
  // it a beat later. Debounced so a burst of attempts is one write.
  subscribeProgress(() => {
    if (!state.user) return;
    if (pushTimer) clearTimeout(pushTimer);
    const userId = state.user.id;
    pushTimer = setTimeout(() => void pushProgress(userId, loadProgress()), 1200);
  });
}
