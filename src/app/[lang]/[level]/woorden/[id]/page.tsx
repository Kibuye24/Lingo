import Link from "next/link";
import { notFound } from "next/navigation";
import VocabSetView from "@/components/VocabSetView";
import { getLanguage, languages } from "@/content";
import { levelFromSlug, levels } from "@/content/levels";

export function generateStaticParams() {
  return languages.flatMap((language) =>
    levels.flatMap((level) =>
      language.vocabSets
        .filter((set) => set.level === level.id)
        .map((set) => ({ lang: language.code, level: level.slug, id: set.id }))
    )
  );
}

export default async function VocabSetPage({
  params,
}: PageProps<"/[lang]/[level]/woorden/[id]">) {
  const { lang, level: slug, id } = await params;
  const language = getLanguage(lang);
  const level = levelFromSlug(slug);
  const set = language?.vocabSets.find((s) => s.id === id);
  if (!language || !level || !set) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href={`/${language.code}/${slug}/woorden`}
          className="text-sm text-muted hover:text-accent"
        >
          ← Woorden
        </Link>
        <h1 className="target text-3xl font-semibold tracking-tight">
          <span aria-hidden className="mr-2">
            {set.icon}
          </span>
          {set.title}
        </h1>
        <p className="text-muted">{set.blurb}</p>
      </div>
      <VocabSetView language={language} set={set} />
    </div>
  );
}
