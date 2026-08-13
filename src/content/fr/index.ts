import type { LanguageConfig } from "@/lib/types";
import { lessons, units } from "./lessons";
import { soundDrills } from "./sounds";
import { lexicon } from "./lexicon";
import { generatedLexicon } from "./lexicon.generated";
import { mergeLexicon } from "../mergeLexicon";

export const french: LanguageConfig = {
  code: "fr",
  name: "Français",
  nameEn: "French",
  locale: "fr-FR",
  articles: ["le", "la"],
  indefiniteArticles: ["un", "une", "des"],
  blurb:
    "Written long, spoken short. The work is in the nasal vowels, the r, and learning which letters you are supposed to ignore.",
  flag: "🇫🇷",
  units,
  lessons,
  soundDrills,
  vocabSets: [],
  grammar: [],
  sentenceDrills: [],
  verbs: [],
  lexicon: mergeLexicon(lexicon, generatedLexicon),
  curatedLexicon: lexicon,
  ui: {
    lessons: "Leçons",
    sounds: "Sons",
    review: "Révision",
    conversation: "Conversation",
    listen: "Écouter",
    slow: "Lentement",
    sayIt: "Dis-le",
    listening: "J'écoute… touchez pour arrêter",
    begin: "Commencer",
    next: "Suivant",
    back: "Retour",
    done: "Terminé",
    wellDone: "Bravo !",
    allLessons: "Toutes les leçons",
    phraseCounter: "Phrase {n} sur {total}",
    sayThisIn: "Dites ceci en français",
    dontKnow: "Je ne sais pas — montrez-moi",
    nothingDue: "Rien à réviser",
    situation: "Situation",
    freeChat: "Conversation libre — anything goes",
    speakReplies: "Lire les réponses à voix haute",
    send: "Envoyer",
    inputPlaceholder: "Écrivez ou parlez en français…",
    translate: "Traduire",
    hide: "Masquer",
  },
};
