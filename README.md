# Lingo — languages, out loud

A language tutor that teaches in whole phrases and makes you say them out loud.
Built because flashcard apps move one word at a time and books can't tell you
whether your `g` is landing.

Ships with **Dutch** and **French**. Adding a third language is content, not
code — see [Adding a language](#adding-a-language).

## How you move through it

Language → level → mode. Pick Dutch or French, pick A1 or A2, then choose how
you want to work.

| Mode | Route | What it does |
| --- | --- | --- |
| **Path** | `/[lang]/[level]/pad` | A numbered trail through the lessons, in order, with your position marked. Tap a circle to start. |
| **Lessons** | `/[lang]/les/[id]` | Whole phrases with audio, a pronunciation hint, a word-by-word gloss, and a pattern drill that turns one phrase into four. Ends in a scaffolded dialogue where you speak your own turns. |
| **Vocabulary** | `/[lang]/[level]/woorden` | Themed word sets — family, numbers, colours, food, animals, body, house, verbs. Browse them or drill them one at a time. Nouns always carry their article, because `het boek` is the unit you have to memorise, not `boek`. |
| **Grammar** | `/[lang]/[level]/grammatica` | Pronouns, present tense, de/het, word order, possessives, negation, plurals. The rules you have to be *told* — no amount of repeating phrases reveals what `hij` is. |
| **Build sentences** | `/[lang]/[level]/bouwen` | Pick a subject, a verb and an object; the app conjugates and shows which part changed. Six subjects × six verbs × six objects is 216 sentences from one screen. |
| **Sounds** | `/[lang]/klanken` | The sounds that make English speakers hard to follow. Dutch gets `g`, `ui`, `eu`, `ij/ei`, `ee`, `ee↔ie`, `w/v`, `oe/u`; French gets the uvular `r`, `u↔ou`, nasal vowels, silent endings, and liaison. |
| **Review** | `/[lang]/review` | Spaced repetition over everything you've practised. Intervals widen as you get it right: 1 → 3 → 7 → 16 → 35 days. |
| **Conversation** | `/[lang]/gesprek` | Free conversation with an AI tutor, or a roleplay from any lesson. Stays in the target language and corrects only what blocks understanding. |

Lessons teach phrases you can say. Vocabulary teaches the words you slot into
them. Grammar tells you the rules. The sentence builder is where those three
meet — and it's the part that turns memorised phrases into a system you can
generate from.

## How the speech works

Both directions run on the browser's built-in **Web Speech API**, driven by each
language's BCP-47 locale (`nl-NL`, `fr-FR`):

- **Hearing it** — `speechSynthesis` picks a voice matching the locale. Every
  phrase has a normal-speed and a half-speed button.
- **Being heard** — `SpeechRecognition` transcribes what you said, and
  [`src/lib/scoring.ts`](src/lib/scoring.ts) aligns it against the target with
  edit distance. Words come back green (landed), amber (close), or red (missed).

This is deliberate. It's part of the browser, not a hosted service — so there's
no API key, no quota, and nothing that stops working after a free tier runs out.

What it measures is **intelligibility**: did a listener tuned to that language
hear the right words? That's not the same as a phonetic score — true
pronunciation assessment (phoneme-level, with confidence per sound) is a paid
feature on Azure Speech and similar. Intelligibility is what decides whether a
conversation succeeds, so it's the right proxy, but it's worth knowing the
difference.

**Browser support:** recognition needs Chrome or Edge. Safari and Firefox will
play audio and run everything else fine; the speak-and-check button reports that
it isn't available rather than failing silently.

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Progress is stored in `localStorage`, namespaced per
language — no account, no backend, works offline.

### Conversation mode (optional)

`/[lang]/gesprek` is the only part that needs a key:

```bash
cp .env.example .env.local
# add AI_GATEWAY_API_KEY from https://vercel.com/ai-gateway
```

Without it the app runs normally and that one page explains what's missing.

## The lexicon pipeline

The lexicon is both the in-app dictionary and the gate that `npm run validate`
checks every lesson against. It comes from two places:

| File | Contents | Licence |
| --- | --- | --- |
| `lexicon.ts` | Hand-written. Always wins. | Original work |
| `lexicon.generated.ts` | Filled in from Wiktionary. | CC BY-SA — see [docs/ATTRIBUTION.md](docs/ATTRIBUTION.md) |

```bash
npm run lexicon:fetch nl   # once — streams the Wiktionary dump into data/
npm run lexicon:build nl   # after adding lessons — fills gaps automatically
npm run validate           # the gate
```

**Nothing heavy ships.** `lexicon:fetch` streams a ~250 MB Wiktionary extract and
keeps a ~9 MB cache in `data/` (gitignored, dev-machine only).
`lexicon:build` then selects *only* the words the curriculum actually uses —
currently **12 KB**. Users download that, never the cache. Adding a language or a
unit is a rerun of `lexicon:build`, not a new runtime dependency.

`validate` covers **everything** — lesson phrases, glosses, pattern slots,
dialogue, sound drills, vocabulary items and their plurals, grammar examples,
and every part offered by the sentence builders. It fails on a noun whose
article disagrees with the lexicon, a word missing entirely, a duplicate id, a
learner turn with no cue, or a lesson that blows its new-word budget. Run it before shipping content — it's what makes
AI-drafted lessons safe.

Two rules encoded in the pipeline, both learned the hard way:

- **Unknown gender stays blank, never guessed.** An early run read gender from
  the wrong field and labelled every neuter noun `de`. A wrong article is worse
  than a missing one, because the learner drills it.
- **Every Dutch noun ending in `-je` is neuter.** Diminutives get their own
  entry rather than inheriting the base noun's gender, so `het bonnetje` doesn't
  become `de bonnetje` via `de bon`.

## Adding a language

Everything language-specific lives under `src/content/[code]/`:

```
src/content/fr/
  lessons.ts    units + lessons
  sounds.ts     pronunciation drills
  lexicon.ts    dictionary + validator source
  index.ts      LanguageConfig — locale, articles, UI labels
```

Then add it to the registry in [`src/content/index.ts`](src/content/index.ts).
Routes, progress tracking, review scheduling, speech, and the language switcher
all pick it up automatically.

Two things are genuinely per-language and shouldn't be copied across:

- **Sound drills.** Dutch `g` and French nasals share nothing.
- **Structural grammar.** Dutch needs `de`/`het` and verb-final clauses; French
  needs gender agreement and conjugation. The *situational* spine (greetings,
  café, directions) does transfer — that part is worth reusing.

UI chrome lives in each language's `ui` block, so the interface itself is in the
language you're learning (`Lessen`/`Leçons`, `Zeg het`/`Dis-le`).

The type definitions are in [`src/lib/types.ts`](src/lib/types.ts).
