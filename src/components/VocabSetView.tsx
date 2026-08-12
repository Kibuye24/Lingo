"use client";

import { useState } from "react";
import AudioButton from "./AudioButton";
import SpeakCheck from "./SpeakCheck";
import { recordAttempt } from "@/lib/progress";
import type { LanguageConfig, VocabSet } from "@/lib/types";

/**
 * A word set in two modes: browse the whole list, or drill one word at a time.
 *
 * Nouns are always rendered with their article attached, because that is the
 * unit that has to be memorised — "het boek", never "boek".
 */
export default function VocabSetView({
  language,
  set,
}: {
  language: LanguageConfig;
  set: VocabSet;
}) {
  const [mode, setMode] = useState<"browse" | "drill">("browse");
  const [index, setIndex] = useState(0);
  const { ui, locale, code } = language;

  const item = set.items[index];
  const spoken = (i: (typeof set.items)[number]) =>
    i.article ? `${i.article} ${i.target}` : i.target;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["browse", "drill"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setMode(option)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              mode === option
                ? "border-accent bg-accent-soft text-accent"
                : "border-line bg-surface hover:border-accent"
            }`}
          >
            {option === "browse" ? "Bekijken · Browse" : "Oefenen · Drill"}
          </button>
        ))}
      </div>

      {mode === "browse" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {set.items.map((entry) => (
            <div
              key={entry.target}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
            >
              {entry.icon && (
                <span aria-hidden className="text-2xl leading-none">
                  {entry.icon}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="target font-semibold">
                  {entry.article && <span className="text-accent">{entry.article} </span>}
                  {entry.target}
                </p>
                <p className="text-sm text-muted">{entry.en}</p>
                {entry.plural && (
                  <p className="text-xs text-muted">plural: de {entry.plural}</p>
                )}
              </div>
              <AudioButton
                text={spoken(entry)}
                locale={locale}
                label={ui.listen}
                slowLabel={ui.slow}
                size="sm"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5 rounded-2xl border border-line bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {index + 1} / {set.items.length}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="target text-3xl font-semibold">
                {item.article && <span className="text-accent">{item.article} </span>}
                {item.target}
              </p>
              <p className="mt-1 text-lg text-muted">{item.en}</p>
              {item.say && <p className="font-mono text-sm text-muted">{item.say}</p>}
            </div>
            <AudioButton
              text={spoken(item)}
              locale={locale}
              label={ui.listen}
              slowLabel={ui.slow}
              withSlow
            />
          </div>

          <SpeakCheck
            key={item.target}
            target={spoken(item)}
            locale={locale}
            sayLabel={ui.sayIt}
            listeningLabel={ui.listening}
            onScored={(attempt) =>
              recordAttempt(code, `vocab-${set.id}-${item.target}`, set.id, attempt.score)
            }
            hint={
              item.article
                ? "Say the article too — it's part of the word."
                : undefined
            }
          />

          <div className="flex items-center justify-between border-t border-line pt-4">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="text-sm text-muted hover:text-accent disabled:opacity-40"
            >
              ← {ui.back}
            </button>
            <button
              onClick={() => setIndex((i) => Math.min(set.items.length - 1, i + 1))}
              disabled={index === set.items.length - 1}
              className="h-11 rounded-xl bg-accent px-6 font-medium text-white disabled:opacity-40"
            >
              {ui.next}
            </button>
          </div>
        </div>
      )}

      {set.examples && (
        <div className="space-y-3 rounded-2xl border border-line bg-sunk p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            In een zin · In a sentence
          </p>
          {set.examples.map((example) => (
            <div key={example.target} className="flex flex-wrap items-center gap-3">
              <p className="target flex-1 text-lg">{example.target}</p>
              <p className="text-sm text-muted">{example.en}</p>
              <AudioButton
                text={example.target}
                locale={locale}
                label={ui.listen}
                slowLabel={ui.slow}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
