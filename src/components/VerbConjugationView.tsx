"use client";

import { useState } from "react";
import AudioButton from "./AudioButton";
import SpeakCheck from "./SpeakCheck";
import { PRONOUNS, futureForm, imperfectumForm, perfectumForm, presentForm } from "@/lib/conjugate";
import { recordAttempt } from "@/lib/progress";
import type { LanguageConfig, Person, VerbEntry } from "@/lib/types";

interface Tense {
  id: "present" | "imperfectum" | "future" | "perfectum";
  tab: string;
  title: string;
  titleEn: string;
  blurb: string;
  form: (verb: VerbEntry, person: Person) => string;
}

const TENSES: Tense[] = [
  {
    id: "present",
    tab: "Nu",
    title: "Tegenwoordige tijd",
    titleEn: "Present",
    blurb: "What's happening now, or happens regularly.",
    form: presentForm,
  },
  {
    id: "imperfectum",
    tab: "Verleden",
    title: "Onvoltooid verleden tijd",
    titleEn: "Simple past",
    blurb: "A past habit or a story you're narrating step by step.",
    form: imperfectumForm,
  },
  {
    id: "perfectum",
    tab: "Voltooid",
    title: "Voltooid tegenwoordige tijd",
    titleEn: "Present perfect",
    blurb: "The tense Dutch actually reaches for in speech to mean 'I did X'.",
    form: perfectumForm,
  },
  {
    id: "future",
    tab: "Toekomst",
    title: "Toekomende tijd",
    titleEn: "Future",
    blurb: "What will happen — zullen plus the plain infinitive.",
    form: futureForm,
  },
];

function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * One tense at a time, chosen by a sticky segmented control.
 *
 * The four tenses stacked ran to a long scroll — you'd lose the verb you were
 * studying before reaching its future form. Tabs keep every tense one tap
 * away and the paradigm always on screen.
 */
export default function VerbConjugationView({
  language,
  verb,
}: {
  language: LanguageConfig;
  verb: VerbEntry;
}) {
  const { ui, locale, code } = language;
  const [activeId, setActiveId] = useState<Tense["id"]>("present");
  const tense = TENSES.find((t) => t.id === activeId) ?? TENSES[0];

  return (
    <div className="space-y-4">
      {verb.note && (
        <p className="rounded-2xl border-l-2 border-accent bg-accent-soft px-4 py-3 text-sm leading-relaxed">
          {verb.note}
        </p>
      )}

      {/* Sticky tense selector */}
      <div className="sticky top-14 z-10 -mx-4 bg-[var(--shell)] px-4 py-2 backdrop-blur-lg">
        <div className="flex gap-1 rounded-full border border-line bg-sunk p-1">
          {TENSES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              aria-pressed={t.id === activeId}
              className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors ${
                t.id === activeId ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {t.tab}
            </button>
          ))}
        </div>
      </div>

      <div className="fade-in space-y-3" key={tense.id}>
        <div>
          <h2 className="text-lg font-semibold">
            {tense.title} <span className="font-normal text-muted">· {tense.titleEn}</span>
          </h2>
          <p className="text-sm text-muted">{tense.blurb}</p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {PRONOUNS.map(({ person, target, en }) => {
            const sentence = `${capitalise(target)} ${tense.form(verb, person)}.`;
            return (
              <div
                key={person}
                className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="target text-sm">
                    <span className="text-muted">{target} </span>
                    <span className="font-semibold">{tense.form(verb, person)}</span>
                  </p>
                  <p className="truncate text-xs text-muted">{en}</p>
                </div>
                <AudioButton text={sentence} locale={locale} label="" size="sm" />
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-line bg-sunk px-4 py-3">
          <p className="target text-lg">{verb.examples[tense.id].target}</p>
          <p className="text-sm text-muted">{verb.examples[tense.id].en}</p>
          <div className="mt-2">
            <AudioButton
              text={verb.examples[tense.id].target}
              locale={locale}
              label={ui.listen}
              slowLabel={ui.slow}
              size="sm"
              withSlow
            />
          </div>
          <div className="mt-3">
            <SpeakCheck
              key={`${verb.id}-${tense.id}`}
              target={verb.examples[tense.id].target}
              locale={locale}
              sayLabel={ui.sayIt}
              listeningLabel={ui.listening}
              onScored={(attempt) =>
                recordAttempt(code, `verb-${verb.id}-${tense.id}`, `werkwoorden`, attempt.score)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
