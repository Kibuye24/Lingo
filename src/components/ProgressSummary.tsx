"use client";

import Link from "next/link";
import { useHydrated, useProgress } from "@/lib/hooks";
import { duePhraseIds, streakDays } from "@/lib/progress";
import type { LanguageConfig } from "@/lib/types";

export default function ProgressSummary({ language }: { language: LanguageConfig }) {
  const hydrated = useHydrated();
  const progress = useProgress();
  const { code, lessons } = language;

  // Hold the space rather than flashing "nothing practised yet" at a returner.
  if (!hydrated) return <div className="h-[74px]" />;

  const mine = Object.values(progress.phrases).filter((p) => p.lang === code);
  if (!mine.length) {
    const first = lessons[0];
    return (
      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
        Nothing practised yet. Start with{" "}
        <Link
          href={`/${code}/${first.level.toLowerCase()}/pad`}
          className="font-medium text-accent hover:underline"
        >
          the learning path
        </Link>{" "}
        — about five minutes.
      </p>
    );
  }

  const due = duePhraseIds(progress, code).length;
  const streak = streakDays(progress);
  const solid = mine.filter((p) => p.streak >= 3).length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Stat label={mine.length === 1 ? "phrase practised" : "phrases practised"} value={mine.length} />
      <Stat label="held solid" value={solid} />
      <Stat label="day streak" value={streak} />
      {due > 0 && (
        <Link
          href={`/${code}/review`}
          className="rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          {due} due for review →
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <span className="text-xl font-semibold">{value}</span>{" "}
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}
