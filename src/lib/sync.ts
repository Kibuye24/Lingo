"use client";

import { getSupabase } from "./supabase";
import { loadProgress, replaceProgress, type Progress, type PhraseRecord } from "./progress";
import { listProfiles, progressKeyFor, type Profile } from "./profiles";

/**
 * Cloud sync — local-first, with the network as a bonus rather than a
 * dependency.
 *
 * The rules that matter:
 *
 * * **Local is the write path.** Practising writes to localStorage
 *   immediately and never awaits the network, so the app stays instant and
 *   works on a plane. Sync happens after the fact.
 *
 * * **Per-phrase state is last-write-wins** on `updatedAt`. If you practise
 *   the same phrase on a laptop and a phone, the later attempt wins. The data
 *   is small and the stakes are low, so this is the right amount of
 *   machinery — not CRDTs.
 *
 * * **Completions and practice days are unioned, never overwritten.** You
 *   cannot un-finish a lesson or un-practise a day, so merging can only ever
 *   add. This is what stops a two-device setup from silently eating a streak,
 *   which last-write-wins on the whole blob would do.
 */

interface RemotePhraseRow {
  profile_id: string;
  phrase_key: string;
  lang: string;
  phrase_id: string;
  lesson_id: string;
  streak: number;
  best_score: number;
  last_score: number;
  attempts: number;
  due_at: string;
  last_seen_at: string;
  updated_at: string;
}

const EPOCH = "1970-01-01T00:00:00.000Z";

function stamp(record: PhraseRecord): string {
  // Records written before sync existed have no timestamp; treat them as
  // oldest so a synced device's newer data wins rather than being clobbered.
  return record.updatedAt ?? EPOCH;
}

function mergeProgress(local: Progress, remote: Progress): Progress {
  const phrases: Record<string, PhraseRecord> = { ...local.phrases };

  for (const [key, incoming] of Object.entries(remote.phrases)) {
    const mine = phrases[key];
    if (!mine || stamp(incoming) > stamp(mine)) {
      phrases[key] = incoming;
    }
  }

  return {
    phrases,
    lessonsCompleted: [...new Set([...local.lessonsCompleted, ...remote.lessonsCompleted])],
    activeDays: [...new Set([...local.activeDays, ...remote.activeDays])].sort(),
  };
}

/** Read one profile's progress straight from localStorage, bypassing the active-profile key. */
function readProfileProgress(profileId: string): Progress {
  if (typeof window === "undefined") {
    return { phrases: {}, lessonsCompleted: [], activeDays: [] };
  }
  try {
    const raw = window.localStorage.getItem(progressKeyFor(profileId));
    if (!raw) return { phrases: {}, lessonsCompleted: [], activeDays: [] };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      phrases: parsed.phrases ?? {},
      lessonsCompleted: parsed.lessonsCompleted ?? [],
      activeDays: parsed.activeDays ?? [],
    };
  } catch {
    return { phrases: {}, lessonsCompleted: [], activeDays: [] };
  }
}

function writeProfileProgress(profileId: string, progress: Progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(progressKeyFor(profileId), JSON.stringify(progress));
  } catch {
    // Storage full — the in-memory session still works.
  }
}

