"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AudioButton from "./AudioButton";
import PhraseStep from "./PhraseStep";
import SpeakCheck from "./SpeakCheck";
import type { LanguageConfig, Lesson } from "@/lib/types";
import { markLessonComplete, recordAttempt } from "@/lib/progress";

type Stage =
  | { kind: "intro" }
  | { kind: "phrase"; index: number }
  | { kind: "dialogue" }
  | { kind: "done" };

interface Props {
  language: LanguageConfig;
  lesson: Lesson;
}

export default function LessonRunner({ language, lesson }: Props) {
  const [stage, setStage] = useState<Stage>({ kind: "intro" });
  const { ui, code } = language;

  const steps = useMemo(
    () => lesson.phrases.length + 2, // phrases + dialogue + done
    [lesson.phrases.length]
  );
  const stepIndex =
    stage.kind === "intro"
      ? 0
      : stage.kind === "phrase"
        ? stage.index + 1
        : stage.kind === "dialogue"
          ? lesson.phrases.length + 1
          : steps;

  const next = () => {
    if (stage.kind === "intro") return setStage({ kind: "phrase", index: 0 });
    if (stage.kind === "phrase") {
      return stage.index + 1 < lesson.phrases.length
        ? setStage({ kind: "phrase", index: stage.index + 1 })
        : setStage({ kind: "dialogue" });
    }
    if (stage.kind === "dialogue") {
      markLessonComplete(code, lesson.id);
      return setStage({ kind: "done" });
    }
  };

  const back = () => {
    if (stage.kind === "phrase") {
      return stage.index === 0
        ? setStage({ kind: "intro" })
        : setStage({ kind: "phrase", index: stage.index - 1 });
    }
    if (stage.kind === "dialogue")
      return setStage({ kind: "phrase", index: lesson.phrases.length - 1 });
    if (stage.kind === "done") return setStage({ kind: "dialogue" });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link href={`/${code}/${lesson.level.toLowerCase()}/pad`} className="text-sm text-muted hover:text-accent">
          ← {ui.allLessons}
        </Link>
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-sunk"
          role="progressbar"
          aria-valuenow={stepIndex}
          aria-valuemin={0}
          aria-valuemax={steps}
        >
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(stepIndex / steps) * 100}%` }}
          />
        </div>
      </div>

      {stage.kind === "intro" && (
        <section className="space-y-5">
          <div>
            <p className="text-sm text-muted">{lesson.titleEn}</p>
            <h1 className="target text-4xl font-semibold tracking-tight">{lesson.title}</h1>
          </div>
          <p className="text-lg leading-relaxed">{lesson.canDo}</p>
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              You&apos;ll learn {lesson.phrases.length} phrases
            </p>
            <ul className="space-y-2">
              {lesson.phrases.map((phrase) => (
                <li key={phrase.id} className="flex items-baseline justify-between gap-4">
                  <span className="target font-medium">{phrase.target}</span>
                  <span className="shrink-0 text-sm text-muted">{phrase.en}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={next}
            className="h-12 rounded-xl bg-accent px-6 font-medium text-white transition-opacity hover:opacity-90"
          >
            {ui.begin}
          </button>
        </section>
      )}

      {stage.kind === "phrase" && (
        <section className="space-y-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {ui.phraseCounter
              .replace("{n}", String(stage.index + 1))
              .replace("{total}", String(lesson.phrases.length))}
          </p>
          <PhraseStep
            key={lesson.phrases[stage.index].id}
            language={language}
            phrase={lesson.phrases[stage.index]}
            onScored={(attempt) =>
              recordAttempt(code, lesson.phrases[stage.index].id, lesson.id, attempt.score)
            }
          />
          <StepNav onBack={back} onNext={next} nextLabel={ui.next} backLabel={ui.back} />
        </section>
      )}

      {stage.kind === "dialogue" && (
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {ui.conversation}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">Put it together</h2>
            <p className="mt-1 text-muted">
              Play each line, then speak your turns out loud.
            </p>
          </div>
          <DialogueRunner language={language} lesson={lesson} />
          <StepNav onBack={back} onNext={next} nextLabel={ui.done} backLabel={ui.back} />
        </section>
      )}

      {stage.kind === "done" && (
        <section className="space-y-6 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-good-soft text-3xl">
            🎉
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">{ui.wellDone}</h2>
            <p className="mt-2 text-muted">
              These phrases are now in your review queue. They&apos;ll come back
              tomorrow, then at widening intervals.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/${code}/gesprek?lesson=${lesson.id}`}
              className="h-12 rounded-xl bg-accent px-6 font-medium leading-[3rem] text-white hover:opacity-90"
            >
              Use it in conversation
            </Link>
            <Link
              href={`/${code}/${lesson.level.toLowerCase()}/pad`}
              className="h-12 rounded-xl border border-line px-6 font-medium leading-[3rem] hover:border-accent"
            >
              {ui.allLessons}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextLabel,
  backLabel,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  backLabel: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-line pt-5">
      <button onClick={onBack} className="text-sm text-muted hover:text-accent">
        ← {backLabel}
      </button>
      <button
        onClick={onNext}
        className="h-11 rounded-xl bg-accent px-6 font-medium text-white transition-opacity hover:opacity-90"
      >
        {nextLabel}
      </button>
    </div>
  );
}

