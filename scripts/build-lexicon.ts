/**
 * Stage 2 of the lexicon pipeline: select the shipped lexicon from the cache.
 *
 *   npx tsx scripts/build-lexicon.ts nl
 *
 * Reads every word the curriculum actually uses, looks each up in the local
 * Wiktionary cache, and writes only those entries to
 * `src/content/<lang>/lexicon.generated.ts`.
 *
 * This is what keeps the app light: the cache is tens of megabytes, the shipped
 * file is a few hundred kilobytes. Curated entries always win — generated ones
 * only fill gaps.
 *
 * Generated output is Wiktionary-derived and therefore CC BY-SA. See
 * docs/ATTRIBUTION.md.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { languages } from "../src/content";
import type { LanguageConfig, LexiconEntry, PartOfSpeech } from "../src/lib/types";

interface CachedEntry {
  lemma: string;
  pos: PartOfSpeech;
  en: string;
  article?: string;
  plural?: string;
  participle?: string;
  forms?: string[];
  tags?: string[];
}

/** Prefer content words when the same surface form has several entries. */
const POS_RANK: PartOfSpeech[] = [
  "noun",
  "verb",
  "adj",
  "adv",
  "prep",
  "pron",
  "det",
  "num",
  "conj",
  "interj",
  "name",
  "phrase",
];

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:«»„""()\[\]…—–]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  const withoutQuotes = text.replace(/(^|\s)'[^']*'(?=[^a-zà-ÿ]|$)/g, " ");
  return normalise(withoutQuotes)
    .split(" ")
    .flatMap((word) => {
      if (!word) return [];
      if (/^[a-zà-ÿ]'/.test(word)) return [word];
      return word.split("-").filter(Boolean);
    })
    .filter((word) => /[a-zà-ÿ]/.test(word))
    .map((word) => word.replace(/^['']|['']$/g, ""))
    .filter(Boolean);
}

/** Every target-language token the curriculum uses. */
function curriculumWords(language: LanguageConfig): Set<string> {
  const words = new Set<string>();
  const add = (text: string) => tokens(text).forEach((word) => words.add(word));

  for (const lesson of language.lessons) {
    for (const phrase of lesson.phrases) {
      add(phrase.target);
      phrase.gloss.forEach((part) => add(part.target));
      phrase.pattern?.slots.forEach((slot) => add(slot.target));
    }
    lesson.dialogue.forEach((turn) => add(turn.target));
  }
  for (const drill of language.soundDrills) {
    drill.words.forEach((word) => add(word.target));
    if (drill.tongueTwister) add(drill.tongueTwister);
  }
  for (const set of language.vocabSets) {
    for (const item of set.items) {
      add(item.target);
      if (item.article) add(item.article);
      if (item.plural) add(item.plural);
    }
    set.examples?.forEach((example) => add(example.target));
  }
  for (const point of language.grammar) {
    point.examples?.forEach((example) => add(example.target));
  }
  for (const drill of language.sentenceDrills) {
    drill.subjects.forEach((subject) => add(subject.target));
    drill.verbs.forEach((verb) => add(verb.infinitive));
    drill.objects.forEach((object) => add(object.target));
  }
  for (const verb of language.verbs) {
    add(verb.infinitive);
    add(verb.participle);
    if (verb.irregularPast) {
      add(verb.irregularPast.singular);
      add(verb.irregularPast.plural);
    }
    if (verb.irregular) Object.values(verb.irregular).forEach((form) => add(form));
    Object.values(verb.examples).forEach((example) => add(example.target));
  }
  return words;
}

function loadCache(lang: string): CachedEntry[] {
  const path = `data/wiktionary-${lang}.jsonl`;
  if (!existsSync(path)) {
    console.error(`No cache at ${path} — run: npx tsx scripts/fetch-wiktionary.ts ${lang}`);
    process.exit(1);
  }
  return readFileSync(path, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CachedEntry);
}

/** surface form → best entry for it. */
function indexCache(entries: CachedEntry[]): Map<string, CachedEntry> {
  const index = new Map<string, CachedEntry>();

  const better = (a: CachedEntry, b: CachedEntry) =>
    POS_RANK.indexOf(a.pos) < POS_RANK.indexOf(b.pos) ? a : b;

  for (const entry of entries) {
    const keys = [entry.lemma.toLowerCase(), ...(entry.forms ?? [])];
    for (const key of keys) {
      const existing = index.get(key);
      // An exact lemma match always beats an inflected-form match.
      if (!existing) {
        index.set(key, entry);
      } else if (key === entry.lemma.toLowerCase() && existing.lemma.toLowerCase() !== key) {
        index.set(key, entry);
      } else if (existing.lemma.toLowerCase() !== key) {
        index.set(key, better(existing, entry));
      }
    }
  }
  return index;
}

