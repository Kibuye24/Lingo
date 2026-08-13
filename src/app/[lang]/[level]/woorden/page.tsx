import Link from "next/link";
import { notFound } from "next/navigation";
import TileCard from "@/components/TileCard";
import { getLanguage, languageCodes } from "@/content";
import { contentForLevel, levelFromSlug, levels } from "@/content/levels";

export function generateStaticParams() {
  return languageCodes().flatMap((lang) => levels.map((l) => ({ lang, level: l.slug })));
}

export default async function VocabIndex({ params }: PageProps<"/[lang]/[level]/woorden">) {
  const { lang, level: slug } = await params;
  const language = getLanguage(lang);
  const level = levelFromSlug(slug);
  if (!language || !level) notFound();

  const { vocabSets } = contentForLevel(language, level);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Link href={`/${language.code}`} className="text-sm text-muted hover:text-accent">
          ← Home
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Woorden</h1>
        <p className="text-sm text-muted">
          Themed word sets — each noun carries its article, the part you have to memorise.
        </p>
      </div>

      <div className="space-y-2.5">
        {vocabSets.map((set, i) => (
          <TileCard
            key={set.id}
            href={`/${language.code}/${slug}/woorden/${set.id}`}
            emoji={set.icon}
            title={set.title}
            subtitle={set.titleEn}
            meta={`${set.items.length} words`}
            tint={i}
          />
        ))}
      </div>
    </div>
  );
}
