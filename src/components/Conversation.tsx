"use client";

import { useChat } from "@ai-sdk/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AudioButton from "./AudioButton";
import { MicIcon, SendIcon } from "./Icons";
import { allPhrases } from "@/content";
import { useHydrated, useProgress } from "@/lib/hooks";
import { listen, recognitionSupported, speak, type Listener } from "@/lib/speech";
import { targetIsComplete, parseTutorReply } from "@/lib/tutorReply";
import type { LanguageConfig } from "@/lib/types";

/**
 * Voice-first tutor screen.
 *
 * Built around the mic rather than the keyboard: the whole point is speaking,
 * so the mic is the largest control and typing is the fallback. The empty
 * state says "tap to speak" instead of showing a text cursor for the same
 * reason.
 */
export default function Conversation({
  language,
  initialScenarioId,
}: {
  language: LanguageConfig;
  initialScenarioId?: string;
}) {
  const params = useSearchParams();
  const initialLesson = initialScenarioId ?? params.get("lesson") ?? "";
  const { ui, locale, code, lessons, nameEn, name } = language;

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
  const empty = messages.length === 0;

  return (
    <div className="flex min-h-[calc(100vh-11rem)] flex-col">
      {/* Tutor identity */}
      <div className="flex items-center gap-3 rounded-3xl border border-line bg-surface p-3">
        <span
          aria-hidden
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-[#b8410b] text-lg text-white"
        >
          {language.flag}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">Tutor · {name}</p>
          <select
            value={scenarioId}
            onChange={(event) => setScenarioId(event.target.value)}
            className="-ml-1 max-w-full truncate bg-transparent text-xs text-muted outline-none"
          >
            <option value="">{ui.freeChat}</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setAutoSpeak((on) => !on)}
          aria-pressed={autoSpeak}
          title={ui.speakReplies}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors ${
            autoSpeak
              ? "border-accent bg-accent-soft text-accent"
              : "border-line text-muted hover:text-foreground"
          }`}
        >
          🔊
        </button>
      </div>

      {/* Conversation */}
      <div className="flex-1 space-y-3 py-4">
        {empty && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span
              aria-hidden
              className={`grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-accent to-[#b8410b] text-4xl text-white ${
                listening ? "listening" : ""
              }`}
            >
              {language.flag}
            </span>
            <p className="font-medium">
              {micSupported ? "Tik op de microfoon" : "Typ om te beginnen"}
            </p>
            <p className="max-w-[16rem] text-sm text-muted">
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
                <p className="target max-w-[80%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-white">
                  {raw}
                </p>
              </div>
            );
          }
          return <TutorMessage key={message.id} raw={raw} language={language} />;
        })}

        {busy && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3">
              <Dot delay="0ms" />
              <Dot delay="150ms" />
              <Dot delay="300ms" />
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-bad-soft px-3 py-2 text-sm text-bad">
            {error.message.includes("501") || error.message.toLowerCase().includes("ai key")
              ? "Conversation mode needs a Gemini API key. Everything else in the app works without one."
              : error.message}
          </p>
        )}

        <div ref={endRef} />
      </div>

      {micError && (
        <p className="mb-2 rounded-xl bg-bad-soft px-3 py-2 text-sm text-bad">{micError}</p>
      )}

      {/* Composer — mic first, typing as the fallback */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="sticky bottom-20 flex items-center gap-2 rounded-full border border-line bg-surface p-1.5 shadow-sm"
      >
        {micSupported && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? "Stop listening" : `Speak in ${nameEn}`}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors ${
              listening ? "listening bg-accent text-white" : "bg-accent-soft text-accent"
            }`}
          >
            <MicIcon className="h-5 w-5" />
          </button>
        )}
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={listening ? ui.listening : ui.inputPlaceholder}
          className="target h-11 min-w-0 flex-1 bg-transparent px-1 outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label={ui.send}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white transition-opacity disabled:opacity-30"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-muted"
      style={{ animationDelay: delay }}
    />
  );
}

function TutorMessage({ raw, language }: { raw: string; language: LanguageConfig }) {
  const [showEn, setShowEn] = useState(false);
  const reply = parseTutorReply(raw);
  const { ui, locale } = language;

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-2 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3">
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
