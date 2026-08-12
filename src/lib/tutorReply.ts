/**
 * The tutor answers in `<t>/<en>/<fix>` tags so the target language can be
 * spoken aloud without the translation leaking into the audio. Parsing
 * tolerates partial text, since replies stream in token by token.
 */
export interface TutorReply {
  target: string;
  en: string;
  fix: string;
}

function tag(text: string, name: string): string {
  const closed = new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(text);
  if (closed) return closed[1].trim();
  // Still streaming: take everything after the opening tag.
  const open = new RegExp(`<${name}>([\\s\\S]*)$`).exec(text);
  return open ? open[1].replace(/<[^>]*$/, "").trim() : "";
}

export function parseTutorReply(text: string): TutorReply {
  const target = tag(text, "t");
  const en = tag(text, "en");
  const fix = tag(text, "fix");

  // If the model ignored the format, treat the whole thing as target language.
  if (!target && !en && !fix && text.trim()) {
    return { target: text.trim(), en: "", fix: "" };
  }
  return { target, en, fix };
}

/** True once the target-language line is finished and safe to speak. */
export function targetIsComplete(text: string): boolean {
  return /<t>[\s\S]*?<\/t>/.test(text);
}
