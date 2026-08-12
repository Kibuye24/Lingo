"use client";

import { useState } from "react";
import AudioButton from "./AudioButton";
import SpeakCheck from "./SpeakCheck";
import type { LanguageConfig } from "@/lib/types";

export default function SoundLab({ language }: { language: LanguageConfig }) {
  const { soundDrills, ui, locale } = language;
  const [active, setActive] = useState(soundDrills[0]?.id ?? "");
  const [wordIndex, setWordIndex] = useState(0);

  const drill = soundDrills.find((d) => d.id === active) ?? soundDrills[0];
  if (!drill) return null;
  const word = drill.words[wordIndex] ?? drill.words[0];

  const pick = (id: string) => {
    setActive(id);
    setWordIndex(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {soundDrills.map((sound) => (
          <button
            key={sound.id}
            onClick={() => pick(sound.id)}
            className={`rounded-lg border px-3 py-2 transition-colors ${
              sound.id === active
                ? "border-accent bg-accent-soft"
                : "border-line bg-surface hover:border-accent"
            }`}
          >
            <span className="target block font-mono text-lg font-semibold">
              {sound.symbol}
            </span>
            <span className="block text-xs text-muted">{sound.name}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6 rounded-2xl border border-line bg-surface p-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">{drill.name}</h2>
          <div className="space-y-3">
            <p className="leading-relaxed">
              <span className="font-semibold">How: </span>
              {drill.how}
            </p>
            <p className="rounded-xl bg-bad-soft px-4 py-3 text-sm leading-relaxed text-bad">
              <span className="font-semibold">Common trap: </span>
              {drill.trap}
            </p>
          </div>
        </div>

        <div className="space-y-3 border-t border-line pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Words
          </p>
          <div className="flex flex-wrap gap-2">
            {drill.words.map((option, index) => (
              <button
                key={option.target}
                onClick={() => setWordIndex(index)}
                className={`rounded-lg border px-3 py-1.5 text-left transition-colors ${
                  index === wordIndex
                    ? "border-accent bg-accent-soft"
                    : "border-line hover:border-accent"
                }`}
              >
                <span className="target block font-medium">{option.target}</span>
                <span className="block text-xs text-muted">{option.en}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t border-line pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="target text-3xl font-semibold">{word.target}</p>
            <AudioButton
              text={word.target}
              locale={locale}
              label={ui.listen}
              slowLabel={ui.slow}
              withSlow
            />
          </div>
          <SpeakCheck
            key={`${drill.id}-${word.target}`}
            target={word.target}
            locale={locale}
            sayLabel={ui.sayIt}
            listeningLabel={ui.listening}
            hint="Listen twice before you speak. Copy the shape of the sound, not the spelling."
          />
        </div>

        {drill.tongueTwister && (
          <div className="space-y-3 border-t border-line pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              When it starts feeling easy
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="target text-lg">{drill.tongueTwister}</p>
              <AudioButton
                text={drill.tongueTwister}
                locale={locale}
                label={ui.listen}
                slowLabel={ui.slow}
                size="sm"
                withSlow
              />
            </div>
            <SpeakCheck
              key={`${drill.id}-twister`}
              target={drill.tongueTwister}
              locale={locale}
              sayLabel={ui.sayIt}
              listeningLabel={ui.listening}
            />
          </div>
        )}
      </div>
    </div>
  );
}
