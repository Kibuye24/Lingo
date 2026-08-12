import type { LexiconEntry } from "@/lib/types";

/**
 * Curated entries always win. Generated ones only fill gaps, and only when the
 * same lemma *and part of speech* isn't already covered by a curated entry.
 *
 * Keyed on lemma+pos rather than lemma alone: Dutch is full of same-spelling,
 * different-word pairs — "bij" is both the preposition "at/near" and the noun
 * "bee" (plural "bijen"). A lemma-only key let the curated preposition block
 * the generated noun from ever being merged in, silently dropping "bijen"
 * from the lexicon even though it was correctly generated.
 *
 * Keeping the two lists separate matters for licensing as well as trust:
 * generated data is Wiktionary-derived and CC BY-SA, curated data is original.
 * See docs/ATTRIBUTION.md.
 */
export function mergeLexicon(
  curated: LexiconEntry[],
  generated: LexiconEntry[]
): LexiconEntry[] {
  const covered = new Set(curated.map((entry) => `${entry.lemma.toLowerCase()}:${entry.pos}`));

  return [
    ...curated,
    ...generated.filter((entry) => !covered.has(`${entry.lemma.toLowerCase()}:${entry.pos}`)),
  ];
}
