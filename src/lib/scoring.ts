/**
 * Compares what the learner said against what they were asked to say.
 *
 * The browser's recogniser gives us a transcript, not phonetics — so this
 * measures *intelligibility*: did a Dutch-tuned listener hear the right words?
 * That maps closely to the thing that actually matters in a conversation, and
 * it needs no paid pronunciation-assessment API.
 */

export type WordStatus = "hit" | "close" | "miss";

export interface WordResult {
  expected: string;
  status: WordStatus;
  /** What the recogniser heard in this slot, when it differs. */
  heard?: string;
}

export interface Attempt {
  score: number; // 0–100
  words: WordResult[];
  transcript: string;
  verdict: "excellent" | "good" | "again";
  /** Words worth another go, most useful first. */
  focus: string[];
}

/** Lowercase, strip punctuation, fold accents, collapse whitespace. */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.,!?;:'"«»„”“()\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(text: string): string[] {
  const n = normalise(text);
  return n ? n.split(" ") : [];
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

/** 0–1 similarity between two words. */
function similarity(a: string, b: string): number {
  const longest = Math.max(a.length, b.length);
  if (!longest) return 1;
  return 1 - levenshtein(a, b) / longest;
}

/**
 * Align expected words to heard words with a simple edit-distance walk, so a
 * dropped or inserted word doesn't cascade into marking everything after it
 * wrong.
 */
function align(expected: string[], heard: string[]): WordResult[] {
  const rows = expected.length;
  const cols = heard.length;

  // cost[i][j] = best cost aligning first i expected with first j heard
  const cost: number[][] = Array.from({ length: rows + 1 }, () =>
    new Array<number>(cols + 1).fill(0)
  );
  for (let i = 0; i <= rows; i++) cost[i][0] = i;
  for (let j = 0; j <= cols; j++) cost[0][j] = j;

  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      const sub = cost[i - 1][j - 1] + (1 - similarity(expected[i - 1], heard[j - 1]));
      cost[i][j] = Math.min(sub, cost[i - 1][j] + 1, cost[i][j - 1] + 1);
    }
  }

  // Walk back to recover the pairing.
  const results: WordResult[] = [];
  let i = rows;
  let j = cols;
  while (i > 0) {
    if (j > 0) {
      const sub = cost[i - 1][j - 1] + (1 - similarity(expected[i - 1], heard[j - 1]));
      if (Math.abs(cost[i][j] - sub) < 1e-9) {
        const sim = similarity(expected[i - 1], heard[j - 1]);
        results.push({
          expected: expected[i - 1],
          status: sim === 1 ? "hit" : sim >= 0.6 ? "close" : "miss",
          heard: sim === 1 ? undefined : heard[j - 1],
        });
        i--;
        j--;
        continue;
      }
      if (Math.abs(cost[i][j] - (cost[i][j - 1] + 1)) < 1e-9) {
        j--; // an extra word was heard; ignore it
        continue;
      }
    }
    results.push({ expected: expected[i - 1], status: "miss" });
    i--;
  }

  return results.reverse();
}

export function scoreAttempt(target: string, transcript: string): Attempt {
  const expected = words(target);
  const heard = words(transcript);

  if (!heard.length) {
    return {
      score: 0,
      words: expected.map((expectedWord) => ({ expected: expectedWord, status: "miss" as const })),
      transcript: "",
      verdict: "again",
      focus: expected,
    };
  }

  const results = align(expected, heard);
  const points = results.reduce(
    (sum, word) => sum + (word.status === "hit" ? 1 : word.status === "close" ? 0.6 : 0),
    0
  );
  const score = Math.round((points / Math.max(expected.length, 1)) * 100);

  return {
    score,
    words: results,
    transcript: heard.join(" "),
    verdict: score >= 90 ? "excellent" : score >= 65 ? "good" : "again",
    focus: results.filter((word) => word.status !== "hit").map((word) => word.expected),
  };
}

export function verdictLabel(attempt: Attempt): string {
  switch (attempt.verdict) {
    case "excellent":
      return "Understood perfectly";
    case "good":
      return "Understandable — polish these";
    default:
      return "Not quite — listen again";
  }
}
