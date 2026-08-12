# Attribution and licensing

## Wiktionary-derived lexicon data

Parts of the lexicons in `src/content/*/lexicon.generated.ts` are derived from
**Wiktionary**, via the machine-readable extractions published at
[kaikki.org](https://kaikki.org) by Tatu Ylönen.

- Source: https://kaikki.org — extractions of https://www.wiktionary.org
- Licence: **Creative Commons Attribution-ShareAlike**
  ([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/))

### What this obliges

**Attribution.** Wiktionary must be credited wherever the derived data is
distributed. This file, plus the header comment in each generated lexicon file,
serves that purpose. The app's About text should link here.

**Share-alike.** The derived *dataset* — the generated lexicon files — is
likewise licensed CC BY-SA 4.0. Anyone who redistributes it must keep it under
the same terms.

**Scope.** Share-alike binds the data, not the application. The source code of
this app, the curriculum text, the pronunciation notes, and the hand-authored
`lexicon.ts` entries marked `source: "curated"` are original work and are not
CC BY-SA by virtue of sitting alongside the generated data.

This separation is the reason generated and curated entries live in different
files: `lexicon.ts` (original, curated) and `lexicon.generated.ts`
(Wiktionary-derived, CC BY-SA). Keeping them apart means the licence boundary is
visible rather than implied.

### Practically

If you deploy or share this app, you are distributing the derived dataset. Keep
this file in the repo, and keep the attribution link reachable from the running
app.

## Other sources

Currently none. If the project later ingests any of the following, add them
here:

| Source | Gives | Licence |
| --- | --- | --- |
| OpenTaal wordlist | Dutch spelling validity | permissive |
| Open Dutch WordNet | sense relations | CC BY-SA 4.0 |
| Tatoeba | example sentences | CC BY 2.0 FR |

## Speech

Speech synthesis and recognition use the browser's built-in Web Speech API. No
third-party service, no data sent anywhere, nothing to attribute.
