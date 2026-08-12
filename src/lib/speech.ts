/**
 * Thin wrappers over the browser's built-in Web Speech API.
 *
 * Deliberately dependency-free and key-free: speech synthesis and recognition
 * both ship inside Chrome/Edge, so there is no quota to exhaust and no billing
 * to fall off. Support is best in Chromium browsers; Safari's recognition is
 * partial, which `recognitionSupported()` reports honestly rather than hiding.
 */

// ── Text to speech ──────────────────────────────────────────────────────────

let voicesCache: SpeechSynthesisVoice[] = [];

/** Voices populate asynchronously; resolve once they actually exist. */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) {
    voicesCache = existing;
    return Promise.resolve(existing);
  }
  return new Promise((resolve) => {
    const done = () => {
      voicesCache = window.speechSynthesis.getVoices();
      resolve(voicesCache);
    };
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    // Some browsers never fire the event if the list was already warm.
    setTimeout(done, 1000);
  });
}

/** Voices matching a BCP-47 tag, e.g. "nl-NL" matches any nl-* voice. */
export function voicesFor(locale: string): SpeechSynthesisVoice[] {
  const base = locale.split("-")[0].toLowerCase();
  return voicesCache.filter((v) => v.lang.toLowerCase().startsWith(base));
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export interface SpeakOptions {
  /** BCP-47 tag of the language being learned. */
  locale: string;
  /** 1 is normal. Use ~0.6 for the "slow it down" button. */
  rate?: number;
  voiceURI?: string;
  onEnd?: () => void;
}

export function speak(text: string, opts: SpeakOptions): void {
  if (!speechSupported()) return;
  // Chrome queues utterances and gets stuck; always clear first.
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = opts.locale;
  utterance.rate = opts.rate ?? 1;

  const candidates = voicesFor(opts.locale);
  const chosen =
    (opts.voiceURI && candidates.find((v) => v.voiceURI === opts.voiceURI)) ||
    candidates.find((v) => v.lang === opts.locale) ||
    candidates[0];
  if (chosen) utterance.voice = chosen;

  if (opts.onEnd) utterance.addEventListener("end", opts.onEnd);
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}

// ── Speech to text ──────────────────────────────────────────────────────────

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionResultEventLike {
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }
  >;
}

function recognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function recognitionSupported(): boolean {
  return recognitionCtor() !== null;
}

export interface ListenHandlers {
  /** BCP-47 tag of the language being learned. */
  locale: string;
  /** Fires repeatedly as the browser refines its guess. */
  onPartial?: (text: string) => void;
  /** Fires once with the browser's best final transcript. */
  onFinal: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface Listener {
  stop: () => void;
}

/**
 * Listen for a single utterance in the target language. Returns a handle so the
 * caller can stop early; recognition also ends by itself when the speaker
 * pauses.
 */
export function listen(handlers: ListenHandlers): Listener | null {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    handlers.onError?.("unsupported");
    return null;
  }

  const recognition = new Ctor();
  recognition.lang = handlers.locale;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let settled = false;

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const text = result[0].transcript;
      if (result.isFinal) {
        settled = true;
        handlers.onFinal(text.trim());
        return;
      }
      interim += text;
    }
    if (interim) handlers.onPartial?.(interim.trim());
  };

  recognition.onerror = (event) => {
    const message =
      event.error === "not-allowed"
        ? "Microphone permission was blocked. Allow mic access and try again."
        : event.error === "no-speech"
          ? "Didn't catch anything — try again a little louder."
          : event.error;
    handlers.onError?.(message);
  };

  recognition.onend = () => {
    // A pause with no final result still needs to release the UI.
    if (!settled) handlers.onFinal("");
    handlers.onEnd?.();
  };

  try {
    recognition.start();
  } catch {
    handlers.onError?.("Could not start the microphone.");
    return null;
  }

  return { stop: () => recognition.stop() };
}
