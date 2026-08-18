"use client";

import Link from "next/link";
import { useProgress, useHydrated } from "@/lib/hooks";
import { computeUnitStates } from "@/lib/gating";
import type { LanguageConfig, Lesson, Unit } from "@/lib/types";

interface Props {
  language: LanguageConfig;
  level: string;
  units: Unit[];
  lessons: Lesson[];
}

/**
 * A winding numbered path, module by module.
 *
 * Each module ends in a consolidation test that gates the next one: its
 * lessons stay locked until the previous module's test is passed. Completing a
 * module's lessons turns its test node live; passing it lights the next module.
 */
export default function LessonTrail({ language, level, units, lessons }: Props) {
  const hydrated = useHydrated();
  const progress = useProgress();
  const code = language.code;

  const states = computeUnitStates(code, units, lessons, progress);

  const done = (lessonId: string) => hydrated && progress.lessonsCompleted.includes(`${code}:${lessonId}`);

  // "Where you are": first unfinished lesson inside an unlocked module.
  const current = hydrated
    ? states.filter((s) => s.unlocked).flatMap((s) => s.lessons).find((l) => !done(l.id))
    : undefined;

  const offsets = [0, 46, 66, 46, 0, -46, -66, -46];
  let counter = 0;

  return (
    <div className="space-y-10">
      {states.map(({ unit, lessons: unitLessons, unlocked, allLessonsDone, testPassed, testUnlocked }) => {
        if (!unitLessons.length) return null;

        return (
          <section key={unit.id} className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl bg-sunk px-5 py-4">
              <div className="min-w-0 flex-1">
                <h2 className="target text-xl font-semibold tracking-tight">{unit.title}</h2>
                <p className="text-sm text-muted">{unit.titleEn}</p>
              </div>
              {!unlocked && hydrated && (
                <span aria-hidden className="text-lg text-muted" title="Locked">🔒</span>
              )}
            </div>

            <ol className="relative flex flex-col items-center gap-3">
              {unitLessons.map((lesson) => {
                const index = counter++;
                const isDone = done(lesson.id);
                const isCurrent = current?.id === lesson.id;
                const offset = offsets[index % offsets.length];
                const locked = hydrated && !unlocked && !isDone;

                const node = (
                  <div
                    className={`group flex flex-col items-center gap-1.5 ${locked ? "opacity-50" : ""}`}
                  >
                    <span
                      aria-hidden
                      className={`grid h-16 w-16 place-items-center rounded-full border-b-4 text-lg font-bold transition-transform ${
                        locked
                          ? "border-line bg-sunk text-muted"
                          : isDone
                            ? "border-good bg-good text-white group-hover:-translate-y-0.5"
                            : isCurrent
                              ? "listening border-accent bg-accent text-white group-hover:-translate-y-0.5"
                              : "border-line bg-sunk text-muted group-hover:-translate-y-0.5"
                      }`}
                    >
                      {locked ? "🔒" : isDone ? "✓" : index + 1}
                    </span>
                    <span
                      className={`max-w-[10rem] text-center text-sm font-medium leading-tight ${
                        isCurrent ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {lesson.title}
                    </span>
                    <span className="max-w-[10rem] text-center text-xs leading-tight text-muted">
                      {lesson.phrases.length} phrases
                    </span>
                  </div>
                );

                return (
                  <li
                    key={lesson.id}
                    className="flex w-full justify-center"
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    {locked ? (
                      node
                    ) : (
                      <Link
                        href={`/${code}/les/${lesson.id}`}
                        aria-current={isCurrent ? "step" : undefined}
                      >
                        {node}
                      </Link>
                    )}
                  </li>
                );
              })}

              {/* Module test node */}
              <li className="flex w-full justify-center pt-1">
                <TestNode
                  href={`/${code}/${level}/toets/${unit.id}`}
                  passed={testPassed}
                  available={testUnlocked}
                  hydrated={hydrated}
                  allDone={allLessonsDone}
                />
              </li>
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function TestNode({
  href,
  passed,
  available,
  hydrated,
  allDone,
}: {
  href: string;
  passed: boolean;
  available: boolean;
  hydrated: boolean;
  allDone: boolean;
}) {
  const body = (
    <div className={`flex flex-col items-center gap-1.5 ${!available && !passed ? "opacity-50" : ""}`}>
      <span
        aria-hidden
        className={`grid h-16 w-16 place-items-center rounded-2xl border-b-4 text-2xl transition-transform ${
          passed
            ? "border-[#b8860b] bg-[#f0b429] text-white"
            : available
              ? "listening border-accent bg-accent text-white hover:-translate-y-0.5"
              : "border-line bg-sunk text-muted"
        }`}
      >
        {passed ? "🏆" : available ? "🎯" : "🔒"}
      </span>
      <span className="text-center text-sm font-semibold leading-tight">
        {passed ? "Toets voltooid" : "Toets · Test"}
      </span>
      <span className="max-w-[11rem] text-center text-xs leading-tight text-muted">
        {passed
          ? "Module unlocked"
          : available
            ? "Take it to unlock the next module"
            : hydrated && !allDone
              ? "Finish the lessons to unlock"
              : "Locked"}
      </span>
    </div>
  );

  if (passed || available) return <Link href={href}>{body}</Link>;
  return body;
}
