# Lingo — road to A1/A2

Planning doc. Covers the curriculum spine, the drill modes still missing, the
data strategy, and the dictionary decision.

## Status

Done:

- **Multi-language architecture.** Content lives under `src/content/[code]/`;
  routes, progress, review and speech are all language-parameterised. Dutch and
  French both ship. Adding a language is content plus a registry entry.
- **Curated lexicons** — 195 Dutch entries, 77 French. Articles, plurals,
  participles, inflected forms.
- **`npm run validate`** — the content gate described below. Wired and green.
- **Per-language UI chrome**, so the interface is in the language being learned.

- **Wiktionary ingestion**, two-stage: `lexicon:fetch` caches locally,
  `lexicon:build` selects only what the curriculum uses. 116 of the 122 words
  units 4–12 introduced were resolved automatically; 6 needed a hand-written
  entry. That ratio is the whole argument for the pipeline.
- **A1 units 4–12** — 11 new Dutch lessons, 66 new phrases. 17 lessons total.

Next: the `de`/`het` and listening drills, then A2 once A1 is close to finished.

A note on scope that emerged while building: the **situational** spine transfers
across languages cleanly, but the **structural** units do not. Dutch `de`/`het`
and verb-final clauses have no French analogue; French needs nasal vowels,
liaison and conjugation. Unit lists below are Dutch-shaped — reuse the
situations, re-author the grammar.

## The actual bottleneck

The code for a language app is a weekend. The content is months. Six lessons and
38 phrases exist today — roughly 12% of A1. Getting to A2 means ~85 lessons and
~900 phrases.

So the engineering priority is **not more features, it's a content pipeline with
a validator**. Authoring 85 lessons by hand and eyeballing the Dutch will produce
errors, and errors in a drilling app are worse than gaps: the learner rehearses
them until they're permanent. Build the validator first, then pour content
through it.

## Sizing

| Level | Units | Lessons | Phrases | Cumulative words | Can do |
| --- | --- | --- | --- | --- | --- |
| A1 | 12 | ~40 | ~380 | ~600 | Handle predictable exchanges if the other person is patient |
| A2 | 12 | ~45 | ~520 | ~1,400 | Handle daily life — shops, doctor, work small talk, plans, past events |

Vocabulary counts are approximate; the CEFR defines levels by what you can *do*,
not by word counts. They're here as a budget, not a target.

## A1 spine

Units 1–3 exist. The rest in dependency order.

| # | Unit | Carries | New structure |
| --- | --- | --- | --- |
| 1 | Eerste contact ✅ | greetings, goodbyes | fixed chunks only |
| 2 | Wie ben jij ✅ | name, origin, residence | `ik` + present tense |
| 3 | Als je vastloopt ✅ | repair strategies | negation with `niet` |
| 4 | Getallen en tijd | numbers, clock, days, dates | inverted numerals (`eenentwintig`) |
| 5 | Familie en mensen | family, describing people | possessives, adjectives |
| 6 | Eten en drinken | café ✅, restaurant, groceries | `mag ik` / `ik wil graag`, `geen` vs `niet` |
| 7 | In de stad | directions ✅, transport, tickets | prepositions, `er` (receptive only) |
| 8 | Wonen | house, rooms, neighbourhood | `er is / er zijn` |
| 9 | Winkelen | shopping ✅, sizes, money | comparatives (basic) |
| 10 | Dagelijkse routine | daily routine, frequency | separable verbs, time-manner-place |
| 11 | Weer en seizoenen | weather, seasons, small talk | impersonal `het` |
| 12 | Afspraken maken | invitations, accepting, declining | modals: kunnen/willen/moeten/mogen |

## A2 spine

