"use client";

/**
 * Local, named profiles — the answer to "family members want their own
 * progress" without standing up accounts or a database.
 *
 * If everyone already learns on their own phone or laptop, this changes
 * nothing: each device already has its own localStorage, so progress was
 * already separate. This only matters when several people share one device —
 * a single shared laptop — where "progress" used to mean whoever practised
 * last. Switching profiles just switches which storage key `progress.ts`
 * reads and writes.
 *
 * Deliberately not accounts: no login, no password, no server. Anyone using
 * the device can switch to anyone's profile. That's the right trade for a
 * household, not for anything where privacy between profiles matters.
 */

export interface Profile {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
}

const PROFILES_KEY = "lingo.profiles.v1";
const ACTIVE_KEY = "lingo.activeProfile.v1";
/** Pre-profiles progress store — migrated into the first profile, then retired. */
const LEGACY_PROGRESS_KEY = "lingo.progress.v1";

const AVATARS = ["🦊", "🐢", "🐸", "🦉", "🐧", "🐨", "🦁", "🐙", "🐝", "🦋"];

// A stable empty-array reference. useSyncExternalStore compares snapshots by
// identity (Object.is) — returning a fresh `[]` every call reads as "always
// changed" and React throws "getSnapshot should be cached" / loops forever.
const EMPTY_PROFILES: Profile[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function readRaw(): Profile[] {
  if (!isBrowser()) return EMPTY_PROFILES;
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY);
    return raw ? (JSON.parse(raw) as Profile[]) : EMPTY_PROFILES;
  } catch {
    return EMPTY_PROFILES;
  }
}

function writeRaw(profiles: Profile[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  invalidate();
}

/** Storage key `progress.ts` should read for a given profile. */
export function progressKeyFor(profileId: string): string {
  return `lingo.progress.v2.${profileId}`;
}

/**
 * Guarantees at least one profile exists. Runs once per session, lazily —
 * whichever profile function is called first triggers it.
 *
 * If a pre-profiles install has progress under the old flat key, that data
 * moves into the new default profile so nobody's history disappears the
 * moment this feature ships.
 */
function ensureProfiles(): Profile[] {
  const existing = readRaw();
  if (existing.length) return existing;

  const profile: Profile = {
    id: randomId(),
    name: "Ik",
    emoji: AVATARS[0],
    createdAt: new Date().toISOString(),
  };
  writeRaw([profile]);
  window.localStorage.setItem(ACTIVE_KEY, profile.id);

  try {
    const legacy = window.localStorage.getItem(LEGACY_PROGRESS_KEY);
    if (legacy) {
      window.localStorage.setItem(progressKeyFor(profile.id), legacy);
      window.localStorage.removeItem(LEGACY_PROGRESS_KEY);
    }
  } catch {
    // Migration is best-effort — a fresh profile is still a working profile.
  }

  return [profile];
}

// Caches `ensureProfiles()`'s result so repeated calls (React re-renders in
// particular, via useSyncExternalStore) get the same array reference until
// something actually changes. `invalidate()` clears it on every write.
let cache: Profile[] | null = null;

export function listProfiles(): Profile[] {
  if (!isBrowser()) return EMPTY_PROFILES;
  if (!cache) cache = ensureProfiles();
  return cache;
}

export function activeProfileId(): string {
  if (!isBrowser()) return "";
  const profiles = listProfiles();
  const stored = window.localStorage.getItem(ACTIVE_KEY);
  if (stored && profiles.some((p) => p.id === stored)) return stored;
  window.localStorage.setItem(ACTIVE_KEY, profiles[0].id);
  return profiles[0].id;
}

export function setActiveProfile(id: string) {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACTIVE_KEY, id);
  invalidate();
  // progress.ts's cache is keyed by a module-level "current profile" it reads
  // lazily, so it needs its own nudge to know the active profile just moved.
  window.dispatchEvent(new Event("lingo:profile-changed"));
}

export function addProfile(name: string): Profile {
  const profiles = listProfiles();
  const profile: Profile = {
    id: randomId(),
    name: name.trim() || "Nieuw profiel",
    emoji: AVATARS[profiles.length % AVATARS.length],
    createdAt: new Date().toISOString(),
  };
  writeRaw([...profiles, profile]);
  return profile;
}

/** Always keeps at least one profile — the app has nowhere to store progress without one. */
export function removeProfile(id: string) {
  const profiles = listProfiles();
  if (profiles.length <= 1) return;

  const remaining = profiles.filter((p) => p.id !== id);
  writeRaw(remaining);
  try {
    window.localStorage.removeItem(progressKeyFor(id));
  } catch {
    // Ignore — an orphaned progress key costs nothing.
  }
  if (activeProfileId() === id) setActiveProfile(remaining[0].id);
}

export function renameProfile(id: string, name: string) {
  const profiles = listProfiles();
  writeRaw(profiles.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)));
}

// ── External store ──────────────────────────────────────────────────────────

const listeners = new Set<() => void>();

function invalidate() {
  cache = null;
  for (const listener of listeners) listener();
}

export function subscribeProfiles(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function serverProfiles(): Profile[] {
  return EMPTY_PROFILES;
}

export function serverActiveProfileId(): string {
  return "";
}
