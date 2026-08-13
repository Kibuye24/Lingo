import Link from "next/link";
import { notFound } from "next/navigation";
import TileCard from "@/components/TileCard";
import { getLanguage, languageCodes } from "@/content";
import { contentForLevel, levelFromSlug, levels } from "@/content/levels";

export function generateStaticParams() {
  return languageCodes().flatMap((lang) => levels.map((l) => ({ lang, level: l.slug })));
}

export default async function GrammarIndex({
  params,
}: PageProps<"/[lang]/[level]/grammatica">) {
  const { lang, level: slug } = await params;
  const language = getLanguage(lang);
  const level = levelFromSlug(slug);
  if (!language || !level) notFound();

  const { grammar } = contentForLevel(language, level);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Link href={`/${language.code}`} className="text-sm text-muted hover:text-accent">
          ← Home
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Grammatica</h1>
        <p className="text-sm text-muted">
          The rules you have to be told — pronouns, verb endings, de/het, word order.
        </p>
      </div>

      <div className="space-y-2.5">
        {grammar.map((point, i) => (
          <TileCard
            key={point.id}
            href={`/${language.code}/${slug}/grammatica/${point.id}`}
            emoji={point.icon}
            title={point.title}
            subtitle={point.titleEn}
            meta={point.canDo}
            tint={i}
          />
        ))}
      </div>
    </div>
  );
}
