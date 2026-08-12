import type { Lesson, Unit } from "@/lib/types";

export const units: Unit[] = [
  {
    id: "contact",
    title: "Premiers contacts",
    titleEn: "First contact",
    blurb:
      "The phrases you need in the first thirty seconds of any conversation — and the ones that keep it alive when you get lost.",
    level: "A1",
  },
];

export const lessons: Lesson[] = [
  {
    id: "salutations",
    unit: "contact",
    title: "Bonjour et au revoir",
    titleEn: "Hello and goodbye",
    canDo: "Open and close a conversation without switching to English.",
    level: "A1",
    phrases: [
      {
        id: "bonjour",
        target: "Bonjour, comment allez-vous ?",
        en: "Hello, how are you?",
        gloss: [
          { target: "bonjour", en: "hello" },
          { target: "comment", en: "how" },
          { target: "allez-vous", en: "go you (formal)" },
        ],
        register: "formal",
        say: "bon-ZHOOR, ko-mahn ta-lay VOO — the n is nasal, not a full n",
        note: "The default polite greeting for anyone you don't know. In a shop, saying it before you ask anything is not optional in France.",
      },
      {
        id: "salut-ca-va",
        target: "Salut, ça va ?",
        en: "Hi, how's it going?",
        gloss: [
          { target: "salut", en: "hi" },
          { target: "ça va", en: "it goes" },
        ],
        register: "informal",
        say: "sa-LU, sa VA — the u in salut is the tight rounded one",
        note: "'Ça va ?' is both the question and the answer. 'Ça va, ça va.' is a complete exchange.",
      },
      {
        id: "ca-va-bien",
        target: "Ça va bien, merci. Et toi ?",
        en: "I'm well, thanks. And you?",
        gloss: [
          { target: "ça va bien", en: "it goes well" },
          { target: "merci", en: "thank you" },
          { target: "et toi", en: "and you" },
        ],
        register: "informal",
        say: "sa va bee-AN, mair-SEE. ay TWA",
        note: "Bouncing it back with 'Et toi ?' is what keeps it a conversation. Formal version: 'Et vous ?'",
      },
      {
        id: "enchante",
        target: "Enchanté.",
        en: "Pleased to meet you.",
        gloss: [{ target: "enchanté", en: "delighted" }],
        register: "neutral",
        say: "ahn-shahn-TAY — both vowels are nasal, no hard n",
        note: "Written 'enchantée' if you are a woman. It sounds identical.",
      },
      {
        id: "au-revoir",
        target: "Au revoir",
        en: "Goodbye",
        gloss: [
          { target: "au", en: "to the" },
          { target: "revoir", en: "seeing again" },
        ],
        register: "neutral",
        say: "oh ruh-VWAR",
        pattern: {
          template: "À ___",
          templateEn: "See you ___",
          slots: [
            { target: "Au revoir", en: "Goodbye (neutral, safe anywhere)" },
            { target: "À demain", en: "See you tomorrow" },
            { target: "À bientôt", en: "See you soon" },
            { target: "À tout à l'heure", en: "See you later today" },
          ],
        },
      },
      {
        id: "bonsoir",
        target: "Bonsoir",
        en: "Good evening",
        gloss: [{ target: "bonsoir", en: "good evening" }],
        register: "neutral",
        say: "bon-SWAR",
        note: "Swap to this around six in the evening. Using 'bonjour' at night marks you as a tourist.",
      },
    ],
    dialogue: [
      { speaker: "them", target: "Salut ! Ça va ?", en: "Hi! How's it going?" },
      {
        speaker: "you",
        target: "Ça va bien, merci. Et toi ?",
        en: "I'm well, thanks. And you?",
        cue: "Say you're well, thank them, and ask back.",
      },
      { speaker: "them", target: "Ça va aussi. Je dois partir.", en: "I'm good too. I have to go." },
      {
        speaker: "you",
        target: "À demain !",
        en: "See you tomorrow!",
        cue: "Say goodbye — you'll see them tomorrow.",
      },
    ],
    roleplay:
      "You bump into the learner in the hallway of your shared apartment building in Lyon. Greet them, ask how they are, chat for two or three exchanges about something small, then say you have to go.",
  },
  {
    id: "presentations",
    unit: "contact",
    title: "Qui es-tu ?",
    titleEn: "Who are you?",
    canDo: "Introduce yourself and say where you're from and where you live.",
    level: "A1",
    phrases: [
      {
        id: "je-mappelle",
        target: "Je m'appelle Josh.",
        en: "My name is Josh.",
        gloss: [
          { target: "je", en: "I" },
          { target: "m'appelle", en: "call myself" },
          { target: "Josh", en: "Josh" },
        ],
        say: "zhuh ma-PELL",
        note: "Literally 'I call myself'. The verb is reflexive — that pattern comes back constantly in French.",
      },
      {
        id: "comment-tappelles",
        target: "Comment tu t'appelles ?",
        en: "What's your name?",
        gloss: [
          { target: "comment", en: "how" },
          { target: "tu", en: "you" },
          { target: "t'appelles", en: "call yourself" },
        ],
        register: "informal",
        say: "ko-MAHN tu ta-PELL",
        note: "Formal: 'Comment vous appelez-vous ?' Use vous with strangers until invited otherwise.",
      },
      {
        id: "je-viens-de",
        target: "Je viens d'Angleterre.",
        en: "I'm from England.",
        gloss: [
          { target: "je viens", en: "I come" },
          { target: "d'Angleterre", en: "from England" },
        ],
        say: "zhuh vee-AN dahn-gluh-TAIR",
        pattern: {
          template: "Je viens ___.",
          templateEn: "I'm from ___.",
          slots: [
            { target: "Je viens d'Angleterre.", en: "England" },
            { target: "Je viens des États-Unis.", en: "the United States" },
            { target: "Je viens d'Ouganda.", en: "Uganda" },
            { target: "Je viens du Canada.", en: "Canada" },
          ],
        },
        note: "The word for 'from' changes with the country's gender: de, du, des, d'. Learn each country with its preposition attached.",
      },
      {
        id: "jhabite",
        target: "J'habite à Paris.",
        en: "I live in Paris.",
        gloss: [
          { target: "j'habite", en: "I live" },
          { target: "à Paris", en: "in Paris" },
        ],
        say: "zha-BEET a pa-REE — the h is completely silent",
        pattern: {
          template: "J'habite à ___.",
          templateEn: "I live in ___.",
          slots: [
            { target: "J'habite à Paris.", en: "Paris" },
            { target: "J'habite à Lyon.", en: "Lyon" },
            { target: "J'habite ici depuis deux ans.", en: "I've lived here two years." },
          ],
        },
      },
      {
        id: "je-parle-peu",
        target: "Je parle un peu français.",
        en: "I speak a little French.",
        gloss: [
          { target: "je parle", en: "I speak" },
          { target: "un peu", en: "a little" },
          { target: "français", en: "French" },
        ],
        say: "zhuh parl un PUH frahn-SAY",
        note: "Your most useful sentence. It buys patience and stops people switching to English.",
      },
      {
        id: "je-comprends-pas",
        target: "Désolé, je ne comprends pas.",
        en: "Sorry, I don't understand.",
        gloss: [
          { target: "désolé", en: "sorry" },
          { target: "je ne comprends pas", en: "I do not understand" },
        ],
        say: "day-zo-LAY, zhuh nuh kom-PRAHN pa",
        note: "French negation wraps the verb: ne … pas. In speech the 'ne' often vanishes — you'll hear 'je comprends pas'.",
      },
    ],
    dialogue: [
      { speaker: "them", target: "Bonjour ! Je m'appelle Claire. Et vous ?", en: "Hello! My name is Claire. And you?" },
      {
        speaker: "you",
        target: "Je m'appelle Josh. Enchanté.",
        en: "My name is Josh. Pleased to meet you.",
        cue: "Give your name and say it's nice to meet them.",
      },
      { speaker: "them", target: "Enchantée ! D'où venez-vous ?", en: "Pleased to meet you! Where are you from?" },
      {
        speaker: "you",
        target: "Je viens d'Angleterre, mais j'habite à Paris.",
        en: "I'm from England, but I live in Paris.",
        cue: "Say where you're from, then where you live now. Join them with 'mais' (but).",
      },
      { speaker: "them", target: "Vous parlez très bien français !", en: "You speak French very well!" },
      {
        speaker: "you",
        target: "Je parle un peu français.",
        en: "I speak a little French.",
        cue: "Deflect modestly — say you speak a bit of French.",
      },
    ],
    roleplay:
      "You are a friendly French person at a housewarming party. You've just been introduced to the learner. Find out their name, where they're from, and where they live now. Share the same about yourself. Keep your French simple and warm.",
  },
];
