import type { SentenceDrill } from "@/lib/types";

/**
 * Sentence builders.
 *
 * Pick a subject, a verb and an object; the app conjugates and you say the
 * result. Same three verbs across six subjects is eighteen real sentences from
 * one screen — which is the point. Phrases teach you what to say; this teaches
 * you how to say something nobody taught you.
 */
export const sentenceDrills: SentenceDrill[] = [
  {
    id: "ik-drink-water",
    title: "Ik drink water",
    titleEn: "Subject + verb + object",
    level: "A1",
    icon: "🧱",
    blurb:
      "The core Dutch sentence. Change the subject and watch the verb ending follow.",
    subjects: [
      { target: "ik", en: "I", person: "ik" },
      { target: "jij", en: "you", person: "jij" },
      { target: "hij", en: "he", person: "hij" },
      { target: "zij", en: "she", person: "hij" },
      { target: "wij", en: "we", person: "wij" },
      { target: "jullie", en: "you (plural)", person: "jullie" },
    ],
    verbs: [
      { infinitive: "drinken", en: "to drink", stem: "drink" },
      { infinitive: "eten", en: "to eat", stem: "eet" },
      { infinitive: "kopen", en: "to buy", stem: "koop" },
      { infinitive: "maken", en: "to make", stem: "maak" },
      { infinitive: "zien", en: "to see", stem: "zie" },
      { infinitive: "hebben", en: "to have", stem: "heb", irregular: { hij: "heeft" } },
    ],
    objects: [
      { target: "water", en: "water" },
      { target: "koffie", en: "coffee" },
      { target: "brood", en: "bread" },
      { target: "een appel", en: "an apple" },
      { target: "de krant", en: "the newspaper" },
      { target: "vijf broden", en: "five loaves" },
    ],
  },
  {
    id: "waar-woon-je",
    title: "Ik woon in Amsterdam",
    titleEn: "Subject + verb + place",
    level: "A1",
    icon: "📍",
    blurb: "Same machinery, now with places. Note how 'wonen' keeps its long o as 'woon'.",
    subjects: [
      { target: "ik", en: "I", person: "ik" },
      { target: "jij", en: "you", person: "jij" },
      { target: "hij", en: "he", person: "hij" },
      { target: "zij", en: "she", person: "hij" },
      { target: "wij", en: "we", person: "wij" },
      { target: "zij", en: "they", person: "zij" },
    ],
    verbs: [
      { infinitive: "wonen", en: "to live", stem: "woon" },
      { infinitive: "werken", en: "to work", stem: "werk" },
      { infinitive: "slapen", en: "to sleep", stem: "slaap" },
      { infinitive: "zijn", en: "to be", stem: "ben", irregular: { jij: "bent", hij: "is", wij: "zijn", jullie: "zijn", zij: "zijn" } },
    ],
    objects: [
      { target: "in Amsterdam", en: "in Amsterdam" },
      { target: "in Nederland", en: "in the Netherlands" },
      { target: "hier", en: "here" },
      { target: "thuis", en: "at home" },
      { target: "in een klein huis", en: "in a small house" },
    ],
  },
];