| # | Unit | Carries | New structure |
| --- | --- | --- | --- |
| 13 | Wat heb je gedaan | recounting recent events | **perfectum** — hebben/zijn + participle |
| 14 | Werk en studie | job, studies, workplace | subordinate `omdat`, `dat` |
| 15 | Gezondheid | body, doctor, pharmacy | reflexive verbs |
| 16 | Reizen | travel, hotel, booking | future with `gaan` |
| 17 | Bellen en mailen | phone, email, register | u/jij switching, formal formulae |
| 18 | Meningen geven | opinions, agreeing | `ik vind dat…`, word order in bijzinnen |
| 19 | Bijzinnen | — (structural unit) | **verb-final in subordinate clauses** |
| 20 | Plannen en toekomst | plans, intentions | `zullen`, conditional politeness |
| 21 | Problemen oplossen | complaints, returns, mix-ups | `zou`, softened requests |
| 22 | Vrije tijd | hobbies, sport, culture | frequency, duration |
| 23 | Vergelijken | comparing things | comparative/superlative full |
| 24 | Vertellen over vroeger | childhood, past habits | **imperfectum** — was/had/ging/kwam |

Two structural units (13, 19) carry the weight of A2. Everything else is
vocabulary hung on frames the learner already has.

## Drill modes still missing

The app is currently all *production* — say this phrase. That's the right core,
but four gaps will block A1/A2:

1. **`de` / `het` trainer.** The single biggest long-term error source for
   Dutch learners, and pronunciation practice does nothing for it. Rules cover
   most of it: every plural is `de`, every diminutive (`-je`) is `het`,
   `-ing/-heid/-teit/-tie` are `de`, `-ment/-sel/-isme/-um` are `het`, and
   two-syllable words starting `be-/ge-/ver-/ont-` are usually `het`. Roughly
   two-thirds of nouns are `de`, so guessing `de` beats guessing — teach the
   exceptions and drill the rest.
2. **Word-order builder.** Tap fragments into order. V2 (unit 10) and
   verb-final (unit 19) are structural facts you cannot absorb by repeating
   whole phrases — you have to assemble them.
3. **Listening comprehension.** Currently everything is speak-first. Play a
   phrase, learner picks or types the meaning. Free via TTS, and it's half of
   what "conversation" actually demands.
4. **`niet` vs `geen`.** Small, high-frequency, and consistently wrong in
   English speakers. Deserves its own drill.

## Content pipeline

The thing to build before mass authoring:

```
scripts/
  generate-lesson.ts   # AI drafts a lesson against the Lesson type
  validate-curriculum.ts   # the gate — runs in CI
```

`validate-curriculum` should fail the build on:

- a noun whose article disagrees with the lexicon
- a word not in the lexicon at all (catches typos and invented words)
- a lesson using more than N new words (enforces the vocabulary budget)
- a lesson using grammar not yet introduced by an earlier unit
- a phrase whose gloss doesn't cover its words
- duplicate phrase ids

That last set is what makes AI-drafted content safe to ship. The model proposes;
the lexicon and the ordering rules dispose. Native-speaker review then only has
to look at what survives, which is a much smaller job than reading everything.

## Data strategy

### What does *not* belong in a database

Curriculum and the base lexicon stay as typed data in the repo. They're
versioned, typechecked, diffable in review, ship statically, and work offline.
Putting them in a database buys nothing and costs the validator, the type
safety, and offline support.

### What does

User state, and only once cross-device matters:

```sql
-- keyed to auth user
user_phrase_state (
  user_id, phrase_id, streak, best_score, last_score,
  attempts, due_at, updated_at,
  primary key (user_id, phrase_id)
)

attempts (            -- append-only; feeds analytics and difficulty tuning
  id, user_id, phrase_id, target, transcript, score, created_at
)

user_lesson_state (user_id, lesson_id, completed_at)

saved_words (         -- personal dictionary
  user_id, lemma, meaning, article, source, created_at
)

lexicon_cache (       -- shared, AI-generated long tail (see below)
  lemma primary key, article, plural, part_of_speech,
  translation, generated_by, verified, created_at
)
```

**`phrase_id` is a string key into repo content, not a foreign key.** Curriculum
changes then never require a migration, and an orphaned row is harmless.

