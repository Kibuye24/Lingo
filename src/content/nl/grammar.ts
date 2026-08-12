import type { GrammarPoint } from "@/lib/types";

/**
 * Explicit grammar.
 *
 * The app is phrase-first by design, but some things are rules you simply have
 * to be told — pronouns, verb endings, de/het. No amount of repeating "ik wil
 * graag" will ever reveal what "hij" is or why it takes a different verb form.
 */
export const grammar: GrammarPoint[] = [
  {
    id: "voornaamwoorden",
    title: "Persoonlijke voornaamwoorden",
    titleEn: "Personal pronouns",
    level: "A1",
    icon: "👤",
    canDo: "Talk about anyone, not just yourself.",
    explanation: [
      "Every sentence needs a subject, and until you know these you can only ever talk about yourself. Dutch pronouns come in pairs: a stressed form and an unstressed one. The unstressed form is what people actually say most of the time.",
      "You do not choose between them for meaning — you use the unstressed form by default, and the stressed one only when you're emphasising who did something. 'Ik heb het gedaan' is neutral; 'IK heb het gedaan' contrasts with someone else.",
      "The one to be careful with is 'zij' and 'ze', which mean both 'she' and 'they'. The verb tells you which: 'zij is' is she, 'zij zijn' is they.",
    ],
    tables: [
      {
        caption: "Subject pronouns",
        headers: ["Stressed", "Unstressed", "English"],
        rows: [
          { cells: ["ik", "'k", "I"] },
          { cells: ["jij", "je", "you (informal)"] },
          { cells: ["u", "—", "you (formal, singular or plural)"] },
          { cells: ["hij", "ie", "he"] },
          { cells: ["zij", "ze", "she"], note: "Same word as 'they' — the verb form tells them apart." },
          { cells: ["het", "'t", "it"] },
          { cells: ["wij", "we", "we"] },
          { cells: ["jullie", "—", "you (plural, informal)"] },
          { cells: ["zij", "ze", "they"], note: "Takes the plural verb: zij zijn, zij wonen." },
        ],
      },
    ],
    trap: "Using 'u' with friends, or 'jij' with an older stranger. When unsure, start with 'u' — being slightly too formal costs you nothing, the reverse can sting.",
    examples: [
      { target: "Ik woon in Amsterdam.", en: "I live in Amsterdam." },
      { target: "Hij werkt hier.", en: "He works here." },
      { target: "Zij is mijn zus.", en: "She is my sister." },
      { target: "Zij zijn mijn ouders.", en: "They are my parents." },
      { target: "Wij drinken koffie.", en: "We drink coffee." },
      { target: "Spreekt u Engels?", en: "Do you speak English? (formal)" },
    ],
  },
  {
    id: "presens",
    title: "De tegenwoordige tijd",
    titleEn: "Present tense",
    level: "A1",
    icon: "⚙️",
    canDo: "Conjugate almost any Dutch verb from its infinitive.",
    explanation: [
      "Dutch present tense has only three forms, and they all come from one thing: the stem. Take the infinitive, drop the -en, and what's left is the stem. 'drinken' → 'drink'. 'werken' → 'werk'. 'wonen' → 'woon'.",
      "Then: 'ik' takes the bare stem. 'jij', 'u', 'hij', 'zij' and 'het' take stem + t. 'wij', 'jullie' and 'zij' (plural) take the full infinitive back again.",
      "That's the whole system. Three forms, and the plural one is just the infinitive — so you already know it the moment you learn the verb.",
      "Spelling adjusts to keep the sound: 'wonen' has a long o, so the stem doubles the vowel to 'woon' rather than 'won'. And Dutch never ends a word in v or z, so 'leven' → 'leef' and 'reizen' → 'reis'.",
    ],
    tables: [
      {
        caption: "drinken (to drink) — stem: drink",
        headers: ["Subject", "Form", "English"],
        rows: [
          { cells: ["ik", "drink", "I drink"] },
          { cells: ["jij / je", "drinkt", "you drink"], note: "Drops the -t in questions: 'Drink jij koffie?'" },
          { cells: ["u", "drinkt", "you drink (formal)"] },
          { cells: ["hij / zij / het", "drinkt", "he / she / it drinks"] },
          { cells: ["wij / we", "drinken", "we drink"] },
          { cells: ["jullie", "drinken", "you drink (plural)"] },
          { cells: ["zij / ze", "drinken", "they drink"] },
        ],
      },
      {
        caption: "The two irregulars you cannot avoid",
        headers: ["Subject", "zijn (to be)", "hebben (to have)"],
        rows: [
          { cells: ["ik", "ben", "heb"] },
          { cells: ["jij / je", "bent", "hebt"] },
          { cells: ["u", "bent / is", "heeft / hebt"] },
          { cells: ["hij / zij / het", "is", "heeft"] },
          { cells: ["wij / jullie / zij", "zijn", "hebben"] },
        ],
      },
    ],
    trap: "Adding -t to 'ik'. It is 'ik drink', never 'ik drinkt'. English speakers reach for the -s of 'he drinks' and put it in the wrong place.",
    examples: [
      { target: "Ik drink water.", en: "I drink water." },
      { target: "Jij drinkt water.", en: "You drink water." },
      { target: "Hij drinkt water.", en: "He drinks water." },
      { target: "Wij drinken water.", en: "We drink water." },
      { target: "Drink jij water?", en: "Do you drink water? — the -t disappears" },
    ],
  },
  {
    id: "de-het",
    title: "De of het?",
    titleEn: "de or het",
    level: "A1",
    icon: "🎯",
    canDo: "Guess the right article far more often than chance.",
    explanation: [
      "Every Dutch noun is either a de-word or a het-word, and there is no way to work it out from meaning. But it isn't random either — roughly two out of three nouns are de-words, so guessing 'de' already beats a coin flip.",
      "More useful: several endings are completely reliable. Every plural is 'de', whatever the singular was. Every diminutive — anything ending in -je — is 'het', no exceptions. Those two rules alone cover an enormous amount of everyday Dutch.",
      "The rest is a set of endings worth memorising once. They aren't perfect, but they're right often enough to be worth trusting.",
    ],
    tables: [
      {
        caption: "Always de",
        headers: ["Rule", "Examples"],
        rows: [
          { cells: ["All plurals", "de boeken, de huizen, de kinderen"] },
          { cells: ["-ing", "de wandeling, de rekening"] },
          { cells: ["-heid / -teit", "de waarheid, de kwaliteit"] },
          { cells: ["-ie / -tie", "de familie, de politie"] },
          { cells: ["-schap", "de vriendschap"] },
          { cells: ["Most people and jobs", "de man, de vrouw, de dokter"] },
        ],
      },
      {
        caption: "Always het",
        headers: ["Rule", "Examples"],
        rows: [
          { cells: ["-je (diminutives)", "het broodje, het meisje, het biertje"], note: "No exceptions at all. The safest rule in Dutch." },
          { cells: ["-ment", "het moment, het document"] },
          { cells: ["-sel", "het deksel"] },
          { cells: ["-isme", "het toerisme"] },
          { cells: ["-um", "het museum, het centrum"] },
          { cells: ["Languages and metals", "het Nederlands, het goud"] },
          { cells: ["Verbs used as nouns", "het eten, het zwemmen"] },
        ],
      },
    ],
    trap: "Learning a noun without its article. 'Boek' is not a Dutch word you can use — 'het boek' is. Always store the article with the word, from the first time you meet it.",
    examples: [
      { target: "de man, de vrouw, de kinderen", en: "the man, the woman, the children" },
      { target: "het huis, het boek, het meisje", en: "the house, the book, the girl" },
      { target: "het broodje", en: "the roll — a diminutive, so always het" },
    ],
  },
  {
    id: "woordvolgorde",
    title: "De tweede plaats",
    titleEn: "Verb-second word order",
    level: "A1",
    icon: "🔀",
    canDo: "Build sentences that sound Dutch rather than translated.",
    explanation: [
      "In a Dutch statement, the conjugated verb is always the second element. Not the second word — the second thing. Whatever you put first, the verb follows it immediately, and the subject gets pushed out of the way if it has to.",
      "'Ik ga morgen naar Amsterdam' is fine. But if you start with 'morgen' for emphasis, it becomes 'Morgen ga ik naar Amsterdam' — verb second, subject third. English lets you say 'Tomorrow I go'; Dutch does not.",
      "This is the single most reliable tell of a foreign speaker, and it's worth over-practising until it stops feeling wrong.",
    ],
    tables: [
      {
        caption: "The verb never moves from slot 2",
        headers: ["1", "2 (verb)", "3", "rest"],
        rows: [
          { cells: ["Ik", "ga", "morgen", "naar Amsterdam"] },
          { cells: ["Morgen", "ga", "ik", "naar Amsterdam"], note: "Subject and verb swap places." },
          { cells: ["Vandaag", "werk", "ik", "niet"] },
          { cells: ["'s Avonds", "kook", "ik", "thuis"] },
        ],
      },
    ],
    trap: "Saying 'Morgen ik ga…'. It is the mistake every English speaker makes, and Dutch people notice it instantly even when they understand you perfectly.",
    examples: [
      { target: "Ik werk vandaag.", en: "I work today." },
      { target: "Vandaag werk ik.", en: "Today I work." },
      { target: "Nu drink ik koffie.", en: "Now I'm drinking coffee." },
    ],
  },
  {
    id: "bezittelijk",
    title: "Bezittelijke voornaamwoorden",
    titleEn: "Possessives",
    level: "A1",
    icon: "🔑",
    canDo: "Say whose something is.",
    explanation: [
      "These work almost exactly like English — put them straight in front of the noun and nothing changes. 'mijn boek', 'jouw huis', 'haar moeder'.",
      "The one exception is 'our', which has two forms. 'Ons' goes before het-words, 'onze' before de-words and all plurals. This is the only place where de/het changes a possessive, which is one more reason to learn articles properly.",
    ],
    tables: [
      {
        caption: "Possessives",
        headers: ["Dutch", "Unstressed", "English"],
        rows: [
          { cells: ["mijn", "m'n", "my"] },
          { cells: ["jouw", "je", "your (informal)"] },
          { cells: ["uw", "—", "your (formal)"] },
          { cells: ["zijn", "z'n", "his / its"], note: "Same spelling as the verb 'zijn' (to be) — context tells them apart." },
          { cells: ["haar", "d'r", "her"] },
          { cells: ["ons / onze", "—", "our"], note: "ons + het-word, onze + de-word or plural." },
          { cells: ["jullie", "—", "your (plural)"] },
          { cells: ["hun", "—", "their"] },
        ],
      },
    ],
    trap: "Getting ons/onze backwards. 'ons huis' (het huis) but 'onze auto' (de auto) and 'onze kinderen' (plural).",
    examples: [
      { target: "Dit is mijn boek.", en: "This is my book." },
      { target: "Haar moeder woont hier.", en: "Her mother lives here." },
      { target: "Ons huis is klein.", en: "Our house is small." },
      { target: "Onze kinderen slapen.", en: "Our children are sleeping." },
    ],
  },
  {
    id: "niet-geen",
    title: "Niet of geen?",
    titleEn: "Negation",
    level: "A1",
    icon: "🚫",
    canDo: "Say no to the right thing, in the right place.",
    explanation: [
      "Dutch has two words for 'not', and picking the wrong one is one of the most common beginner errors — but the rule is short.",
      "Use 'geen' when you're negating a noun that has no article, or has 'een'. 'Ik heb een auto' becomes 'Ik heb geen auto'. Think of geen as 'not a' or 'no' rolled into one word.",
      "Use 'niet' for everything else: verbs, adjectives, adverbs, and nouns that have 'de', 'het' or a possessive. 'Ik werk niet.' 'Het is niet groot.' 'Ik ken hem niet.'",
      "'Niet' usually goes at the end of the clause, or directly before the thing it negates when that's an adjective or a prepositional phrase.",
    ],
    tables: [
      {
        caption: "Which one?",
        headers: ["Situation", "Word", "Example"],
        rows: [
          { cells: ["Noun with 'een'", "geen", "Ik heb geen auto."] },
          { cells: ["Noun with no article", "geen", "Ik drink geen koffie."] },
          { cells: ["Noun with de/het", "niet", "Ik heb de auto niet."] },
          { cells: ["Noun with a possessive", "niet", "Dat is mijn jas niet."] },
          { cells: ["A verb", "niet", "Ik werk niet."] },
          { cells: ["An adjective", "niet", "Het is niet groot."] },
        ],
      },
    ],
    trap: "Saying 'Ik heb niet een auto'. It's understandable but immediately marks you out — Dutch collapses that into 'geen'.",
    examples: [
      { target: "Ik drink geen bier.", en: "I don't drink beer." },
      { target: "Ik werk vandaag niet.", en: "I'm not working today." },
      { target: "Zij heeft geen kinderen.", en: "She doesn't have children." },
      { target: "Het huis is niet groot.", en: "The house isn't big." },
    ],
  },
  {
    id: "meervoud",
    title: "Het meervoud",
    titleEn: "Plurals",
    level: "A1",
    icon: "➕",
    canDo: "Make any noun plural — and remember that every plural takes 'de'.",
    explanation: [
      "Dutch has two main plural endings, -en and -s, and -en is the default. 'boek' → 'boeken', 'huis' → 'huizen'.",
      "You use -s instead after words ending in -el, -em, -en, -er, -je, and after most vowels. 'tafel' → 'tafels', 'meisje' → 'meisjes'.",
      "After a single stressed vowel you need an apostrophe to keep the vowel long: 'foto' → 'foto's', 'oma' → 'oma's'.",
      "Whatever the singular article was, the plural is always 'de'. 'het boek' but 'de boeken'.",
    ],
    tables: [
      {
        caption: "Which ending",
        headers: ["Rule", "Singular", "Plural"],
        rows: [
          { cells: ["Default", "het boek", "de boeken"] },
          { cells: ["Long vowel shortens", "het huis", "de huizen"] },
          { cells: ["After -el/-er/-je", "de tafel", "de tafels"] },
          { cells: ["After a vowel", "de foto", "de foto's"] },
          { cells: ["Irregular", "het kind", "de kinderen"], note: "Also: het ei → de eieren, de stad → de steden." },
        ],
      },
    ],
    trap: "Forgetting that the article flips. 'Het kind' is neuter, but 'de kinderen' — plurals are always de-words.",
    examples: [
      { target: "één boek, twee boeken", en: "one book, two books" },
      { target: "het kind, de kinderen", en: "the child, the children" },
      { target: "de foto, de foto's", en: "the photo, the photos" },
    ],
  },
];
