"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Conversation from "./Conversation";
import AudioButton from "./AudioButton";
import { scoreAttempt } from "@/lib/scoring";
import { markTestPassed } from "@/lib/progress";
import { unitStateById } from "@/lib/gating";
import { useHydrated, useProgress } from "@/lib/hooks";
import type { LanguageConfig, Lesson, Unit } from "@/lib/types";

interface Props {
  language: LanguageConfig;
  level: string;
  unitId: string;
  /** All units and lessons at this level, for gating and question-building. */
  units: Unit[];
  lessons: Lesson[];
}

/** How many of the quiz questions must be right to pass. */
const PASS_RATIO = 0.7;
/** A single answer counts as correct at this intelligibility score. */
const CORRECT_AT = 60;
const MAX_QUESTIONS = 8;

/**
 * A module's consolidation test: chat with the tutor about the module, then a
 * typed quiz drawn from its phrases. The quiz is the gate — passing it unlocks
 * the next module — while the chat is open practice on the same topics.
 *
 * The quiz grades on intelligibility, not spelling, so a close answer still
 * counts; this is a checkpoint, not an exam.
 */
export default function UnitTest({ language, level, unitId, units, lessons }: Props) {
  const hydrated = useHydrated();
  const progress = useProgress();
  const [tab, setTab] = useState<"quiz" | "chat">("quiz");

  const gate = unitStateById(language.code, units, lessons, progress, unitId);
  const unit = gate?.state.unit;
  const unitLessons = useMemo(
    () => lessons.filter((l) => l.unit === unitId),
    [lessons, unitId]
  );
  const nextUnitId = gate?.nextUnit?.id;
  const testUnlocked = gate?.state.testUnlocked ?? false;
  const alreadyPassed = gate?.state.testPassed ?? false;

  const questions = useMemo(() => {
    const seen = new Set<string>();
    const picked: { prompt: string; answer: string }[] = [];
    for (const lesson of unitLessons) {
      for (const phrase of lesson.phrases) {
        const words = phrase.target.split(/\s+/).length;
        if (words > 7) continue; // keep answers short enough to type
        if (seen.has(phrase.en)) continue;
        seen.add(phrase.en);
        picked.push({ prompt: phrase.en, answer: phrase.target });
        if (picked.length >= MAX_QUESTIONS) return picked;
      }
    }
    return picked;
  }, [unitLessons]);

  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [passedNow, setPassedNow] = useState(false);

  const results = checked
    ? questions.map((q, i) => scoreAttempt(q.answer, answers[i] ?? "").score)
    : [];
  const correct = results.filter((s) => s >= CORRECT_AT).length;
  const ratio = questions.length ? correct / questions.length : 0;
  const passed = alreadyPassed || passedNow;

  const check = () => {
    const scores = questions.map((q, i) => scoreAttempt(q.answer, answers[i] ?? "").score);
    const ok = questions.length ? scores.filter((s) => s >= CORRECT_AT).length / questions.length : 0;
    setChecked(true);
    if (ok >= PASS_RATIO) {
      markTestPassed(language.code, unitId);
      setPassedNow(true);
    }
  };

  const firstLessonId = unitLessons[0]?.id;

  if (!unit) return null;

  if (hydrated && !testUnlocked && !alreadyPassed) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-6 text-center">
        <p className="text-3xl">🔒</p>
        <h2 className="mt-2 text-lg font-semibold">Nog niet beschikbaar</h2>
        <p className="mt-1 text-sm text-muted">
          Finish every lesson in this module first, then come back for the test.
        </p>
        <Link
          href={`/${language.code}/${level}/pad`}
          className="mt-4 inline-block rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white"
        >
          Naar de lessen
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-full border border-line bg-sunk p-1 text-sm font-medium">
        <button
          onClick={() => setTab("quiz")}
          className={`flex-1 rounded-full py-1.5 transition-colors ${
            tab === "quiz" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          Quiz
        </button>
        <button
          onClick={() => setTab("chat")}
          className={`flex-1 rounded-full py-1.5 transition-colors ${
            tab === "chat" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          Gesprek · Chat
        </button>
      </div>

      {tab === "chat" ? (
        <div>
          <p className="mb-3 text-sm text-muted">
            Practise the module with the tutor — then take the quiz to unlock the next one.
          </p>
          <Conversation language={language} initialScenarioId={firstLessonId} />
        </div>
      ) : passed ? (
        <div className="rounded-3xl border border-good bg-good-soft p-6 text-center">
          <p className="text-4xl">🏆</p>
          <h2 className="mt-2 text-xl font-semibold text-good">Geslaagd! · Passed</h2>
          <p className="mt-1 text-sm text-muted">
            {nextUnitId
              ? "The next module is unlocked. Keep going!"
              : "That's the last module at this level — nice work."}
          </p>
          <Link
            href={`/${language.code}/${level}/pad`}
            className="mt-4 inline-block rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white"
          >
            Terug naar het pad
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Type each phrase in {language.nameEn}. Close answers count — this checks
            understanding, not spelling.
          </p>

          {questions.map((q, i) => {
            const score = checked ? results[i] : null;
            const ok = score !== null && score >= CORRECT_AT;
            return (
              <div key={q.prompt} className="rounded-2xl border border-line bg-surface p-4">
                <p className="text-sm font-medium">{q.prompt}</p>
                <input
                  value={answers[i] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[i] = e.target.value;
                      return next;
                    })
                  }
                  disabled={checked}
                  placeholder={`… in ${language.nameEn}`}
                  className={`target mt-2 h-11 w-full rounded-xl border bg-background px-3 outline-none ${
                    checked
                      ? ok
                        ? "border-good"
                        : "border-bad"
                      : "border-line focus:border-accent"
                  }`}
                />
                {checked && !ok && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted">Antwoord:</span>
                    <span className="target font-semibold">{q.answer}</span>
                    <AudioButton text={q.answer} locale={language.locale} label="" size="sm" />
                  </div>
                )}
              </div>
            );
          })}

          {checked ? (
            <div className="rounded-2xl border border-line bg-sunk p-4 text-center">
              <p className="text-lg font-semibold">
                {correct} / {questions.length} correct
              </p>
              <p className="mt-1 text-sm text-muted">
                {ratio >= PASS_RATIO
                  ? "Passing!"
                  : `You need ${Math.ceil(questions.length * PASS_RATIO)} to pass. Try again.`}
              </p>
              {ratio < PASS_RATIO && (
                <button
                  onClick={() => {
                    setChecked(false);
                    setAnswers(questions.map(() => ""));
                  }}
                  className="mt-3 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Opnieuw · Retry
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={check}
              disabled={answers.every((a) => !a.trim())}
              className="h-12 w-full rounded-2xl bg-accent font-semibold text-white disabled:opacity-40"
            >
              Nakijken · Check answers
            </button>
          )}
        </div>
      )}
    </div>
  );
}
