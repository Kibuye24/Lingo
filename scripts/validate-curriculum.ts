/**
 * Curriculum gate.
 *
 * Every phrase, gloss, pattern slot, dialogue line and sound-drill word is
 * checked against the language's lexicon. This is what makes AI-drafted lessons
 * safe to ship: the model proposes, the lexicon disposes, and human review only
 * has to read what survives.
 *
 * Run with `npm run validate`. Exits non-zero on any error.
 */
import { languages } from "../src/content";
import type { LanguageConfig, LexiconEntry } from "../src/lib/types";

interface Problem {
  language: string;
  where: string;
  message: string;
}

const errors: Problem[] = [];
const warnings: Problem[] = [];

/** Words allowed to appear without a lexicon entry, per language. */
const ALLOWED_EXTRAS: Record<string, string[]> = {
  nl: ["e"], // the "e" in "e-mail" — a hyphenated abbreviation, not a word
  fr: [],
};

/** How many new words a single lesson may introduce before it's too dense. */
const NEW_WORD_BUDGET = 30;

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:«»„""()\[\]…—–]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split into checkable tokens. Quoted spans are dropped — materials legitimately
 * quote the learner's own language ("het betekent 'to write down'").
 *
 * The opening quote must follow a space or start of string, so French elision
 * (`d'Angleterre`, `j'habite`) is never mistaken for a quote.
 */
function tokens(text: string): string[] {
  const withoutQuotes = text.replace(/(^|\s)'[^']*'(?=[^a-zà-ÿ]|$)/g, " ");
  return normalise(withoutQuotes)
    .split(" ")
    .flatMap((word) => {
      if (!word) return [];
      // Keep elided French forms whole (j', d', l'), split hyphenated compounds.
      if (/^[a-zà-ÿ]'/.test(word)) return [word];
      return word.split("-").filter(Boolean);
    })
    .filter((word) => /[a-zà-ÿ]/.test(word))
    .map((word) => word.replace(/^['’]|['’]$/g, ""))
    .filter(Boolean);
}

/**
 * A word's own lemma always wins over being listed as someone else's form.
 *
 * Real bug this guards against: Dutch "beer" means both "bear" and, as a
 * cross-reference, "boar" (male pig) — Wiktionary lists "beer" under
 * varken's related forms. A naive last-write-wins index let the varken entry
 * clobber the standalone "de beer" (bear) entry, so the validator accused a
 * correct sentence of using the wrong article. Indexing lemmas first, and
 * only filling gaps from `forms` afterwards, keeps every word's own primary
 * entry authoritative over any other entry that merely mentions it.
 */
function buildIndex(lexicon: LexiconEntry[]): Map<string, LexiconEntry> {
  const index = new Map<string, LexiconEntry>();

  for (const entry of lexicon) {
    index.set(entry.lemma.toLowerCase(), entry);
  }
  for (const entry of lexicon) {
    const keys = [...(entry.forms ?? []), entry.plural, entry.participle];
    for (const key of keys) {
      if (key && !index.has(key.toLowerCase())) {
        index.set(key.toLowerCase(), entry);
      }
    }
  }

  return index;
}

/** Every piece of target-language text in a language, with a label for errors. */
function targetTexts(language: LanguageConfig): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];

  for (const lesson of language.lessons) {
    for (const phrase of lesson.phrases) {
      out.push({ where: `${lesson.id}/${phrase.id}`, text: phrase.target });
      for (const part of phrase.gloss) {
        out.push({ where: `${lesson.id}/${phrase.id} gloss`, text: part.target });
      }
      if (phrase.pattern) {
        for (const slot of phrase.pattern.slots) {
          out.push({ where: `${lesson.id}/${phrase.id} slot`, text: slot.target });
        }
      }
    }
    lesson.dialogue.forEach((turn, index) => {
      out.push({ where: `${lesson.id}/dialogue[${index}]`, text: turn.target });
    });
  }

  for (const drill of language.soundDrills) {
    for (const word of drill.words) {
      out.push({ where: `klanken/${drill.id}`, text: word.target });
    }
    if (drill.tongueTwister) {
      out.push({ where: `klanken/${drill.id} twister`, text: drill.tongueTwister });
    }
  }

  for (const set of language.vocabSets) {
    for (const item of set.items) {
      const withArticle = item.article ? `${item.article} ${item.target}` : item.target;
      out.push({ where: `woorden/${set.id}`, text: withArticle });
      if (item.plural) out.push({ where: `woorden/${set.id} plural`, text: item.plural });
    }
    for (const example of set.examples ?? []) {
      out.push({ where: `woorden/${set.id} example`, text: example.target });
    }
  }

  for (const point of language.grammar) {
    for (const example of point.examples ?? []) {
      out.push({ where: `grammatica/${point.id}`, text: example.target });
    }
  }

  for (const drill of language.sentenceDrills) {
    for (const subject of drill.subjects) {
      out.push({ where: `bouwen/${drill.id} subject`, text: subject.target });
    }
    for (const verb of drill.verbs) {
      out.push({ where: `bouwen/${drill.id} verb`, text: verb.infinitive });
    }
    for (const object of drill.objects) {
      out.push({ where: `bouwen/${drill.id} object`, text: object.target });
    }
  }

  for (const verb of language.verbs) {
    out.push({ where: `werkwoorden/${verb.id} infinitive`, text: verb.infinitive });
    out.push({ where: `werkwoorden/${verb.id} participle`, text: verb.participle });
    if (verb.irregularPast) {
      out.push({ where: `werkwoorden/${verb.id} past`, text: verb.irregularPast.singular });
      out.push({ where: `werkwoorden/${verb.id} past`, text: verb.irregularPast.plural });
    }
    if (verb.irregular) {
      for (const form of Object.values(verb.irregular)) {
        out.push({ where: `werkwoorden/${verb.id} present`, text: form });
      }
    }
    for (const [tense, example] of Object.entries(verb.examples)) {
      out.push({ where: `werkwoorden/${verb.id} ${tense}`, text: example.target });
    }
  }

  return out;
}