function serialise(entry: LexiconEntry): string {
  const parts: string[] = [
    `lemma: ${JSON.stringify(entry.lemma)}`,
    `pos: ${JSON.stringify(entry.pos)}`,
    `en: ${JSON.stringify(entry.en)}`,
  ];
  if (entry.article) parts.push(`article: ${JSON.stringify(entry.article)}`);
  if (entry.plural) parts.push(`plural: ${JSON.stringify(entry.plural)}`);
  if (entry.participle) parts.push(`participle: ${JSON.stringify(entry.participle)}`);
  if (entry.forms?.length) parts.push(`forms: ${JSON.stringify(entry.forms)}`);
  if (entry.flags?.length) parts.push(`flags: ${JSON.stringify(entry.flags)}`);
  parts.push(`source: ${JSON.stringify(entry.source)}`);
  return `  { ${parts.join(", ")} },`;
}

function build(language: LanguageConfig) {
  const wanted = curriculumWords(language);
  const curated = new Set<string>();
  for (const entry of language.curatedLexicon) {
    curated.add(entry.lemma.toLowerCase());
    entry.forms?.forEach((form) => curated.add(form.toLowerCase()));
    if (entry.plural) curated.add(entry.plural.toLowerCase());
    if (entry.participle) curated.add(entry.participle.toLowerCase());
  }

  const index = indexCache(loadCache(language.code));

  const generated: LexiconEntry[] = [];
  const missing: string[] = [];
  const emitted = new Set<string>();

  for (const word of [...wanted].sort()) {
    if (curated.has(word)) continue;

    const hit = index.get(word);
    if (!hit) {
      missing.push(word);
      continue;
    }
    if (emitted.has(hit.lemma.toLowerCase())) continue;
    emitted.add(hit.lemma.toLowerCase());

    // Every Dutch diminutive is neuter, whatever its base noun's gender is.
    // Emit it as its own entry so "het bonnetje" doesn't inherit "de bon".
    const isDiminutive =
      language.code === "nl" && hit.pos === "noun" && /(?:tje|pje|kje|je)$/.test(word);

    if (isDiminutive) {
      emitted.delete(hit.lemma.toLowerCase());
      generated.push({
        lemma: word,
        pos: "noun",
        en: `${hit.en} (diminutive)`,
        article: "het",
        flags: ["diminutive"],
        source: "wiktionary",
      });
      continue;
    }

    // Keep only the forms the curriculum needs, so the shipped file stays small.
    const usefulForms = (hit.forms ?? []).filter((form) => wanted.has(form));

    generated.push({
      lemma: hit.lemma,
      pos: hit.pos,
      en: hit.en,
      article: hit.article,
      plural: hit.plural && wanted.has(hit.plural) ? hit.plural : undefined,
      participle: hit.participle,
      forms: usefulForms.length ? usefulForms : undefined,
      source: "wiktionary",
    });
  }

  const header = `import type { LexiconEntry } from "@/lib/types";

/**
 * GENERATED — do not edit by hand.
 * Rebuild with: npx tsx scripts/build-lexicon.ts ${language.code}
 *
 * Derived from Wiktionary via kaikki.org. This data is licensed CC BY-SA 4.0;
 * see docs/ATTRIBUTION.md. Hand-written entries live in lexicon.ts and take
 * precedence over anything here.
 */
export const generatedLexicon: LexiconEntry[] = [
`;

  const path = `src/content/${language.code}/lexicon.generated.ts`;
  writeFileSync(path, header + generated.map(serialise).join("\n") + "\n];\n");

  const bytes = Buffer.byteLength(readFileSync(path));
  console.log(
    `${language.nameEn}: ${generated.length} generated + ${language.curatedLexicon.length} curated ` +
      `(${(bytes / 1024).toFixed(0)} KB shipped)`
  );

  if (missing.length) {
    console.log(`  ${missing.length} still unresolved — add to lexicon.ts by hand:`);
    console.log(`    ${missing.join(" ")}`);
  }
  return missing.length;
}

const only = process.argv[2];
const targets = only ? languages.filter((l) => l.code === only) : languages;
if (!targets.length) {
  console.error(`Unknown language "${only}"`);
  process.exit(1);
}

let unresolved = 0;
for (const language of targets) unresolved += build(language);

console.log(
  unresolved
    ? `\n${unresolved} word(s) need a hand-written entry before \`npm run validate\` passes.`
    : "\n✓ every curriculum word resolved"
);
