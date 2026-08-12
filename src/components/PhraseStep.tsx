"use client";

import { useState } from "react";
import AudioButton from "./AudioButton";
import SpeakCheck from "./SpeakCheck";
import type { LanguageConfig, Phrase } from "@/lib/types";
import type { Attempt } from "@/lib/scoring";

interface Props {
  language: LanguageConfig;
  phrase: Phrase;
  onScored?: (attempt: Attempt) => void;
}

/**
 * One phrase, taught whole. The gloss and the pattern drill are behind
 * disclosure so the default experience stays "hear it, say it" rather than
 * turning into a grammar table.
 */
export default function PhraseStep({ language, phrase, onScored }: Props) {
  const [showGloss, setShowGloss] = useState(false);
  const [slot, setSlot] = useState(0);

  const { ui, locale } = language;
  const pattern = phrase.pattern;
  const drillTarget = pattern ? pattern.slots[slot].target : phrase.target;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="target text-3xl font-semibold leading-tight">{phrase.target}</h2>
          {phrase.register && phrase.register !== "neutral" && (
            <span className="mt-1 shrink-0 rounded-full bg-sunk px-2.5 py-1 text-xs text-muted">
              {phrase.register}
            </span>
          )}
        </div>
        <p className="text-lg text-muted">{phrase.en}</p>
        <AudioButton
          text={phrase.target}
          locale={locale}
          label={ui.listen}
          slowLabel={ui.slow}
          withSlow
        />
      </div>

      {phrase.say && (
        <p className="rounded-xl border border-line bg-accent-soft px-4 py-3 text-sm">
          <span className="font-semibold">Say it like:</span>{" "}
          <span className="font-mono">{phrase.say}</span>
        </p>
      )}

      <div>
        <button
          onClick={() => setShowGloss((open) => !open)}
          className="text-sm text-muted underline decoration-dotted underline-offset-4 hover:text-accent"
        >
          {showGloss ? "Hide" : "Show"} word-by-word
        </button>
        {showGloss && (
          <div className="mt-3 flex flex-wrap gap-2">
            {phrase.gloss.map((part, index) => (
              <span
                key={`${part.target}-${index}`}
                className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm"
              >
                <span className="target font-medium">{part.target}</span>
                <span className="text-muted"> · {part.en}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {phrase.note && (
        <p className="border-l-2 border-accent pl-4 text-sm leading-relaxed text-muted">
          {phrase.note}
        </p>
      )}

      {pattern && (
        <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Same shape, new meaning
            </p>
            <p className="target mt-1 text-lg font-medium">{pattern.template}</p>
            <p className="text-sm text-muted">{pattern.templateEn}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {pattern.slots.map((option, index) => (
              <button
                key={option.target}
                onClick={() => setSlot(index)}
                className={`rounded-lg border px-3 py-1.5 text-left text-sm transition-colors ${
                  slot === index
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-surface hover:border-accent"
                }`}
              >
                <span className="target block font-medium">{option.target}</span>
                <span className="block text-xs text-muted">{option.en}</span>
              </button>
            ))}
          </div>
          <AudioButton
            text={drillTarget}
            locale={locale}
            label={ui.listen}
            slowLabel={ui.slow}
            size="sm"
            withSlow
          />
        </div>
      )}

      <div className="space-y-2 border-t border-line pt-5">
        <p className="text-sm font-medium">
          Now you say it: <span className="target text-accent">{drillTarget}</span>
        </p>
        <SpeakCheck
          key={drillTarget}
          target={drillTarget}
          locale={locale}
          sayLabel={ui.sayIt}
          listeningLabel={ui.listening}
          onScored={onScored}
          hint="Speak at a normal pace — the recogniser copes better with real rhythm than with careful robot speech."
        />
      </div>
    </div>
  );
}