function checkVocabulary(language: LanguageConfig, index: Map<string, LexiconEntry>) {
  const allowed = new Set(ALLOWED_EXTRAS[language.code] ?? []);
  const missing = new Map<string, string[]>();

  for (const { where, text } of targetTexts(language)) {
    for (const token of tokens(text)) {
      if (index.has(token) || allowed.has(token)) continue;
      const seen = missing.get(token) ?? [];
      seen.push(where);
      missing.set(token, seen);
    }
  }

  for (const [word, places] of missing) {
    errors.push({
      language: language.code,
      where: places[0] + (places.length > 1 ? ` (+${places.length - 1} more)` : ""),
      message: `"${word}" is not in the lexicon`,
    });
  }
}

/**
 * Catches the error that matters most: a noun paired with the wrong article.
 *
 * Skips surface forms that also have a verb reading. Dutch is full of these —
 * "het was" is the verb `was`, not the noun `de was` (laundry); "het regent"
 * is the verb, not `de regent`. Flagging those would train people to ignore
 * the checker, which is worse than not checking.
 */
function checkArticleAgreement(language: LanguageConfig, index: Map<string, LexiconEntry>) {
  const definite = new Set(language.articles.map((a) => a.toLowerCase()));

  const posesByForm = new Map<string, Set<string>>();
  for (const entry of language.lexicon) {
    const keys = [entry.lemma, ...(entry.forms ?? []), entry.plural, entry.participle];
    for (const key of keys) {
      if (!key) continue;
      const lower = key.toLowerCase();
      if (!posesByForm.has(lower)) posesByForm.set(lower, new Set());
      posesByForm.get(lower)!.add(entry.pos);
    }
  }

  for (const { where, text } of targetTexts(language)) {
    const words = tokens(text);
    for (let i = 0; i < words.length - 1; i++) {
      if (!definite.has(words[i])) continue;

      // "Vandaag is het maandag" — after a verb, "het" is the pronoun "it",
      // not an article, so there is no agreement to check.
      if (i > 0 && posesByForm.get(words[i - 1])?.has("verb")) continue;

      const next = words[i + 1];
      if (posesByForm.get(next)?.has("verb")) continue;

      const entry = index.get(next);
      if (!entry || entry.pos !== "noun" || !entry.article) continue;

      // A plural noun takes the common-gender article in Dutch; skip those.
      if (entry.plural && next === entry.plural.toLowerCase()) continue;

      if (entry.article.toLowerCase() !== words[i]) {
        errors.push({
          language: language.code,
          where,
          message: `"${words[i]} ${next}" — lexicon says "${entry.article} ${entry.lemma}"`,
        });
      }
    }
  }
}

