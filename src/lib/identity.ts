"use client";

/**
 * Who the progress store belongs to.
 *
 * One tenant = one signed-in user. The active identity is the Supabase user id
 * once signed in, or "guest" when auth isn't configured (local dev) — never a
 * shared device profile. Progress is namespaced by it, so two accounts on the
 * same browser never see each other's data, and Row Level Security enforces the
 * same boundary server-side.
 */

const GUEST = "guest";

let current = GUEST;
const listeners = new Set<() => void>();

export function progressKeyFor(id: string): string {
  return `lingo.progress.v2.${id}`;
}

export function currentIdentity(): string {
  return current;
}

export function setCurrentIdentity(id: string) {
  const next = id || GUEST;
  if (next === current) return;
  current = next;
  for (const listener of listeners) listener();
  if (typeof window !== "undefined") {
    // progress.ts caches per key; nudge it to re-read for the new tenant.
    window.dispatchEvent(new Event("lingo:identity-changed"));
  }
}

export function subscribeIdentity(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
