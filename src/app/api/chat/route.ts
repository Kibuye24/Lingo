import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type LanguageModel,
  type UIMessage,
} from "ai";

export const maxDuration = 60;

interface Body {
  messages: UIMessage[];
  /** Roleplay setup from a lesson, if the learner came from one. */
  scenario?: string;
  /** Phrases the learner has met, so the tutor can stay inside them. */
  known?: string[];
  /** English name of the language being learned, e.g. "Dutch". */
  language?: string;
}

/**
 * Which model backs the tutor, decided at request time by whichever key is set.
 *
 * Gemini is the primary path — the app ships with a Google API key ("AI" in the
 * env). If instead an AI Gateway key is present, it falls back to Claude through
 * the gateway. With neither, conversation mode is politely unavailable and the
 * rest of the app is untouched.
 */
function pickModel(): { model: LanguageModel } | { error: string } {
  const geminiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    return { model: google("gemini-2.5-flash-lite") };
  }

  if (process.env.AI_GATEWAY_API_KEY) {
    return { model: "anthropic/claude-sonnet-5" };
  }

  return {
    error:
      "No AI key set. Add GEMINI_API_KEY to .env.local to enable conversation mode — lessons, vocabulary and review all work without it.",
  };
}

function systemPrompt(
  language: string,
  scenario: string | undefined,
  known: string[] | undefined
) {
  return [
    `You are a warm, patient ${language} conversation tutor for an English-speaking beginner (A1-A2).`,
    "",
    "Rules for every reply:",
    `- Speak ${language}. Keep it to one or two short sentences — this is speech, not prose.`,
    "- Stay near the learner's level. Prefer common words and simple present tense.",
    "- Always end with a question or an opening, so the conversation keeps moving.",
    `- Never switch to English in the ${language} line, even if the learner writes English.`,
    `- If the learner says something in English, answer the intent in simple ${language} anyway.`,
    "",
    `Correction policy: correct only what genuinely blocks understanding or is a repeated`,
    `pattern error. Ignore small typos, accents and missing capitals — this text came from`,
    `speech recognition, so spelling and punctuation are not the learner's fault.`,
    "",
    "Format every reply as exactly these three tags, in this order, nothing outside them:",
    `<t>your ${language} reply</t>`,
    `<en>a natural English translation of your ${language} reply</en>`,
    `<fix>one short English note about the learner's ${language}, or leave empty if it was fine</fix>`,
    scenario ? `\nScenario you are playing: ${scenario}` : "",
    known?.length
      ? `\nThe learner has studied these phrases; lean on them and reuse them where natural:\n${known
          .map((phrase) => `- ${phrase}`)
          .join("\n")}`
      : "",
  ].join("\n");
}

export async function POST(req: Request) {
  const picked = pickModel();
  if ("error" in picked) {
    return Response.json({ error: picked.error }, { status: 501 });
  }

  const { messages, scenario, known, language = "Dutch" }: Body = await req.json();

  const result = streamText({
    model: picked.model,
    system: systemPrompt(language, scenario, known),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
