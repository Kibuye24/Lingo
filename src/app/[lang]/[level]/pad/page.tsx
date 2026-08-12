import Link from "next/link";
import { notFound } from "next/navigation";
import LessonTrail from "@/components/LessonTrail";
import { getLanguage, languageCodes } from "@/content";
import { contentForLevel, levelFromSlug, levels } from "@/content/levels";

export function generateStaticParams() {
  return languageCodes().flatMap((lang) => levels.map((l) => ({ lang, level: l.slug })));
}

export default async function TrailPage({ params }: PageProps<"/[lang]/[level]/pad">) {
  const { lang, level: slug } = await params;
  const language = getLanguage(lang);
  const level = levelFromSlug(slug);
  if (!language || !level) notFound();

  const { units, lessons } = contentForLevel(language, level);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href={`/${language.code}/${slug}`}
          className="text-sm text-muted hover:text-accent"
        >
          ← {level}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{language.ui.lessons}</h1>
        <p className="text-muted">
          {lessons.length} lessons, in order. Tap any circle to start.
        </p>
      </div>
      <LessonTrail language={language} units={units} lessons={lessons} />
    </div>
  );
}