function checkStructure(language: LanguageConfig) {
  const lessonIds = new Set<string>();
  const phraseIds = new Set<string>();
  const unitIds = new Set(language.units.map((unit) => unit.id));

  for (const lesson of language.lessons) {
    if (lessonIds.has(lesson.id)) {
      errors.push({ language: language.code, where: lesson.id, message: "duplicate lesson id" });
    }
    lessonIds.add(lesson.id);

    if (!unitIds.has(lesson.unit)) {
      errors.push({
        language: language.code,
        where: lesson.id,
        message: `unit "${lesson.unit}" is not declared`,
      });
    }

    for (const phrase of lesson.phrases) {
      if (phraseIds.has(phrase.id)) {
        errors.push({
          language: language.code,
          where: `${lesson.id}/${phrase.id}`,
          message: "duplicate phrase id",
        });
      }
      phraseIds.add(phrase.id);

      // The gloss should account for the phrase, or it isn't a gloss.
      // A compound counts as covered when consecutive gloss parts spell it out
      // ("goedemorgen" glossed as goede + morgen).
      const glossParts = phrase.gloss.flatMap((part) => tokens(part.target));
      const glossed = new Set(glossParts);
      const compounds = new Set<string>();
      for (let i = 0; i < glossParts.length; i++) {
        let joined = "";
        for (let j = i; j < glossParts.length; j++) {
          joined += glossParts[j];
          compounds.add(joined);
        }
      }
      const uncovered = tokens(phrase.target).filter(
        (word) => !glossed.has(word) && !compounds.has(word)
      );
      if (uncovered.length) {
        warnings.push({
          language: language.code,
          where: `${lesson.id}/${phrase.id}`,
          message: `gloss misses: ${uncovered.join(", ")}`,
        });
      }
    }

    for (const [index, turn] of lesson.dialogue.entries()) {
      if (turn.speaker === "you" && !turn.cue) {
        errors.push({
          language: language.code,
          where: `${lesson.id}/dialogue[${index}]`,
          message: "learner turn has no cue",
        });
      }
    }

    if (!lesson.dialogue.some((turn) => turn.speaker === "you")) {
      errors.push({
        language: language.code,
        where: lesson.id,
        message: "dialogue never gives the learner a turn",
      });
    }
  }
}

/** Enforces i+1: each lesson should mostly reuse what came before. */
function checkVocabularyBudget(language: LanguageConfig) {
  const seen = new Set<string>();

  for (const lesson of language.lessons) {
    const words = new Set(
      lesson.phrases.flatMap((phrase) => tokens(phrase.target))
    );
    const fresh = [...words].filter((word) => !seen.has(word));
    if (fresh.length > NEW_WORD_BUDGET) {
      warnings.push({
        language: language.code,
        where: lesson.id,
        message: `introduces ${fresh.length} new words (budget ${NEW_WORD_BUDGET})`,
      });
    }
    for (const word of words) seen.add(word);
  }
}

/** Lexicon hygiene — a wrong entry here propagates into every lesson. */
function checkLexicon(language: LanguageConfig) {
  // Keyed on lemma+pos, not lemma alone — "bij" is legitimately both a
  // preposition (at/near) and a noun (bee); that's two words, not a duplicate.
  const seen = new Set<string>();
  for (const entry of language.lexicon) {
    const key = `${entry.lemma.toLowerCase()}:${entry.pos}`;
    if (seen.has(key)) {
      errors.push({
        language: language.code,
        where: `lexicon/${entry.lemma}`,
        message: `duplicate lemma (${entry.pos})`,
      });
    }
    seen.add(key);

    // Bound forms (Dutch "ziens", only in "tot ziens") have no article to give.
    if (entry.pos === "noun" && !entry.article && !entry.flags?.includes("bound")) {
      warnings.push({
        language: language.code,
        where: `lexicon/${entry.lemma}`,
        message: "noun has no article",
      });
    }
    if (entry.article && !language.articles.includes(entry.article)) {
      errors.push({
        language: language.code,
        where: `lexicon/${entry.lemma}`,
        message: `article "${entry.article}" is not one of ${language.articles.join(", ")}`,
      });
    }
  }
}

// ── Run ─────────────────────────────────────────────────────────────────────

for (const language of languages) {
  const index = buildIndex(language.lexicon);
  checkLexicon(language);
  checkStructure(language);
  checkVocabulary(language, index);
  checkArticleAgreement(language, index);
  checkVocabularyBudget(language);
}

const report = (list: Problem[], label: string) => {
  if (!list.length) return;
  console.log(`\n${label}`);
  for (const problem of list) {
    console.log(`  [${problem.language}] ${problem.where}: ${problem.message}`);
  }
};

for (const language of languages) {
  const phrases = language.lessons.reduce((n, l) => n + l.phrases.length, 0);
  console.log(
    `${language.nameEn}: ${language.lessons.length} lessons, ${phrases} phrases, ` +
      `${language.lexicon.length} lexicon entries, ${language.soundDrills.length} sound drills`
  );
}

report(warnings, `Warnings (${warnings.length})`);
report(errors, `Errors (${errors.length})`);

if (errors.length) {
  console.log(`\n✗ ${errors.length} error${errors.length === 1 ? "" : "s"}`);
  process.exit(1);
}
console.log(`\n✓ curriculum valid${warnings.length ? ` (${warnings.length} warnings)` : ""}`);
