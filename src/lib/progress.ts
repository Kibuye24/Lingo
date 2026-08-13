"use client";

import { activeProfileId, progressKeyFor } from "./profiles";

/**
 * Local progress store with a light spaced-repetition schedule.
 *
 * Everything lives in localStorage — no account, no backend, works offline.
 * The intervals are a trimmed SM-2: enough to resurface a phrase before it
 * rots, without pretending to more precision than we have.
 *
 * Scoped to the active profile (see profiles.ts) via the storage key alone —
 * every function here keeps its original signature, so switching a household
 * onto named profiles touched this file and nothing else.
 */

function key(): string {
  return progressKeyFor(activeProfileId());
}

/** Days until the next review, indexed by how many times it's been right. */
const INTERVALS = [0, 1, 3, 7, 16, 35];

export interface PhraseRecord {
  phraseId: string;
  lessonId: string;
  /** Language this phrase belongs to. */
  lang: string;
  /** Consecutive successful reviews. */
  streak: number;
  bestScore: number;
  lastScore: number;
  attempts: number;
  /** ISO date string. */
  dueAt: string;
  lastSeenAt: string;
  /**
   * Full ISO timestamp of the last write. Drives last-write-wins when the
   * same phrase was practised on two devices. Optional for records written
   * before sync existed — those are treated as oldest.
   */
  updatedAt?: string;
}

export interface Progress {
  /** Keyed `${lang}:${phraseId}` so ids never collide across languages. */
  phrases: Record<string, PhraseRecord>;
  /** Entries are `${lang}:${lessonId}`. */
  lessonsCompleted: string[];
  /** ISO dates on which at least one thing was practised. */
  activeDays: string[];
}

const empty: Progress = { phrases: {}, lessonsCompleted: [], activeDays: [] };

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadProgress(): Progress {
  if (!isBrowser()) return empty;
  try {
    const raw = window.localStorage.getItem(key());
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      phrases: parsed.phrases ?? {},
      lessonsCompleted: parsed.lessonsCompleted ?? [],
      activeDays: parsed.activeDays ?? [],
    };
  } catch {
    return empty;
  }
}

// ── External store ──────────────────────────────────────────────────────────
// localStorage is an external system, so components subscribe to it rather than
// copying it into state. The snapshot is cached because `useSyncExternalStore`
// requires a referentially stable value between changes.

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function invalidate() {
  cache = null;
  for (const listener of listeners) listener();
}

/** Snapshot for the current tab. Stable until progress actually changes. */
export function progressSnapshot(): Progress {
  if (!cache) cache = loadProgress();
  return cache;
}

/** Server render has no storage; every component treats this as "empty". */
export function serverProgressSnapshot(): Progress {
  return empty;
}

export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener);
  if (isBrowser() && listeners.size === 1) {
    window.addEventListener("storage", invalidate);
    // Fired by profiles.ts when the active profile changes — a different
    // profile means different progress, so any mounted useProgress() must
    // re-read rather than keep showing the previous profile's cache.
    window.addEventListener("lingo:profile-changed", invalidate);
  }
  return () => {
    listeners.delete(listener);
    if (isBrowser() && listeners.size === 0) {
      window.removeEventListener("storage", invalidate);
      window.removeEventListener("lingo:profile-changed", invalidate);
    }
  };
}

function save(progress: Progress) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key(), JSON.stringify(progress));
  } catch {
    // Storage full or blocked — practice still works, it just won't persist.
  }
  invalidate();
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Record one spoken attempt and reschedule the phrase. */
export function recordAttempt(
  lang: string,
  phraseId: string,
  lessonId: string,
  score: number
): PhraseRecord {
  const progress = loadProgress();
  const key = `${lang}:${phraseId}`;
  const existing = progress.phrases[key];
  const passed = score >= 65;

  const streak = passed ? Math.min((existing?.streak ?? 0) + 1, INTERVALS.length - 1) : 0;

  const record: PhraseRecord = {
    phraseId,
    lessonId,
    lang,
    streak,
    bestScore: Math.max(existing?.bestScore ?? 0, score),
    lastScore: score,
    attempts: (existing?.attempts ?? 0) + 1,
    dueAt: addDays(INTERVALS[streak]),
    lastSeenAt: today(),
    updatedAt: new Date().toISOString(),
  };

  progress.phrases[key] = record;
  if (!progress.activeDays.includes(today())) progress.activeDays.push(today());
  save(progress);
  return record;
}

export function markLessonComplete(lang: string, lessonId: string) {
  const progress = loadProgress();
  const key = `${lang}:${lessonId}`;
  if (!progress.lessonsCompleted.includes(key)) {
    progress.lessonsCompleted.push(key);
    save(progress);
  }
}

/**
 * Overwrite the whole local store — used by the sync layer after merging
 * remote state in. Goes through `save()` so subscribers re-render.
 */
export function replaceProgress(progress: Progress) {
  save(progress);
}

export function resetProgress() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key());
  invalidate();
}

/** Phrase ids due for review today or overdue, for one language. */
export function duePhraseIds(progress: Progress, lang: string): string[] {
  const now = today();
  return Object.values(progress.phrases)
    .filter((record) => record.lang === lang && record.dueAt <= now)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt) || a.lastScore - b.lastScore)
    .map((record) => record.phraseId);
}

/** Consecutive days of practice ending today or yesterday. */
export function streakDays(progress: Progress): number {
  if (!progress.activeDays.length) return 0;
  const days = [...progress.activeDays].sort().reverse();
  const cursor = new Date();
  const iso = () => cursor.toISOString().slice(0, 10);

  if (days[0] !== iso()) {
    cursor.setDate(cursor.getDate() - 1);
    if (days[0] !== iso()) return 0;
  }

  let count = 0;
  for (const day of days) {
    if (day === iso()) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (day < iso()) {
      break;
    }
  }
  return count;
}

/**
 * The last seven days, oldest first, flagged for whether anything was
 * practised — the data behind the Mon–Sun dots on the home screen.
 */
export function weekActivity(progress: Progress): { day: string; label: string; done: boolean }[] {
  const labels = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
  const active = new Set(progress.activeDays);
  const out: { day: string; label: string; done: boolean }[] = [];

  for (let back = 6; back >= 0; back--) {
    const date = new Date();
    date.setDate(date.getDate() - back);
    const iso = date.toISOString().slice(0, 10);
    out.push({ day: iso, label: labels[date.getDay()], done: active.has(iso) });
  }
  return out;
}
