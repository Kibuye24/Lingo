"use client";

import { getSupabase } from "./supabase";
import type { PhraseRecord, Progress } from "./progress";

/**
 * The Supabase side of a user's data — read on sign-in, written in the
 * background as they practise.
 *
 * No merge engine and no user-facing "sync": one account is one tenant, its
 * rows are Row-Level-Security-scoped to `auth.uid()`, and writes are simple
 * upserts. Each account has exactly one learner, stored under a fixed
 * `profile_id`.
 */

const PROFILE = "me";

interface RemotePhraseRow {
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

export async function pullProgress(userId: string): Promise<Progress> {
  const supabase = getSupabase();
  const emptyProgress: Progress = { phrases: {}, lessonsCompleted: [], activeDays: [], testsPassed: [] };
  if (!supabase) return emptyProgress;

  const [phraseRes, lessonRes, dayRes, testRes] = await Promise.all([
    supabase.from("phrase_progress").select("*").eq("user_id", userId).eq("profile_id", PROFILE),
    supabase.from("lesson_completions").select("lesson_key").eq("user_id", userId).eq("profile_id", PROFILE),
    supabase.from("active_days").select("day").eq("user_id", userId).eq("profile_id", PROFILE),
    // Tolerate the table not existing yet (migration 0003 not applied).
    supabase.from("unit_tests").select("test_key").eq("user_id", userId).eq("profile_id", PROFILE),
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
    testsPassed: (testRes.data ?? []).map((r) => (r as { test_key: string }).test_key),
  };
}

export async function pushProgress(userId: string, progress: Progress) {
  const supabase = getSupabase();
  if (!supabase) return;

  const phraseRows = Object.entries(progress.phrases).map(([phraseKey, record]) => ({
    user_id: userId,
    profile_id: PROFILE,
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
    updated_at: record.updatedAt ?? new Date().toISOString(),
  }));

  const lessonRows = progress.lessonsCompleted.map((lesson_key) => ({
    user_id: userId,
    profile_id: PROFILE,
    lesson_key,
  }));

  const dayRows = progress.activeDays.map((day) => ({ user_id: userId, profile_id: PROFILE, day }));

  const testRows = progress.testsPassed.map((test_key) => ({
    user_id: userId,
    profile_id: PROFILE,
    test_key,
  }));

  await Promise.all([
    phraseRows.length
      ? supabase.from("phrase_progress").upsert(phraseRows, { onConflict: "user_id,profile_id,phrase_key" })
      : Promise.resolve(),
    lessonRows.length
      ? supabase.from("lesson_completions").upsert(lessonRows, { onConflict: "user_id,profile_id,lesson_key" })
      : Promise.resolve(),
    dayRows.length
      ? supabase.from("active_days").upsert(dayRows, { onConflict: "user_id,profile_id,day" })
      : Promise.resolve(),
    // Ignores the error if migration 0003 hasn't been applied yet.
    testRows.length
      ? supabase.from("unit_tests").upsert(testRows, { onConflict: "user_id,profile_id,test_key" })
      : Promise.resolve(),
    pushStats(userId, progress),
  ]);
}

async function pushStats(userId: string, progress: Progress) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { streakDays } = await import("./progress");
  const current = streakDays(progress);

  const { data: existing } = await supabase
    .from("profile_stats")
    .select("longest_streak")
    .eq("user_id", userId)
    .eq("profile_id", PROFILE)
    .maybeSingle();

  const longest = Math.max(current, (existing as { longest_streak?: number } | null)?.longest_streak ?? 0);

  await supabase.from("profile_stats").upsert(
    {
      user_id: userId,
      profile_id: PROFILE,
      current_streak: current,
      longest_streak: longest,
      lessons_completed: progress.lessonsCompleted.length,
      phrases_practised: Object.keys(progress.phrases).length,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,profile_id" }
  );
}

// ── Chosen languages ────────────────────────────────────────────────────────

export async function pullLanguages(userId: string): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("user_languages").select("lang_code").eq("user_id", userId);
  return (data ?? []).map((r) => (r as { lang_code: string }).lang_code);
}

export async function pushLanguages(userId: string, codes: string[]) {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.from("user_languages").delete().eq("user_id", userId);
  if (codes.length) {
    await supabase
      .from("user_languages")
      .upsert(codes.map((lang_code) => ({ user_id: userId, lang_code })));
  }
}
