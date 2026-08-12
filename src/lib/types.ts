export type Register = "informal" | "formal" | "neutral";

/** A word-level gloss so patterns become visible without teaching word-by-word. */
export interface Gloss {
  target: string;
  en: string;
}

/** A swappable slot turns one memorised phrase into a productive template. */
export interface Pattern {
  /** Template with `___` marking the slot, e.g. "Mag ik ___, alstublieft?" */
  template: string;
  templateEn: string;
  slots: { target: string; en: string }[];
}

export interface Phrase {
  id: string;
  /** The phrase in the language being learned. */
  target: string;
  en: string;
  /** Word-by-word gloss, shown on demand — never the primary presentation. */
  gloss: Gloss[];
  register?: Register;
  /** Pronunciation hint aimed at English speakers. */
  say?: string;
  /** Grammar or usage note worth knowing once. */
  note?: string;
  pattern?: Pattern;
}

/** A scaffolded exchange: learner hears/reads a cue and produces the reply. */
export interface DialogueTurn {
  speaker: "them" | "you";
  target: string;
  en: string;
  /** For `you` turns: hint shown before the learner speaks. */
  cue?: string;
}

export interface Lesson {
  id: string;
  unit: string;
  /** Lesson title in the target language. */
  title: string;
  titleEn: string;
  /** One-line promise: what you can do after this lesson. */
  canDo: string;
  /** CEFR band this lesson sits in. */
  level: "A1" | "A2";
  phrases: Phrase[];
  dialogue: DialogueTurn[];
  /** Scenario handed to the AI tutor for the free-practice roleplay. */
  roleplay: string;
}

export interface Unit {
  id: string;
  title: string;
  titleEn: string;
  blurb: string;
  level: "A1" | "A2";
}

/** One hard sound of the target language, for the pronunciation lab. */
export interface SoundDrill {
  id: string;
  symbol: string;
  name: string;
  /** How to physically make it. */
  how: string;
  /** Common English-speaker failure mode. */
  trap: string;
  words: { target: string; en: string }[];
  /** A sentence stacking the sound, for when single words get easy. */
  tongueTwister?: string;
}

// ── Vocabulary ──────────────────────────────────────────────────────────────

/** One word in a themed set. Article is spelled out because it must be learned with the noun. */
export interface VocabItem {
  target: string;
  en: string;
  /** "de" / "het" / "le" / "la" — shown attached to the word, never separately. */
  article?: string;
  plural?: string;
  /** Pronunciation hint for the hard ones. */
  say?: string;
  /** Optional emoji, purely to make the grid scannable. */
  icon?: string;
}

/**
 * A themed word list — family, numbers, animals, food.
 *
 * Separate from lessons on purpose: lessons teach phrases you can say, sets
 * teach the words you slot into them. A learner who only ever meets words
 * inside fixed phrases can't build anything new.
 */
export interface VocabSet {
  id: string;
  title: string;
  titleEn: string;
  level: "A1" | "A2";
  /** Emoji for the picker grid. */
  icon: string;
  blurb: string;
  items: VocabItem[];
  /** Example sentences using these words, to show them in action. */
  examples?: { target: string; en: string }[];
}

// ── Grammar ─────────────────────────────────────────────────────────────────

/** A row in a grammar table — pronouns, conjugations, articles. */
export interface GrammarRow {
  cells: string[];
  /** Highlight this row as the one that trips people up. */
  note?: string;
}

export interface GrammarTable {
  caption?: string;
  headers: string[];
  rows: GrammarRow[];
}

/**
 * One explicit grammar point. The app is phrase-first, but some things —
 * pronouns, verb endings, de/het — are rules you genuinely have to be told,
 * and no amount of repeating phrases will surface them.
 */
export interface GrammarPoint {
  id: string;
  title: string;
  titleEn: string;
  level: "A1" | "A2";
  icon: string;
  /** One sentence: what this unlocks. */
  canDo: string;
  /** Markdown-ish paragraphs. Plain strings, rendered as <p>. */
  explanation: string[];
  tables?: GrammarTable[];
  /** The mistake English speakers reliably make. */
  trap?: string;
  examples?: { target: string; en: string }[];
}

// ── Sentence building ───────────────────────────────────────────────────────

/** The six present-tense conjugation slots. Shared by sentence drills and verb pages. */
export type Person = "ik" | "jij" | "hij" | "wij" | "jullie" | "zij";

/**
 * A build-a-sentence drill: pick a subject, a verb, and an object, and the app
 * conjugates and checks. This is what turns memorised phrases into a system.
 */
