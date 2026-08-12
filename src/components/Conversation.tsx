"use client";

import { useChat } from "@ai-sdk/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AudioButton from "./AudioButton";
import { allPhrases } from "@/content";
import { useHydrated, useProgress } from "@/lib/hooks";
import { listen, recognitionSupported, speak, type Listener } from "@/lib/speech";
import { targetIsComplete, parseTutorReply } from "@/lib/tutorReply";
import type { LanguageConfig } from "@/lib/types";

export default function Conversation({ language }: { language: LanguageConfig }) {
  const params = useSearchParams();
  const initialLesson = params.get("lesson") ?? "";
  const { ui, locale, code, lessons, nameEn } = language;

  const [scenarioId, setScenarioId] = useState(initialLesson);
  const [input, setInput] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const listenerRef = useRef<Listener | null>(null);
  const spokenRef = useRef<Set<string>>(new Set());
  const endRef = useRef<HTMLDivElement>(null);

  const hydrated = useHydrated();
  const progress = useProgress();
  const micSupported = hydrated && recognitionSupported();

  const scenario = scenarioId
    ? lessons.find((lesson) => lesson.id === scenarioId)?.roleplay
    : undefined;

  /** Phrases the learner has actually practised, so the tutor stays in range. */
  const known = useMemo(
    () =>
      allPhrases(language)
        .filter(({ phrase }) => progress.phrases[`${code}:${phrase.id}`])
        .map(({ phrase }) => phrase.target),
    [language, progress, code]
  );

  const { messages, sendMessage, status, error } = useChat();

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      sendMessage({ text: trimmed }, { body: { scenario, known, language: nameEn } });
      setInput("");
    },
    [sendMessage, scenario, known, nameEn]
  );

  // Speak each reply once, as soon as the target-language line closes.
  useEffect(() => {
    if (!autoSpeak) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;

    const raw = last.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
    if (!targetIsComplete(raw) || spokenRef.current.has(last.id)) return;

    spokenRef.current.add(last.id);
    speak(parseTutorReply(raw).target, { locale });
  }, [messages, autoSpeak, locale]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const toggleMic = () => {
    if (listening) {
      listenerRef.current?.stop();
      setListening(false);
      return;
    }
    setMicError(null);
    setListening(true);
    listenerRef.current = listen({
      locale,
      onPartial: setInput,
      onFinal: (text) => {
        setListening(false);
        if (text) send(text);
        else setMicError("Didn't catch that — try again.");
      },
      onError: (message) => {
        setListening(false);
        setMicError(message);
      },
    });
  };

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3">
        <label className="text-sm text-muted">
          {ui.situation}
          <select
            value={scenarioId}
            onChange={(event) => setScenarioId(event.target.value)}
            className="ml-2 rounded-lg border border-line bg-background px-2 py-1.5 text-sm text-foreground"
          >
            <option value="">{ui.freeChat}</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title} — {lesson.titleEn}
              </option>
            ))}
          </select>
        </label>
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={autoSpeak}
            onChange={(event) => setAutoSpeak(event.target.checked)}
            className="accent-[var(--accent)]"
          />
          {ui.speakReplies}
        </label>
      </div>

      <div className="min-h-[24rem] space-y-4 rounded-2xl border border-line bg-surface p-5">
        {messages.length === 0 && (
          <div className="space-y-3 py-8 text-center text-muted">
            <p className="text-2xl">💬</p>
            <p>
              {scenario
                ? "Say hello to open the scene."
                : `Start with a greeting — anything in ${nameEn} will do.`}
            </p>
          </div>
        )}

        {messages.map((message) => {
          const raw = message.parts
            .map((part) => (part.type === "text" ? part.text : ""))
            .join("");

          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <p className="target max-w-[85%] rounded-2xl bg-accent-soft px-4 py-2.5">
                  {raw}
                </p>
              </div>
            );
          }

          return <TutorMessage key={message.id} raw={raw} language={language} />;
        })}

        {busy && <p className="text-sm text-muted">…</p>}

        {error && (
          <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">
            {error.message.includes("501") || error.message.includes("AI_GATEWAY")
              ? "Conversation mode needs an AI Gateway key in .env.local. Everything else in the app works without one."
              : error.message}
          </p>
        )}

        <div ref={endRef} />
      </div>

      {micError && (
        <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{micError}</p>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2"
      >
        {micSupported && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? "Stop listening" : `Speak in ${nameEn}`}
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors ${
              listening
                ? "listening bg-accent text-white"
                : "border border-line bg-surface hover:border-accent hover:text-accent"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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
          </button>
        )}
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={listening ? ui.listening : ui.inputPlaceholder}
          className="target h-12 flex-1 rounded-xl border border-line bg-surface px-4 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="h-12 rounded-xl bg-accent px-5 font-medium text-white disabled:opacity-40"
        >
          {ui.send}
        </button>
      </form>
    </div>
  );
}

function TutorMessage({ raw, language }: { raw: string; language: LanguageConfig }) {
  const [showEn, setShowEn] = useState(false);
  const reply = parseTutorReply(raw);
  const { ui, locale } = language;

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-2 rounded-2xl border border-line bg-sunk px-4 py-3">
        <p className="target text-lg leading-snug">{reply.target}</p>

        <div className="flex flex-wrap items-center gap-2">
          {reply.target && (
            <AudioButton
              text={reply.target}
              locale={locale}
              label={ui.listen}
              slowLabel={ui.slow}
              size="sm"
              withSlow
            />
          )}
          {reply.en && (
            <button
              onClick={() => setShowEn((open) => !open)}
              className="text-xs text-muted underline decoration-dotted underline-offset-4 hover:text-accent"
            >
              {showEn ? ui.hide : ui.translate}
            </button>
          )}
        </div>

        {showEn && reply.en && <p className="text-sm text-muted">{reply.en}</p>}

        {reply.fix && (
          <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">{reply.fix}</p>
        )}
      </div>
    </div>
  );
}
