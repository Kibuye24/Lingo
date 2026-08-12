import Link from "next/link";
import { notFound } from "next/navigation";
import GrammarView from "@/components/GrammarView";
import { getLanguage, languages } from "@/content";
import { levelFromSlug, levels } from "@/content/levels";

export function generateStaticParams() {
  return languages.flatMap((language) =>
    levels.flatMap((level) =>
      language.grammar
        .filter((point) => point.level === level.id)
        .map((point) => ({ lang: language.code, level: level.slug, id: point.id }))
    )
  );
}

export default async function GrammarPage({
  params,
}: PageProps<"/[lang]/[level]/grammatica/[id]">) {
  const { lang, level: slug, id } = await params;
  const language = getLanguage(lang);
  const level = levelFromSlug(slug);
  const point = language?.grammar.find((g) => g.id === id);
  if (!language || !level || !point) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href={`/${language.code}/${slug}/grammatica`}
          className="text-sm text-muted hover:text-accent"
        >
          ← Grammatica
        </Link>
        <h1 className="target text-3xl font-semibold tracking-tight">
          <span aria-hidden className="mr-2">
            {point.icon}
          </span>
          {point.title}
        </h1>
        <p className="text-sm text-muted">{point.titleEn}</p>
        <p className="text-lg">{point.canDo}</p>
      </div>
      <GrammarView language={language} point={point} />
    </div>
  );
}
