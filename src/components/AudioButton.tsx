"use client";

import { useEffect, useState } from "react";
import { loadVoices, speak, speechSupported } from "@/lib/speech";

interface Props {
  text: string;
  /** BCP-47 tag of the language being learned. */
  locale: string;
  /** Also render a half-speed button — worth it for whole sentences. */
  withSlow?: boolean;
  size?: "sm" | "md";
  label?: string;
  slowLabel?: string;
}

export default function AudioButton({ text, locale, withSlow, size = "md", label, slowLabel }: Props) {
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState<"normal" | "slow" | null>(null);

  useEffect(() => {
    let alive = true;
    loadVoices().then(() => alive && setReady(speechSupported()));
    return () => {
      alive = false;
    };
  }, []);

  const play = (mode: "normal" | "slow") => {
    setPlaying(mode);
    // 0.4 is genuinely slow — 0.6 still ran too fast to pick apart the sounds.
    speak(text, { locale, rate: mode === "slow" ? 0.4 : 1, onEnd: () => setPlaying(null) });
  };

  const base =
    size === "sm"
      ? "h-8 gap-1.5 px-2.5 text-xs"
      : "h-10 gap-2 px-3.5 text-sm";

  if (!ready) {
    return (
      <button
        disabled
        className={`inline-flex ${base} items-center rounded-lg border border-line text-muted opacity-50`}
      >
        <SpeakerIcon /> {label ?? "Audio"}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={() => play("normal")}
        aria-label={`Play "${text}"`}
        className={`inline-flex ${base} items-center rounded-lg border border-line bg-surface font-medium transition-colors hover:border-accent hover:text-accent ${
          playing === "normal" ? "border-accent text-accent" : ""
        }`}
      >
        <SpeakerIcon /> {label ?? "Listen"}
      </button>
      {withSlow && (
        <button
          onClick={() => play("slow")}
          aria-label={`Play "${text}" slowly`}
          className={`inline-flex ${base} items-center rounded-lg border border-line bg-surface text-muted transition-colors hover:border-accent hover:text-accent ${
            playing === "slow" ? "border-accent text-accent" : ""
          }`}
        >
          <TurtleIcon /> {slowLabel ?? "Slow"}
        </button>
      )}
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5 6 9H3v6h3l5 4V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TurtleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