async function pullProfile(userId: string, profileId: string): Promise<Progress> {
  const supabase = getSupabase();
  const emptyProgress: Progress = { phrases: {}, lessonsCompleted: [], activeDays: [] };
  if (!supabase) return emptyProgress;

  const [phraseRes, lessonRes, dayRes] = await Promise.all([
    supabase
      .from("phrase_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("profile_id", profileId),
    supabase
      .from("lesson_completions")
      .select("lesson_key")
      .eq("user_id", userId)
      .eq("profile_id", profileId),
    supabase.from("active_days").select("day").eq("user_id", userId).eq("profile_id", profileId),
  ]);

  const phrases: Record<string, PhraseRecord> = {};
  for (const row of (phraseRes.data ?? []) as RemotePhraseRow[]) {
    phrases[row.phrase_key] = {
      phraseId: row.phrase_id,
      lessonId: row.lesson_id,
      lang: row.lang,
      streak: row.streak,
      bestScore: row.best_score,
      lastScore: row.last_score,
      attempts: row.attempts,
      dueAt: row.due_at,
      lastSeenAt: row.last_seen_at,
      updatedAt: row.updated_at,
    };
  }

  return {
    phrases,
    lessonsCompleted: (lessonRes.data ?? []).map((r) => (r as { lesson_key: string }).lesson_key),
    activeDays: (dayRes.data ?? []).map((r) => (r as { day: string }).day),
  };
}

async function pushProfile(userId: string, profileId: string, progress: Progress) {
  const supabase = getSupabase();
  if (!supabase) return;

  const phraseRows = Object.entries(progress.phrases).map(([phraseKey, record]) => ({
    user_id: userId,
    profile_id: profileId,
    phrase_key: phraseKey,
    lang: record.lang,
    phrase_id: record.phraseId,
    lesson_id: record.lessonId,
    streak: record.streak,
    best_score: record.bestScore,
    last_score: record.lastScore,
    attempts: record.attempts,
    due_at: record.dueAt,
    last_seen_at: record.lastSeenAt,
    updated_at: stamp(record),
  }));

  const lessonRows = progress.lessonsCompleted.map((lessonKey) => ({
    user_id: userId,
    profile_id: profileId,
    lesson_key: lessonKey,
  }));

  const dayRows = progress.activeDays.map((day) => ({
    user_id: userId,
    profile_id: profileId,
    day,
  }));

  await Promise.all([
    phraseRows.length
      ? supabase
          .from("phrase_progress")
          .upsert(phraseRows, { onConflict: "user_id,profile_id,phrase_key" })
      : Promise.resolve(),
    lessonRows.length
      ? supabase
          .from("lesson_completions")
          .upsert(lessonRows, { onConflict: "user_id,profile_id,lesson_key" })
      : Promise.resolve(),
    dayRows.length
      ? supabase.from("active_days").upsert(dayRows, { onConflict: "user_id,profile_id,day" })
      : Promise.resolve(),
  ]);
}

async function syncProfiles(userId: string, local: Profile[]): Promise<Profile[]> {
  const supabase = getSupabase();
  if (!supabase) return local;

  const { data } = await supabase.from("profiles").select("*").eq("user_id", userId);

  const remote: Profile[] = (data ?? []).map((row) => {
    const r = row as { profile_id: string; name: string; emoji: string; created_at: string };
    return { id: r.profile_id, name: r.name, emoji: r.emoji, createdAt: r.created_at };
  });

  const byId = new Map(remote.map((p) => [p.id, p]));
  for (const profile of local) byId.set(profile.id, profile);
  const merged = [...byId.values()];

  await supabase.from("profiles").upsert(
    merged.map((p) => ({
      user_id: userId,
      profile_id: p.id,
      name: p.name,
      emoji: p.emoji,
      created_at: p.createdAt,
    })),
    { onConflict: "user_id,profile_id" }
  );

  if (typeof window !== "undefined") {
    window.localStorage.setItem("lingo.profiles.v1", JSON.stringify(merged));
    window.dispatchEvent(new Event("lingo:profile-changed"));
  }
  return merged;
}

/**
 * Full two-way sync for every profile on this device.
 *
 * Pull → merge → write locally → push the merged result, so both sides end up
 * holding the same union. Safe to call repeatedly; it converges.
 */
export async function syncNow(): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: "Sync is not configured." };

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return { ok: false, error: "Not signed in." };

  try {
    const profiles = await syncProfiles(userId, listProfiles());

    for (const profile of profiles) {
      const local = readProfileProgress(profile.id);
      const remote = await pullProfile(userId, profile.id);
      const merged = mergeProgress(local, remote);

      writeProfileProgress(profile.id, merged);
      await pushProfile(userId, profile.id, merged);
    }

    // Re-read through the normal path so subscribed components re-render.
    replaceProgress(loadProgress());
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Sync failed." };
  }
}
