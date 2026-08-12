import Link from "next/link";
import { notFound } from "next/navigation";
import { getLanguage, languageCodes } from "@/content";
import { contentForLevel, levelFromSlug, levels } from "@/content/levels";

export function generateStaticParams() {
  return languageCodes().flatMap((lang) =>
    levels.map((level) => ({ lang, level: level.slug }))
  );
}

export default async function ModePicker({ params }: PageProps<"/[lang]/[level]">) {
  const { lang, level: levelSlug } = await params;
  const language = getLanguage(lang);
  const level = levelFromSlug(levelSlug);
  if (!language || !level) notFound();

  const content = contentForLevel(language, level);
  const base = `/${language.code}/${levelSlug}`;

  const modes = [
    {
      href: `${base}/pad`,
      icon: "🗺️",
      title: language.ui.lessons,
      titleEn: "Follow the path",
      blurb: "Numbered lessons in order — phrases, dialogues, and speaking practice.",
      count: `${content.lessons.length} lessons`,
      primary: true,
    },
    {
      href: `${base}/woorden`,
      icon: "📚",
      title: "Woorden",
      titleEn: "Vocabulary",
      blurb: "Themed word sets — family, numbers, food, animals — with audio for every word.",
      count: `${content.vocabSets.length} sets`,
    },
    {
      href: `${base}/grammatica`,
      icon: "📐",
      title: "Grammatica",
      titleEn: "Grammar",
      blurb: "Pronouns, verb endings, de/het, word order. The rules you have to be told.",
      count: `${content.grammar.length} points`,
    },
    {
      href: `${base}/bouwen`,
      icon: "🧱",
      title: "Zinnen bouwen",
      titleEn: "Build sentences",
      blurb: "Pick a subject, verb and object. The app conjugates; you say it out loud.",
      count: `${content.sentenceDrills.length} builders`,
    },
    {
      href: `${base}/werkwoorden`,
      icon: "⏳",
      title: "Vervoeging",
      titleEn: "Verb conjugation",
      blurb: "Tap a verb, see it in present, past, present-perfect and future.",
      count: `${language.verbs.length} verbs`,
    },
    {
      href: `/${language.code}/klanken`,
      icon: "🔊",
      title: language.ui.sounds,
      titleEn: "Pronunciation lab",
      blurb: "The sounds that make you hard to follow, drilled one at a time.",
      count: `${language.soundDrills.length} sounds`,
    },
    {
      href: `/${language.code}/review`,
      icon: "🔁",
      title: language.ui.review,
      titleEn: "Spaced repetition",
      blurb: "Everything you've practised, resurfaced just before you'd forget it.",
      count: "due today",
    },
    {
      href: `/${language.code}/gesprek`,
      icon: "💬",
      title: language.ui.conversation,
      titleEn: "Talk to a tutor",
      blurb: "Free conversation or a roleplay, at your level, corrected gently.",
      count: "any time",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link href={`/${language.code}`} className="text-sm text-muted hover:text-accent">
          ← {language.name}
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight">{level}</h1>
        <p className="max-w-2xl text-muted">
          {levels.find((l) => l.id === level)?.blurb}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {modes.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className={`group flex gap-4 rounded-2xl border p-5 transition-colors hover:border-accent ${
              mode.primary ? "border-accent bg-accent-soft sm:col-span-2" : "border-line bg-surface"
            }`}
          >
            <span aria-hidden className="text-3xl leading-none">
              {mode.icon}
            </span>
            <span className="flex-1">
              <span className="target block text-lg font-semibold group-hover:text-accent">
                {mode.title}
              </span>
              <span className="block text-sm text-muted">{mode.titleEn}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">
                {mode.blurb}
              </span>
              <span className="mt-2 block text-xs font-medium text-muted">{mode.count}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
