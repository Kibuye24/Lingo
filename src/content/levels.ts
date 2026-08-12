import type { LanguageConfig } from "@/lib/types";

export type Level = "A1" | "A2";

export const levels: { id: Level; slug: string; title: string; blurb: string }[] = [
  {
    id: "A1",
    slug: "a1",
    title: "A1 — Beginner",
    blurb:
      "From nothing to handling predictable situations: greetings, numbers, food, directions, plans.",
  },
  {
    id: "A2",
    slug: "a2",
    title: "A2 — Elementary",
    blurb:
      "Daily life without help: the past tense, opinions, work, health, and longer sentences.",
  },
];

export function levelFromSlug(slug: string): Level | undefined {
  return levels.find((level) => level.slug === slug.toLowerCase())?.id;
}

export function levelSlug(level: Level): string {
  return level.toLowerCase();
}

/** Everything in a language filtered to one CEFR band. */
export function contentForLevel(language: LanguageConfig, level: Level) {
  const lessons = language.lessons.filter((lesson) => lesson.level === level);
  const unitIds = new Set(lessons.map((lesson) => lesson.unit));
  return {
    lessons,
    units: language.units.filter((unit) => unitIds.has(unit.id)),
    vocabSets: language.vocabSets.filter((set) => set.level === level),
    grammar: language.grammar.filter((point) => point.level === level),
    sentenceDrills: language.sentenceDrills.filter((drill) => drill.level === level),
  };
}
