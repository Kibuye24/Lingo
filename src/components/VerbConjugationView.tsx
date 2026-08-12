"use client";

import AudioButton from "./AudioButton";
import SpeakCheck from "./SpeakCheck";
import { PRONOUNS, futureForm, imperfectumForm, perfectumForm, presentForm } from "@/lib/conjugate";
import { recordAttempt } from "@/lib/progress";
import type { LanguageConfig, Person, VerbEntry } from "@/lib/types";

interface Tense {
  id: "present" | "imperfectum" | "future" | "perfectum";
  title: string;
  titleEn: string;
  blurb: string;
  form: (verb: VerbEntry, person: Person) => string;
}

const TENSES: Tense[] = [
  {
    id: "present",
    title: "Tegenwoordige tijd",
    titleEn: "Present",
    blurb: "What's happening now, or happens regularly.",
    form: presentForm,
  },
  {
    id: "imperfectum",
    title: "Onvoltooid verleden tijd",
    titleEn: "Simple past",
    blurb: "A past habit or a story you're narrating step by step.",
    form: imperfectumForm,
  },
  {
    id: "perfectum",
    title: "Voltooid tegenwoordige tijd",
    titleEn: "Present perfect",
    blurb: "The tense Dutch actually reaches for in speech to mean 'I did X'.",
    form: perfectumForm,
  },
  {
    id: "future",
    title: "Toekomende tijd",
    titleEn: "Future",
    blurb: "What will happen — zullen plus the plain infinitive.",
    form: futureForm,
  },
];

function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export default function VerbConjugationView({
  language,
  verb,
}: {
  language: LanguageConfig;
  verb: VerbEntry;
}) {
  const { ui, locale, code } = language;

  return (
    <div className="space-y-8">
      {verb.note && (
        <p className="rounded-xl border-l-2 border-accent bg-accent-soft px-4 py-3 text-sm leading-relaxed">
          {verb.note}
        </p>
      )}

      {TENSES.map((tense) => (
        <section key={tense.id} className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">
              {tense.title} <span className="font-normal text-muted">· {tense.titleEn}</span>
            </h2>
            <p className="text-sm text-muted">{tense.blurb}</p>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            {PRONOUNS.map(({ person, target, en }) => {
              const sentence = `${capitalise(target)} ${tense.form(verb, person)}.`;
              return (
                <div
                  key={person}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="target text-sm">
                      <span className="text-muted">{target} </span>
                      <span className="font-semibold">{tense.form(verb, person)}</span>
                    </p>
                    <p className="text-xs text-muted">{en}</p>
                  </div>
                  <AudioButton
                    text={sentence}
                    locale={locale}
                    label={ui.listen}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-line bg-sunk px-4 py-3">
            <p className="target text-lg">{verb.examples[tense.id].target}</p>
            <p className="text-sm text-muted">{verb.examples[tense.id].en}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
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
        </section>
      ))}
    </div>
  );
}
