import type { Unit } from "@/lib/types";

/**
 * The A1 spine, in dependency order. Situations first, with the two structural
 * loads (verb-second in `routine`, modals in `afspraken`) held back until there
 * are enough phrases to hang them on.
 */
export const units: Unit[] = [
  {
    id: "contact",
    title: "Eerste contact",
    titleEn: "First contact",
    blurb:
      "The phrases you need in the first thirty seconds of any conversation — and the ones that keep it alive when you get lost.",
    level: "A1",
  },
  {
    id: "getallen",
    title: "Getallen en tijd",
    titleEn: "Numbers and time",
    blurb:
      "Prices, platforms, appointments, ages. Dutch says its numbers backwards and its half-hours forwards, and both will catch you out until they don't.",
    level: "A1",
  },
  {
    id: "mensen",
    title: "Familie en mensen",
    titleEn: "Family and people",
    blurb:
      "Who you live with, who you miss, and how to describe someone well enough that the other person knows who you mean.",
    level: "A1",
  },
  {
    id: "eten",
    title: "Eten en drinken",
    titleEn: "Food and drink",
    blurb:
      "Cafés, restaurants and the supermarket. The situations where you know exactly what you want and just need the Dutch for it.",
    level: "A1",
  },
  {
    id: "stad",
    title: "In de stad",
    titleEn: "Around town",
    blurb:
      "Finding things, and getting to them. Directions you can ask for, and answers you can actually follow.",
    level: "A1",
  },
  {
    id: "wonen",
    title: "Wonen",
    titleEn: "Where you live",
    blurb:
      "Your flat, your street, your neighbours. The small talk that fills the first five minutes of every visit.",
    level: "A1",
  },
  {
    id: "winkelen",
    title: "Winkelen en geld",
    titleEn: "Shopping and money",
    blurb: "Browsing, choosing, asking the price, and paying without switching to English.",
    level: "A1",
  },
  {
    id: "routine",
    title: "Dagelijkse routine",
    titleEn: "Daily routine",
    blurb:
      "What you do and when. This is where Dutch word order stops being decoration and starts mattering.",
    level: "A1",
  },
  {
    id: "weer",
    title: "Weer en seizoenen",
    titleEn: "Weather and seasons",
    blurb:
      "The national small-talk topic. Cheap to learn, endlessly reusable, and it buys you time to think.",
    level: "A1",
  },
  {
    id: "afspraken",
    title: "Afspraken maken",
    titleEn: "Making plans",
    blurb:
      "Inviting, accepting, declining kindly. Modal verbs do the heavy lifting and unlock far more than their size suggests.",
    level: "A1",
  },
];