### Provider

**Supabase.** Native Vercel Marketplace integration (`vercel integration add
supabase`), so env vars provision automatically. Postgres with row-level
security, and auth in the same product — which matters because the moment you
want progress on both phone and laptop, you need accounts, and a separate auth
provider is a second integration to wire and pay for.

Neon is the better pick if auth never enters the picture. It won't stay out.

### Architecture: local-first, sync optional

Keep `localStorage` as the write path. It's instant, works on a plane, and needs
no account. Sync to Postgres in the background when signed in.

This preserves the property the app has today — open it and practise, no
signup — while making cross-device work for people who want it. The current
`Progress` shape stays the client source of truth; a sync layer goes beside it,
not under it. Last-write-wins per phrase is fine; the data is small and
conflicts are rare and low-stakes.

## Dictionary: own vs AI

**Own the core, generate the tail, cache the generations.** The split is between
*facts* and *explanation*.

### Why not pure AI

A dictionary's job is to be trusted. LLMs are unreliable at exactly the
properties a Dutch learner needs most — noun gender, plurals, past participles,
whether a verb separates — and they're unreliable *confidently*. A wrong `de`
is worse than no answer: the learner drills it and it sets. Add
non-determinism (same word, different answer next week), per-lookup latency and
cost on a high-frequency action, and no offline support.

### Why not pure own-dictionary

Licensing rules out the good commercial ones, and the free sources can't cover
everything a learner hears on the street. Nor can a static entry explain *why*
`ik ben geweest` and not `ik heb geweest`, or the difference between `leuk`,
`gezellig` and `mooi` — which is exactly what a learner asks.

### The split

**Curated local lexicon** (~2,500 lemmas covering A1/A2 plus common function
words). Holds the verifiable facts: article, plural, part of speech, participle,
separability, translation, and which lesson introduces it. Ships as static JSON,
a few hundred KB. Deterministic, offline, free.

This file does double duty — it's also what `validate-curriculum` checks
against. That's the strongest argument for owning it: **the dictionary and the
content validator are the same asset.** You need the lexicon regardless, so the
marginal cost of exposing it as a dictionary is near zero.

Sources, all openly licensed:

| Source | Gives | Licence note |
| --- | --- | --- |
| Wiktionary via Kaikki machine-readable dumps | gender, plurals, conjugations, senses | CC BY-SA — attribution **and** share-alike on the derived dataset |
| OpenTaal wordlist | spelling validity, morphology | permissive |
| Open Dutch WordNet | sense relations | CC BY-SA 4.0 |
| Tatoeba | example sentences, NL–EN pairs | CC BY |

Share-alike binds the derived *data file*, not the app code. Worth deciding
early whether that's acceptable, because it's painful to unwind later.

**AI for the tail and for explanation.** Word not in the lexicon? The model
answers, returns a *structured* entry (article, plural, POS, translation), and
the UI marks it as generated rather than verified. The entry is written to
`lexicon_cache`, so each long-tail word is paid for once and the shared lexicon
grows. Periodically promote high-traffic cached entries to the curated set after
a check.

And AI does the thing static data can't: usage questions, nuance between
near-synonyms, why a construction works. Route those to the tutor, not to a
lookup table.

### The feature that makes it matter

**Tap any Dutch word anywhere in the app** → popover with the entry and audio →
"add to my words" → it enters the SRS queue. A dictionary behind a search box is
a dead end; a dictionary wired into the review loop is how vocabulary actually
compounds. This is also what makes the `saved_words` table earn its place.

## Suggested order

1. Lexicon build + `validate-curriculum` (unblocks everything, low risk)
2. `de`/`het` trainer and listening drill (needed before unit 4)
3. A1 units 4–12 through the pipeline
4. Tap-to-look-up + saved words
5. Supabase + auth + sync (only when cross-device is actually wanted)
6. A2 units 13–24, structural units first