export interface SentenceDrill {
  id: string;
  title: string;
  titleEn: string;
  level: "A1" | "A2";
  icon: string;
  blurb: string;
  /** Subjects offered, in person order. */
  subjects: SentenceSubject[];
  /** Verbs offered, with the stem needed to conjugate them. */
  verbs: SentenceVerb[];
  /** Objects/complements offered. */
  objects: { target: string; en: string }[];
}

export interface SentenceSubject {
  target: string;
  en: string;
  /** Which conjugation slot this subject takes. */
  person: Person;
}

export interface SentenceVerb {
  infinitive: string;
  en: string;
  /** Present-tense stem — usually the infinitive minus -en, but not always. */
  stem: string;
  /** Overrides for irregular verbs, keyed by person. */
  irregular?: Partial<Record<Person, string>>;
}

// ── Verb conjugation ────────────────────────────────────────────────────────

/**
 * One verb across every tense a beginner needs. Distinct from `SentenceVerb`
 * (which only needs the present tense to plug into the sentence builder) —
 * this is the fuller reference a learner opens by tapping a verb directly.
 */
export interface VerbEntry {
  id: string;
  infinitive: string;
  en: string;
  level: "A1" | "A2";
  /** Present-tense stem. */
  stem: string;
  /** Present-tense overrides for irregular verbs, keyed by person. */
  irregular?: Partial<Record<Person, string>>;
  /** Which auxiliary the perfectum takes — most verbs use hebben. */
  auxiliary: "hebben" | "zijn";
  participle: string;
  /**
   * Imperfectum (simple past) overrides for irregular verbs. Regular verbs
   * are computed from the stem via the 't kofschip rule and need nothing here.
   */
  irregularPast?: { singular: string; plural: string };
  /** One usage note — why this verb is irregular, or a trap to watch for. */
  note?: string;
  /** The verb in a real sentence, one per tense, so the form isn't just a table. */
  examples: {
    present: { target: string; en: string };
    imperfectum: { target: string; en: string };
    perfectum: { target: string; en: string };
    future: { target: string; en: string };
  };
}

// ── Lexicon ─────────────────────────────────────────────────────────────────

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adj"
  | "adv"
  | "prep"
  | "pron"
  | "det"
  | "num"
  | "conj"
  | "interj"
  | "name"
  | "phrase";

/**
 * One dictionary entry. Deliberately language-neutral: `article` carries Dutch
 * de/het and French le/la alike, so the validator and the lookup UI work the
 * same for every language.
 */
export interface LexiconEntry {
  lemma: string;
  pos: PartOfSpeech;
  en: string;
  /** Definite article, for languages with grammatical gender. */
  article?: string;
  plural?: string;
  /** Past participle, for verbs. */
  participle?: string;
  /** e.g. "separable", "irregular", "reflexive". */
  flags?: string[];
  /** Extra surface forms that should count as this lemma when validating. */
  forms?: string[];
  /** How much we trust it. */
  source: "curated" | "wiktionary" | "generated";
}

// ── Language registry ───────────────────────────────────────────────────────

/**
 * App chrome in the target language. Keeping the interface immersive is part of
 * the teaching, so these move with the language rather than being hardcoded.
 */
export interface UILabels {
  lessons: string;
  sounds: string;
  review: string;
  conversation: string;
  listen: string;
  slow: string;
  sayIt: string;
  listening: string;
  begin: string;
  next: string;
  back: string;
  done: string;
  wellDone: string;
  allLessons: string;
  /** e.g. "Zin {n} van {total}" — `{n}` and `{total}` are substituted. */
  phraseCounter: string;
  sayThisIn: string;
  dontKnow: string;
  nothingDue: string;
  situation: string;
  freeChat: string;
  speakReplies: string;
  send: string;
  inputPlaceholder: string;
  translate: string;
  hide: string;
}

export interface LanguageConfig {
  /** Short code used in URLs and progress keys. */
  code: string;
  /** Name in the language itself. */
  name: string;
  nameEn: string;
  /** BCP-47 tag driving both speech synthesis and recognition. */
  locale: string;
  /** Articles this language uses, for the validator's agreement check. */
  articles: string[];
  /** Indefinite articles — checked for existence but not for gender. */
  indefiniteArticles: string[];
  units: Unit[];
  lessons: Lesson[];
  soundDrills: SoundDrill[];
  vocabSets: VocabSet[];
  grammar: GrammarPoint[];
  sentenceDrills: SentenceDrill[];
  verbs: VerbEntry[];
  /** Curated + generated, with curated winning. What the app reads. */
  lexicon: LexiconEntry[];
  /**
   * Hand-written entries only. `build-lexicon` must read this rather than the
   * merged list, or its own previous output would mask the gaps it exists to
   * find.
   */
  curatedLexicon: LexiconEntry[];
  /** Shown on the language picker. */
  blurb: string;
  ui: UILabels;
}
