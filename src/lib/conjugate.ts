import type { Person, SentenceSubject, SentenceVerb, VerbEntry } from "./types";

/** Canonical pronoun for each person slot — the spine of every verb-page table. */
export const PRONOUNS: { person: Person; target: string; en: string }[] = [
  { person: "ik", target: "ik", en: "I" },
  { person: "jij", target: "jij", en: "you" },
  { person: "hij", target: "hij", en: "he / she / it" },
  { person: "wij", target: "wij", en: "we" },
  { person: "jullie", target: "jullie", en: "you (plural)" },
  { person: "zij", target: "zij", en: "they" },
];

const HEBBEN: SentenceVerb = {
  infinitive: "hebben",
  en: "to have",
  stem: "heb",
  irregular: { hij: "heeft" },
};

const ZIJN: SentenceVerb = {
  infinitive: "zijn",
  en: "to be",
  stem: "ben",
  irregular: { jij: "bent", hij: "is", wij: "zijn", jullie: "zijn", zij: "zijn" },
};

const ZULLEN: SentenceVerb = {
  infinitive: "zullen",
  en: "shall / will",
  stem: "zul",
  irregular: { ik: "zal", jij: "zult", hij: "zal" },
};

/**
 * Dutch present tense, from the stem.
 *
 *   ik            → stem
 *   jij/u/hij/zij → stem + t
 *   wij/jullie/zij → infinitive
 *
 * Spelling rules keep the sound intact: Dutch never doubles a final consonant
 * (`heb` + `t` is `hebt`, not `hebbt`) and never ends a word in `v` or `z`.
 */
export function conjugate(verb: SentenceVerb, person: SentenceSubject["person"]): string {
  const override = verb.irregular?.[person];
  if (override) return override;

  if (person === "wij" || person === "jullie" || person === "zij") {
    return verb.infinitive;
  }
  if (person === "ik") return verb.stem;

  // jij / hij / zij singular — stem + t, unless the stem already ends in t.
  return verb.stem.endsWith("t") ? verb.stem : `${verb.stem}t`;
}

export interface BuiltSentence {
  target: string;
  en: string;
  /** The conjugated verb on its own, so the UI can highlight what changed. */
  verbForm: string;
}

export function buildSentence(
  subject: SentenceSubject,
  verb: SentenceVerb,
  object: { target: string; en: string }
): BuiltSentence {
  const verbForm = conjugate(verb, subject.person);
  const target = `${capitalise(subject.target)} ${verbForm} ${object.target}.`;

  return { target, en: englishGloss(subject, verb, object), verbForm };
}

function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** A rough English rendering — enough to check meaning, not a translation engine. */
function englishGloss(
  subject: SentenceSubject,
  verb: SentenceVerb,
  object: { target: string; en: string }
): string {
  const bare = verb.en.replace(/^to /, "");
  const thirdPerson =
    subject.person === "hij" && subject.target !== "jij"
      ? bare === "have"
        ? "has"
        : bare === "be"
          ? "is"
          : `${bare}s`
      : bare === "be"
        ? subject.person === "ik"
          ? "am"
          : "are"
        : bare;

  return `${capitalise(subject.en)} ${thirdPerson} ${object.en}.`;
}

// ── Full tense system, for the verb-conjugation pages ──────────────────────
//
// Each function below returns the *predicate* only (one or two words) — the
// part after the pronoun — so a caller can build a sentence uniformly with
// `${pronoun} ${form}.` regardless of tense.

/** Present tense — same rule as `conjugate`, adapted to VerbEntry's shape. */
export function presentForm(verb: VerbEntry, person: Person): string {
  return conjugate(
    { infinitive: verb.infinitive, en: verb.en, stem: verb.stem, irregular: verb.irregular },
    person
  );
}

/**
 * Imperfectum (simple past). Regular verbs follow the "'t kofschip" rule: if
 * the stem ends in a voiceless consonant (t, k, f, s, p, or the digraph ch),
 * the ending is -te/-ten; otherwise -de/-den. Irregular verbs — the ones this
 * rule can't predict — carry their forms directly on the entry.
 */
export function imperfectumForm(verb: VerbEntry, person: Person): string {
  const plural = person === "wij" || person === "jullie" || person === "zij";

  if (verb.irregularPast) {
    return plural ? verb.irregularPast.plural : verb.irregularPast.singular;
  }

  const lastSound = verb.stem.endsWith("ch") ? "ch" : verb.stem.slice(-1);
  const voiceless = "tkfsp".includes(lastSound) || lastSound === "ch";
  const ending = voiceless ? (plural ? "ten" : "te") : plural ? "den" : "de";
  return `${verb.stem}${ending}`;
}

/**
 * Perfectum (present perfect) — the tense Dutch actually reaches for in
 * speech to talk about the past. The participle never changes; only the
 * auxiliary (hebben or zijn) conjugates.
 */
export function perfectumForm(verb: VerbEntry, person: Person): string {
  const auxiliary = verb.auxiliary === "zijn" ? ZIJN : HEBBEN;
  return `${conjugate(auxiliary, person)} ${verb.participle}`;
}

/** Future (toekomende tijd) — zullen, conjugated, plus the bare infinitive. */
export function futureForm(verb: VerbEntry, person: Person): string {
  return `${conjugate(ZULLEN, person)} ${verb.infinitive}`;
}
