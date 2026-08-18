import Link from "next/link";
import { notFound } from "next/navigation";
import UnitTest from "@/components/UnitTest";
import { getLanguage, languages } from "@/content";
import { contentForLevel, levelFromSlug, levels } from "@/content/levels";

export function generateStaticParams() {
  return languages.flatMap((language) =>
    levels.flatMap((level) => {
      const { units } = contentForLevel(language, level.id);
      return units.map((unit) => ({ lang: language.code, level: level.slug, unitId: unit.id }));
    })
  );
}

export default async function TestPage({ params }: PageProps<"/[lang]/[level]/toets/[unitId]">) {
  const { lang, level: slug, unitId } = await params;
  const language = getLanguage(lang);
  const level = levelFromSlug(slug);
  if (!language || !level) notFound();

  const { units, lessons } = contentForLevel(language, level);
  const unit = units.find((u) => u.id === unitId);
  if (!unit) notFound();

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Link href={`/${language.code}/${slug}/pad`} className="text-sm text-muted hover:text-accent">
          ← {language.ui.lessons}
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Moduletoets · Module test
        </p>
        <h1 className="target text-2xl font-semibold tracking-tight">{unit.title}</h1>
        <p className="text-sm text-muted">{unit.titleEn}</p>
      </div>

      <UnitTest language={language} level={slug} unitId={unitId} units={units} lessons={lessons} />
    </div>
  );
}
