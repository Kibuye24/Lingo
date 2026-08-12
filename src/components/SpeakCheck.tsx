"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listen, recognitionSupported, type Listener } from "@/lib/speech";
import { useHydrated } from "@/lib/hooks";
import { scoreAttempt, verdictLabel, type Attempt } from "@/lib/scoring";

interface Props {
  /**
   * The phrase the learner is trying to say. Callers pass `key={target}` so a
   * new target remounts the component and clears the previous verdict.
   */
  target: string;
  /** BCP-47 tag of the language being learned. */
  locale: string;
  onScored?: (attempt: Attempt) => void;
  /** Shown under the button before the first attempt. */
  hint?: string;
  /** Target-language button label, e.g. "Zeg het". */
  sayLabel?: string;
  listeningLabel?: string;
}

export default function SpeakCheck({
  target,
  locale,
  onScored,
  hint,
  sayLabel,
  listeningLabel,
}: Props) {
  const hydrated = useHydrated();
  const [state, setState] = useState<"idle" | "listening">("idle");
  const [partial, setPartial] = useState("");
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listenerRef = useRef<Listener | null>(null);

  const supported = hydrated ? recognitionSupported() : null;

  useEffect(() => () => listenerRef.current?.stop(), []);

  const start = useCallback(() => {
    setError(null);
    setAttempt(null);
    setPartial("");
    setState("listening");

    listenerRef.current = listen({
      locale,
      onPartial: setPartial,
      onFinal: (text) => {
        setState("idle");
        setPartial("");
        if (!text) {
          setError("Didn't catch anything — try again a little louder.");
          return;
        }
        const scored = scoreAttempt(target, text);
        setAttempt(scored);
        onScored?.(scored);
      },
      onError: (message) => {
        setState("idle");
        setError(message);
      },
    });
  }, [target, locale, onScored]);

  const stop = () => {
    listenerRef.current?.stop();
    setState("idle");
  };

  if (supported === null) {
    return <div className="h-12" />;
  }

  if (!supported) {
    return (
      <p className="rounded-lg border border-line bg-sunk px-3 py-2 text-sm text-muted">
        Your browser can&apos;t do speech recognition. Chrome or Edge will let you
        practise speaking — everything else here still works.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={state === "listening" ? stop : start}
          className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 font-medium transition-colors ${
            state === "listening"
              ? "listening bg-accent text-white"
              : "border border-line bg-surface hover:border-accent hover:text-accent"
          }`}
        >
          <MicIcon />
          {state === "listening" ? (listeningLabel ?? "Listening…") : (sayLabel ?? "Say it")}
        </button>
        {attempt && <ScorePill attempt={attempt} />}
      </div>

      {partial && (
        <p className="target text-sm italic text-muted">&ldquo;{partial}&rdquo;</p>
      )}

      {!attempt && !partial && hint && state === "idle" && (
        <p className="text-sm text-muted">{hint}</p>
      )}

      {error && (
        <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>
      )}

      {attempt && <AttemptDetail attempt={attempt} />}
    </div>
  );
}

function ScorePill({ attempt }: { attempt: Attempt }) {
  const tone =
    attempt.verdict === "excellent"
      ? "bg-good-soft text-good"
      : attempt.verdict === "good"
        ? "bg-warn-soft text-warn"
        : "bg-bad-soft text-bad";
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${tone}`}>
      {attempt.score}% · {verdictLabel(attempt)}
    </span>
  );
}

function AttemptDetail({ attempt }: { attempt: Attempt }) {
  return (
    <div className="space-y-2 rounded-xl border border-line bg-sunk px-4 py-3">
      <p className="target flex flex-wrap gap-x-2 gap-y-1 text-lg">
        {attempt.words.map((word, index) => (
          <span
            key={`${word.expected}-${index}`}
            className={
              word.status === "hit"
                ? "text-good"
                : word.status === "close"
                  ? "text-warn underline decoration-dotted underline-offset-4"
                  : "text-bad line-through decoration-2"
            }
            title={word.heard ? `heard: ${word.heard}` : undefined}
          >
            {word.expected}
          </span>
        ))}
      </p>
      <p className="text-xs text-muted">
        Heard: <span className="target font-mono">{attempt.transcript || "—"}</span>
      </p>
      {attempt.focus.length > 0 && (
        <p className="text-sm">
          Focus on{" "}
          <span className="target font-semibold text-accent">
            {attempt.focus.slice(0, 3).join(", ")}
          </span>
          .
        </p>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="9"
        y="3"
        width="6"
        height="11"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
