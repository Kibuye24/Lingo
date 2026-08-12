import type { LanguageConfig, Lesson } from "@/lib/types";
import { dutch } from "./nl";
import { french } from "./fr";

/** Every language the app ships. Order is the order shown on the picker. */
export const languages: LanguageConfig[] = [dutch, french];

export const defaultLanguage = dutch.code;

export function getLanguage(code: string): LanguageConfig | undefined {
  return languages.find((language) => language.code === code);
}

export function languageCodes(): string[] {
  return languages.map((language) => language.code);
}

export function getLesson(languageCode: string, lessonId: string): Lesson | undefined {
  return getLanguage(languageCode)?.lessons.find((lesson) => lesson.id === lessonId);
}

export function lessonsForUnit(language: LanguageConfig, unitId: string): Lesson[] {
  return language.lessons.filter((lesson) => lesson.unit === unitId);
}

/** Flat list of every phrase in a language, tagged with its lesson. */
export function allPhrases(language: LanguageConfig) {
  return language.lessons.flatMap((lesson) =>
    lesson.phrases.map((phrase) => ({ phrase, lesson }))
  );
}

/** Phrase ids are namespaced by language so progress keys never collide. */
export function progressKey(languageCode: string, phraseId: string): string {
  return `${languageCode}:${phraseId}`;
}
