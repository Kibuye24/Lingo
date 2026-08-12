"use client";

import Link from "next/link";
import { useProgress, useHydrated } from "@/lib/hooks";
import type { LanguageConfig, Lesson, Unit } from "@/lib/types";

interface Props {
  language: LanguageConfig;
  units: Unit[];
  lessons: Lesson[];
}

/**
 * A winding numbered path through the lessons.
 *
 * The offsets are deliberate: a straight list reads as a backlog, a path reads
 * as somewhere you're partway along. Nothing is hard-locked — you can jump
 * ahead — but the numbering and the dimming make the intended order obvious.
 */
export default function LessonTrail({ language, units, lessons }: Props) {
  const hydrated = useHydrated();
  const progress = useProgress();

  const done = (lessonId: string) =>
    progress.lessonsCompleted.includes(`${language.code}:${lessonId}`);

  // First unfinished lesson is "where you are".
  const currentIndex = hydrated ? lessons.findIndex((lesson) => !done(lesson.id)) : -1;

  // Gentle S-curve; the pattern repeats every six nodes.
  const offsets = [0, 46, 66, 46, 0, -46, -66, -46];

  let counter = 0;

  return (
    <div className="space-y-10">
      {units.map((unit) => {
        const unitLessons = lessons.filter((lesson) => lesson.unit === unit.id);
        if (!unitLessons.length) return null;

        return (
          <section key={unit.id} className="space-y-5">
            <div className="rounded-2xl bg-sunk px-5 py-4">
              <h2 className="target text-xl font-semibold tracking-tight">{unit.title}</h2>
              <p className="text-sm text-muted">{unit.titleEn}</p>
            </div>

            <ol className="relative flex flex-col items-center gap-3">
              {unitLessons.map((lesson) => {
                const index = counter++;
                const isDone = hydrated && done(lesson.id);
                const isCurrent = index === currentIndex;
                const offset = offsets[index % offsets.length];

                return (
                  <li
                    key={lesson.id}
                    className="flex w-full justify-center"
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    <Link
                      href={`/${language.code}/les/${lesson.id}`}
                      className="group flex flex-col items-center gap-1.5"
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      <span
                        aria-hidden
                        className={`grid h-16 w-16 place-items-center rounded-full border-b-4 text-lg font-bold transition-transform group-hover:-translate-y-0.5 ${
                          isDone
                            ? "border-good bg-good text-white"
                            : isCurrent
                              ? "listening border-accent bg-accent text-white"
                              : "border-line bg-sunk text-muted"
                        }`}
                      >
                        {isDone ? "✓" : index + 1}
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
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
