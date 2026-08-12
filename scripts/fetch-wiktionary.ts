/**
 * Stage 1 of the lexicon pipeline: pull Wiktionary data into a local cache.
 *
 *   npx tsx scripts/fetch-wiktionary.ts nl
 *
 * Streams the Kaikki machine-readable Wiktionary extract (hundreds of MB) and
 * keeps only the fields the app needs, writing a compact cache to `data/`.
 * The cache is gitignored and never ships — `build-lexicon.ts` selects the
 * handful of entries the curriculum actually uses.
 *
 * Source: https://kaikki.org (Tatu Ylonen's Wiktionary extractions).
 * Wiktionary content is CC BY-SA; anything derived from it carries the same
 * licence. See docs/ATTRIBUTION.md.
 */
import { createWriteStream, mkdirSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import type { PartOfSpeech } from "../src/lib/types";

interface SourceConfig {
  url: string;
  /** Wiktionary's language code inside the dump. */
  langCode: string;
  /**
   * Maps a gender letter to the article the learner needs.
   *
   * Returning `undefined` is deliberate and important: an unknown gender must
   * stay blank so the validator flags it, rather than being guessed. A wrong
   * article is worse than a missing one — the learner drills it and it sets.
   */
  article: (gender: Gender) => string | undefined;
}

/** Gender letters as Wiktionary records them. */
type Gender = "n" | "m" | "f" | "c" | "ambiguous" | "unknown";

const SOURCES: Record<string, SourceConfig> = {
  nl: {
    url: "https://kaikki.org/dictionary/Dutch/kaikki.org-dictionary-Dutch.jsonl",
    langCode: "nl",
    // Dutch collapses masculine/feminine into the common-gender article "de".
    article: (gender) =>
      gender === "n" ? "het" : ["m", "f", "c"].includes(gender) ? "de" : undefined,
  },
  fr: {
    url: "https://kaikki.org/dictionary/French/kaikki.org-dictionary-French.jsonl",
    langCode: "fr",
    article: (gender) => (gender === "f" ? "la" : gender === "m" ? "le" : undefined),
  },
};

/**
 * Gender lives in the head template's first argument (`nl-noun|n`), not in the
 * entry's `tags`. Reading it from the wrong place is what made an earlier run
 * label every neuter noun "de".
 */
function readGender(entry: KaikkiEntry): Gender {
  const raw = entry.head_templates?.[0]?.args?.["1"] ?? entry.head_templates?.[0]?.args?.["g"];
  if (typeof raw !== "string") return "unknown";

  const letters = new Set(
    raw
      .split(/[|,\s]+/)
      .map((part) => part.trim().toLowerCase())
      .filter((part) => ["n", "m", "f", "c", "mf"].includes(part))
  );
  if (!letters.size) return "unknown";

  const neuter = letters.has("n");
  const common = letters.has("m") || letters.has("f") || letters.has("c") || letters.has("mf");
  if (neuter && common) return "ambiguous";
  if (neuter) return "n";
  if (letters.has("c") || letters.has("mf")) return "c";
  if (letters.has("f") && letters.has("m")) return "ambiguous";
  return letters.has("f") ? "f" : "m";
}

/** Kaikki part-of-speech strings we keep, mapped to ours. */
const POS_MAP: Record<string, PartOfSpeech> = {
  noun: "noun",
  verb: "verb",
  adj: "adj",
  adv: "adv",
  prep: "prep",
  pron: "pron",
  det: "det",
  article: "det",
  num: "num",
  conj: "conj",
  intj: "interj",
  name: "name",
  phrase: "phrase",
  prep_phrase: "phrase",
};

interface KaikkiSense {
  glosses?: string[];
  tags?: string[];
  raw_glosses?: string[];
}

interface KaikkiForm {
  form?: string;
  tags?: string[];
}

interface KaikkiHeadTemplate {
  name?: string;
  args?: Record<string, string>;
}

interface KaikkiEntry {
  word?: string;
  pos?: string;
  lang_code?: string;
  senses?: KaikkiSense[];
  forms?: KaikkiForm[];
  head_templates?: KaikkiHeadTemplate[];
  tags?: string[];
}

/** What we keep per word — deliberately small. */
export interface CachedEntry {
  lemma: string;
  pos: PartOfSpeech;
  en: string;
  article?: string;
  plural?: string;
  participle?: string;
  /**
   * Every inflected surface form. Needed so the curriculum's `woont` can be
   * traced back to the lemma `wonen` without a morphological analyser.
   */
  forms?: string[];
  tags?: string[];
}

function firstGloss(entry: KaikkiEntry): string | undefined {
  for (const sense of entry.senses ?? []) {
    // Skip form-of / inflection senses; they aren't definitions.
    if (sense.tags?.some((t) => ["form-of", "inflection-of", "obsolete", "archaic"].includes(t))) {
      continue;
    }
    const gloss = sense.glosses?.[0];
    if (gloss && gloss.length < 140) return gloss;
  }
  return undefined;
}

function formWith(entry: KaikkiEntry, required: string[]): string | undefined {
  for (const form of entry.forms ?? []) {
    if (!form.form || form.form === "-" || form.form.includes(" ")) continue;
    if (required.every((tag) => form.tags?.includes(tag))) return form.form;
  }
  return undefined;
}

/** Tags that mark a "form" which isn't actually a surface word. */
const NON_FORM_TAGS = ["table-tags", "inflection-template", "class"];

function allForms(entry: KaikkiEntry, lemma: string): string[] {
  const forms = new Set<string>();
  for (const form of entry.forms ?? []) {
    const value = form.form;
    if (!value || value === "-" || value === lemma) continue;
    if (value.includes(" ") || value.length > 32) continue;
    if (form.tags?.some((tag) => NON_FORM_TAGS.includes(tag))) continue;
    if (!/^[\p{L}'-]+$/u.test(value)) continue;
    forms.add(value.toLowerCase());
  }
  // Cap it — a handful of Dutch verbs list dozens of archaic variants.
  return [...forms].slice(0, 24);
}

function convert(entry: KaikkiEntry, config: SourceConfig): CachedEntry | null {
  if (entry.lang_code !== config.langCode || !entry.word || !entry.pos) return null;

  const pos = POS_MAP[entry.pos];
  if (!pos) return null;

  const en = firstGloss(entry);
  if (!en) return null;

  const tags = entry.tags ?? [];
  const isNoun = pos === "noun";
  const forms = allForms(entry, entry.word);

  return {
    lemma: entry.word,
    pos,
    en,
    article: isNoun ? config.article(readGender(entry)) : undefined,
    plural: isNoun ? formWith(entry, ["plural"]) : undefined,
    participle: pos === "verb" ? formWith(entry, ["participle", "past"]) : undefined,
    forms: forms.length ? forms : undefined,
    tags: tags.length ? tags.slice(0, 6) : undefined,
  };
}

async function main() {
  const lang = process.argv[2];
  const config = SOURCES[lang];
  if (!config) {
    console.error(`Usage: tsx scripts/fetch-wiktionary.ts <${Object.keys(SOURCES).join("|")}>`);
    process.exit(1);
  }

  mkdirSync("data", { recursive: true });
  const outPath = `data/wiktionary-${lang}.jsonl`;

  console.log(`Fetching ${config.url}`);
  const response = await fetch(config.url);
  if (!response.ok || !response.body) {
    console.error(`Download failed: ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const out = createWriteStream(outPath);

  let received = 0;
  let buffer = "";
  let read = 0;
  let kept = 0;
  let lastLog = Date.now();

  // Best entry per lemma+pos — later duplicates rarely improve on the first.
  const seen = new Set<string>();

  const decoder = new TextDecoder();

  async function* lines() {
    for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
      received += chunk.byteLength;
      buffer += decoder.decode(chunk, { stream: true });

      let index: number;
      while ((index = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);
        if (line) yield line;
      }

      if (Date.now() - lastLog > 5000) {
        // No percentage: the server gzips, so `received` (decompressed) has no
        // fixed relationship to content-length.
        const mb = (received / 1_048_576).toFixed(0);
        console.log(`  ${mb} MB parsed — ${read.toLocaleString()} read, ${kept.toLocaleString()} kept`);
        lastLog = Date.now();
      }
    }
    if (buffer) yield buffer;
  }

  async function* convertLines() {
    for await (const line of lines()) {
      read++;
      let parsed: KaikkiEntry;
      try {
        parsed = JSON.parse(line) as KaikkiEntry;
      } catch {
        continue;
      }
      const entry = convert(parsed, config);
      if (!entry) continue;

      const key = `${entry.lemma} ${entry.pos}`;
      if (seen.has(key)) continue;
      seen.add(key);

      kept++;
      yield JSON.stringify(entry) + "\n";
    }
  }

  await pipeline(convertLines(), out);

  console.log(`\n✓ ${kept.toLocaleString()} entries → ${outPath}`);
  console.log(`  (from ${read.toLocaleString()} source rows)`);
  console.log("  Wiktionary content is CC BY-SA — see docs/ATTRIBUTION.md");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
