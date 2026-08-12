import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
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
  if (!process.env.AI_GATEWAY_API_KEY) {
    return Response.json(
      {
        error:
          "No AI_GATEWAY_API_KEY set. Add one to .env.local to enable conversation mode — the lessons, sound lab and review all work without it.",
      },
      { status: 501 }
    );
  }

  const { messages, scenario, known, language = "Dutch" }: Body = await req.json();

  const result = streamText({
    model: "anthropic/claude-sonnet-5",
    system: systemPrompt(language, scenario, known),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
