"use client";

import { useState } from "react";
import AudioButton from "./AudioButton";
import SpeakCheck from "./SpeakCheck";
import { buildSentence, conjugate } from "@/lib/conjugate";
import { recordAttempt } from "@/lib/progress";
import type { LanguageConfig, SentenceDrill } from "@/lib/types";

/**
 * Pick a subject, a verb and an object; the app conjugates and you say it.
 *
 * The verb form is highlighted separately from the rest of the sentence, so the
 * thing that changes when you switch subject is the thing your eye lands on.
 */
export default function SentenceBuilder({
  language,
  drill,
}: {
  language: LanguageConfig;
  drill: SentenceDrill;
}) {
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [verbIndex, setVerbIndex] = useState(0);
  const [objectIndex, setObjectIndex] = useState(0);
  const { ui, locale, code } = language;

  const subject = drill.subjects[subjectIndex];
  const verb = drill.verbs[verbIndex];
  const object = drill.objects[objectIndex];
  const sentence = buildSentence(subject, verb, object);

  const rest = sentence.target
    .replace(new RegExp(`^\\S+\\s+${sentence.verbForm}\\s*`), "")
    .trim();

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
        <Picker
          label="Wie · Who"
          options={drill.subjects.map((s) => ({ key: s.target + s.en, main: s.target, sub: s.en }))}
          selected={subjectIndex}
          onSelect={setSubjectIndex}
        />
        <Picker
          label="Wat doet die · Verb"
          options={drill.verbs.map((v) => ({
            key: v.infinitive,
            main: v.infinitive,
            sub: v.en,
          }))}
          selected={verbIndex}
          onSelect={setVerbIndex}
        />
        <Picker
          label="Waarmee · What"
          options={drill.objects.map((o) => ({ key: o.target, main: o.target, sub: o.en }))}
          selected={objectIndex}
          onSelect={setObjectIndex}
        />
      </div>

      <div className="space-y-4 rounded-2xl border-2 border-accent bg-accent-soft p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Jouw zin · Your sentence
        </p>
        <p className="target text-3xl font-semibold leading-snug">
          <span>{subject.target.charAt(0).toUpperCase() + subject.target.slice(1)} </span>
          <span className="underline decoration-accent decoration-4 underline-offset-4">
            {sentence.verbForm}
          </span>
          <span> {rest}</span>
        </p>
        <p className="text-muted">{sentence.en}</p>

        <p className="text-sm text-muted">
          <span className="font-medium">{verb.infinitive}</span> → stem{" "}
          <span className="font-mono">{verb.stem}</span> →{" "}
          <span className="font-mono font-semibold text-accent">{sentence.verbForm}</span>
          {subject.person === "ik" && " (bare stem for ik)"}
          {subject.person === "jij" && " (stem + t)"}
          {subject.person === "hij" && " (stem + t)"}
          {(subject.person === "wij" ||
            subject.person === "jullie" ||
            subject.person === "zij") &&
            " (back to the infinitive)"}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <AudioButton
            text={sentence.target}
            locale={locale}
            label={ui.listen}
            slowLabel={ui.slow}
            withSlow
          />
        </div>

        <SpeakCheck
          key={sentence.target}
          target={sentence.target}
          locale={locale}
          sayLabel={ui.sayIt}
          listeningLabel={ui.listening}
          onScored={(attempt) =>
            recordAttempt(code, `bouw-${drill.id}`, drill.id, attempt.score)
          }
        />
      </div>

      <div className="space-y-2 rounded-2xl border border-line bg-sunk p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Alle vormen · Every form of {verb.infinitive}
        </p>
        <div className="grid gap-1 sm:grid-cols-2">
          {drill.subjects.map((option) => (
            <p key={option.target + option.en} className="target text-sm">
              <span className="text-muted">{option.target}</span>{" "}
              <span className="font-semibold">{conjugate(verb, option.person)}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function Picker({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { key: string; main: string; sub: string }[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => (
          <button
            key={option.key}
            onClick={() => onSelect(index)}
            className={`rounded-lg border px-3 py-1.5 text-left transition-colors ${
              selected === index
                ? "border-accent bg-accent-soft"
                : "border-line bg-surface hover:border-accent"
            }`}
          >
            <span className="target block text-sm font-medium">{option.main}</span>
            <span className="block text-xs text-muted">{option.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
