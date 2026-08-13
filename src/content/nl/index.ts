import type { LanguageConfig } from "@/lib/types";
import { lessons as coreLessons } from "./lessons";
import { lessonsA1 } from "./lessons-a1";
import { units } from "./units";
import { soundDrills } from "./sounds";
import { vocabSets } from "./vocab";
import { grammar } from "./grammar";
import { sentenceDrills } from "./sentences";
import { verbs } from "./verbs";
import { lexicon } from "./lexicon";
import { generatedLexicon } from "./lexicon.generated";
import { mergeLexicon } from "../mergeLexicon";

export const dutch: LanguageConfig = {
  code: "nl",
  name: "Nederlands",
  nameEn: "Dutch",
  locale: "nl-NL",
  articles: ["de", "het"],
  indefiniteArticles: ["een"],
  blurb:
    "Direct, guttural, and closer to English than it sounds. The hard parts are the g, the vowels, and remembering whether a word is de or het.",
  flag: "🇳🇱",
  units,
  lessons: [...coreLessons, ...lessonsA1],
  soundDrills,
  vocabSets,
  grammar,
  sentenceDrills,
  verbs,
  lexicon: mergeLexicon(lexicon, generatedLexicon),
  curatedLexicon: lexicon,
  ui: {
    lessons: "Lessen",
    sounds: "Klanken",
    review: "Herhaling",
    conversation: "Gesprek",
    listen: "Luister",
    slow: "Langzaam",
    sayIt: "Zeg het",
    listening: "Luisteren… tik om te stoppen",
    begin: "Beginnen",
    next: "Volgende",
    back: "Terug",
    done: "Klaar",
    wellDone: "Goed gedaan!",
    allLessons: "Alle lessen",
    phraseCounter: "Zin {n} van {total}",
    sayThisIn: "Zeg dit in het Nederlands",
    dontKnow: "Ik weet het niet — laat zien",
    nothingDue: "Niets te herhalen",
    situation: "Situatie",
    freeChat: "Vrij gesprek — anything goes",
    speakReplies: "Spreek antwoorden uit",
    send: "Stuur",
    inputPlaceholder: "Typ of spreek in het Nederlands…",
    translate: "Vertaal",
    hide: "Verberg",
  },
};
