"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AudioButton from "./AudioButton";
import SpeakCheck from "./SpeakCheck";
import { allPhrases } from "@/content";
import { useHydrated } from "@/lib/hooks";
import { duePhraseIds, progressSnapshot, recordAttempt } from "@/lib/progress";
import type { Attempt } from "@/lib/scoring";
import type { LanguageConfig } from "@/lib/types";

export default function ReviewSession({ language }: { language: LanguageConfig }) {
  const hydrated = useHydrated();
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const { ui, locale, code } = language;

  const catalogue = useMemo(() => allPhrases(language), [language]);

  // Fixed for the whole session: answering reschedules phrases, and the queue
  // must not reshuffle underneath the learner as they work through it.
  const queue = useMemo(
    () => (hydrated ? duePhraseIds(progressSnapshot(), code) : null),
    [hydrated, code]
  );

  if (queue === null) return <div className="h-40" />;

  if (!queue.length) {
    return (
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-8 text-center">
        <p className="text-2xl">☕</p>
        <h2 className="target text-xl font-semibold">{ui.nothingDue}</h2>
        <p className="text-muted">
          Nothing is due right now. Learn a new lesson and come back tomorrow —
          that gap is what makes it stick.
        </p>
        <Link
          href={`/${code}`}
          className="inline-block h-11 rounded-xl bg-accent px-5 font-medium leading-[2.75rem] text-white hover:opacity-90"
        >
          {ui.allLessons}
        </Link>
      </div>
    );
  }

  if (position >= queue.length) {
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
    return (
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-8 text-center">
        <p className="text-3xl">✓</p>
        <h2 className="text-2xl font-semibold">
          {ui.done} — {queue.length}
        </h2>
        <p className="text-muted">Average intelligibility this session: {average}%.</p>
        <Link
          href={`/${code}`}
          className="inline-block h-11 rounded-xl bg-accent px-5 font-medium leading-[2.75rem] text-white hover:opacity-90"
        >
          {ui.allLessons}
        </Link>
      </div>
    );
  }

  const phraseId = queue[position];
  const entry = catalogue.find(({ phrase }) => phrase.id === phraseId);

  // Dialogue-turn records have no catalogue entry — skip them cleanly.
  if (!entry) {
    return (
      <button
        onClick={() => setPosition((p) => p + 1)}
        className="h-11 rounded-xl border border-line px-5"
      >
        {ui.next} →
      </button>
    );
  }

  const { phrase, lesson } = entry;

  const onScored = (attempt: Attempt) => {
    recordAttempt(code, phrase.id, lesson.id, attempt.score);
    setScores((list) => [...list, attempt.score]);
    setRevealed(true);
  };

  const advance = () => {
    setPosition((p) => p + 1);
    setRevealed(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          {position + 1} / {queue.length}
        </span>
        <Link href={`/${code}/les/${lesson.id}`} className="hover:text-accent">
          &ldquo;{lesson.title}&rdquo;
        </Link>
      </div>

      <div className="space-y-6 rounded-2xl border border-line bg-surface p-6">
        <div className="space-y-2">
          <p className="target text-xs font-semibold uppercase tracking-wide text-muted">
            {ui.sayThisIn}
          </p>
          <p className="text-2xl font-medium leading-snug">{phrase.en}</p>
        </div>

        <SpeakCheck
          key={phrase.id}
          target={phrase.target}
          locale={locale}
          sayLabel={ui.sayIt}
          listeningLabel={ui.listening}
          onScored={onScored}
        />

        {!revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="text-sm text-muted underline decoration-dotted underline-offset-4 hover:text-accent"
          >
            {ui.dontKnow}
          </button>
        )}

        {revealed && (
          <div className="space-y-3 border-t border-line pt-5">
            <p className="target text-2xl font-semibold">{phrase.target}</p>
            {phrase.say && <p className="font-mono text-sm text-muted">{phrase.say}</p>}
            <AudioButton
              text={phrase.target}
              locale={locale}
              label={ui.listen}
              slowLabel={ui.slow}
              withSlow
            />
          </div>
        )}
      </div>

      <button
        onClick={advance}
        className="h-12 w-full rounded-xl bg-accent font-medium text-white hover:opacity-90"
      >
        {ui.next} →
      </button>
    </div>
  );
}
