"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StreakCalendar from "./StreakCalendar";
import { BuildIcon, FlameIcon, GrammarIcon, ReviewIcon, WordsIcon } from "./Icons";
import { useHydrated, useProgress } from "@/lib/hooks";
import { useSession } from "@/lib/auth";
import { duePhraseIds, streakDays, weekActivity } from "@/lib/progress";
import { contentForLevel, levels, type Level } from "@/content/levels";
import type { LanguageConfig } from "@/lib/types";

/**
 * The home screen: where you are, what's warm, and one obvious thing to do.
 *
 * It replaced a menu of section links — those all live in the bottom bar now,
 * so repeating them here was wasted space. What a learner actually wants on
 * opening the app is the streak they don't want to break and the lesson they
 * were halfway through.
 */
export default function HomeDashboard({ language }: { language: LanguageConfig }) {
  const hydrated = useHydrated();
  const progress = useProgress();
  const { user } = useSession();

  const level: Level = "A1";
  const levelSlug = levels.find((l) => l.id === level)!.slug;
  const base = `/${language.code}/${levelSlug}`;
  const { lessons } = useMemo(() => contentForLevel(language, level), [language]);

  const emailName = user?.email?.split("@")[0] ?? "";
  const name = emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : "";
  const done = (id: string) => progress.lessonsCompleted.includes(`${language.code}:${id}`);

  const completed = hydrated ? lessons.filter((lesson) => done(lesson.id)).length : 0;
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
  const nextLesson = hydrated ? (lessons.find((lesson) => !done(lesson.id)) ?? lessons[0]) : lessons[0];

  const streak = hydrated ? streakDays(progress) : 0;
  const week = hydrated ? weekActivity(progress) : [];
  const due = hydrated ? duePhraseIds(progress, language.code).length : 0;
  const [calendarOpen, setCalendarOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">{today}</p>
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {name ? `Hoi, ${name}!` : "Hoi!"}
          </h1>
        </div>
        <span
          aria-hidden
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-xl"
          title={language.nameEn}
        >
          {language.flag}
        </span>
      </div>

      {/* Streak */}
      <section className="rounded-3xl bg-gradient-to-br from-accent to-[#b8410b] p-5 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/15">
            <div className="flex flex-col items-center leading-none">
              <FlameIcon className="h-6 w-6" />
              <span className="mt-0.5 text-xl font-bold">{streak}</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-tight">
              {streak > 0
                ? `${streak} ${streak === 1 ? "dag" : "dagen"} op rij!`
                : "Begin je reeks vandaag"}
            </p>
            <p className="text-sm text-white/80">
              {streak > 0 ? "Elke dag telt." : "Practise once to start a streak."}
            </p>
          </div>
        </div>

        {!calendarOpen && (
          <div className="mt-4 flex justify-between gap-1">
            {week.map((day) => (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-sm ${
                    day.done ? "bg-white text-accent" : "border border-white/35 text-white/50"
                  }`}
                >
                  {day.done ? "✓" : ""}
                </span>
                <span className="text-[10px] text-white/75">{day.label}</span>
              </div>
            ))}
          </div>
        )}

        {calendarOpen && (
          <div className="mt-4">
            <StreakCalendar activeDays={progress.activeDays} />
          </div>
        )}

        <button
          onClick={() => setCalendarOpen((o) => !o)}
          aria-expanded={calendarOpen}
          className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-medium text-white/85"
        >
          {calendarOpen ? "Verberg kalender · Hide" : "Bekijk kalender · View calendar"}
          <span aria-hidden>{calendarOpen ? "▴" : "▾"}</span>
        </button>
      </section>

      {/* Continue */}
      {nextLesson && (
        <Link
          href={`/${language.code}/les/${nextLesson.id}`}
          className="block rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-accent"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {completed > 0 ? "Ga verder · Pick up where you left off" : "Begin hier · Start here"}
              </p>
              <p className="target mt-1 truncate text-xl font-semibold">{nextLesson.title}</p>
              <p className="truncate text-sm text-muted">{nextLesson.titleEn}</p>
            </div>
            <ProgressRing percent={percent} />
          </div>
          <p className="mt-3 text-sm text-muted">
            {completed} / {lessons.length} lessons · {nextLesson.phrases.length} phrases in this one
          </p>
        </Link>
      )}

      {/* Today's challenge */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Vandaag · Today
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <ChallengeCard
            href={`/${language.code}/review`}
            tone="warm"
            Icon={ReviewIcon}
            title={language.ui.review}
            sub={due > 0 ? `${due} due now` : "Nothing due"}
            dimmed={due === 0}
          />
          <ChallengeCard
            href={`${base}/woorden`}
            tone="cool"
            Icon={WordsIcon}
            title="Woorden"
            sub={`${language.vocabSets.length} word sets`}
          />
          <ChallengeCard
            href={`${base}/bouwen`}
            tone="cool"
            Icon={BuildIcon}
            title="Zinnen bouwen"
            sub="Build a sentence"
          />
          <ChallengeCard
            href={`${base}/grammatica`}
            tone="warm"
            Icon={GrammarIcon}
            title="Grammatica"
            sub={`${language.grammar.length} points`}
          />
        </div>
      </section>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative grid h-14 w-14 shrink-0 place-items-center">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--line)" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-xs font-semibold">{percent}%</span>
    </div>
  );
}

function ChallengeCard({
  href,
  title,
  sub,
  Icon,
  tone,
  dimmed,
}: {
  href: string;
  title: string;
  sub: string;
  Icon: (props: { className?: string }) => React.ReactElement;
  tone: "warm" | "cool";
  dimmed?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-2 rounded-2xl border border-line p-4 transition-colors hover:border-accent ${
        tone === "warm" ? "bg-accent-soft" : "bg-sunk"
      } ${dimmed ? "opacity-60" : ""}`}
    >
      <Icon className="h-6 w-6 text-accent" />
      <span className="target text-sm font-semibold leading-tight">{title}</span>
      <span className="text-xs text-muted">{sub}</span>
    </Link>
  );
}