/** Walks the scripted dialogue, pausing on the learner's turns. */
function DialogueRunner({
  language,
  lesson,
}: {
  language: LanguageConfig;
  lesson: Lesson;
}) {
  const [turn, setTurn] = useState(0);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const { ui, locale, code } = language;

  const visible = lesson.dialogue.slice(0, turn + 1);
  const current = lesson.dialogue[turn];
  const atEnd = turn >= lesson.dialogue.length - 1;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {visible.map((line, index) => {
          const isYou = line.speaker === "you";
          const isCurrent = index === turn;
          const hide = isYou && isCurrent && !revealed[index];

          return (
            <div key={index} className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] space-y-2 rounded-2xl px-4 py-3 ${
                  isYou ? "bg-accent-soft" : "border border-line bg-surface"
                }`}
              >
                {hide ? (
                  <>
                    <p className="text-sm font-medium">Your turn</p>
                    <p className="text-sm text-muted">{line.cue}</p>
                  </>
                ) : (
                  <>
                    <p className="target text-lg">{line.target}</p>
                    <p className="text-sm text-muted">{line.en}</p>
                    <AudioButton
                      text={line.target}
                      locale={locale}
                      label={ui.listen}
                      slowLabel={ui.slow}
                      size="sm"
                      withSlow={!isYou}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {current.speaker === "you" && (
        <div className="space-y-3 rounded-xl border border-line bg-sunk p-4">
          {!revealed[turn] ? (
            <>
              <SpeakCheck
                key={`turn-${turn}`}
                target={current.target}
                locale={locale}
                sayLabel={ui.sayIt}
                listeningLabel={ui.listening}
                onScored={(attempt) =>
                  recordAttempt(
                    code,
                    `${lesson.id}-dialogue-${turn}`,
                    lesson.id,
                    attempt.score
                  )
                }
                hint="Say it from the cue — then reveal to compare."
              />
              <button
                onClick={() => setRevealed((map) => ({ ...map, [turn]: true }))}
                className="text-sm text-muted underline decoration-dotted underline-offset-4 hover:text-accent"
              >
                Show me the line
              </button>
            </>
          ) : (
            <SpeakCheck
              key={`turn-${turn}-revealed`}
              target={current.target}
              locale={locale}
              sayLabel={ui.sayIt}
              listeningLabel={ui.listening}
            />
          )}
        </div>
      )}

      {!atEnd && (
        <button
          onClick={() => setTurn((t) => t + 1)}
          className="h-11 w-full rounded-xl border border-line bg-surface font-medium hover:border-accent hover:text-accent"
        >
          {ui.next} →
        </button>
      )}
    </div>
  );
}
