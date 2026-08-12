import Link from "next/link";
import { notFound } from "next/navigation";
import VerbConjugationView from "@/components/VerbConjugationView";
import { getLanguage, languages } from "@/content";
import { levelFromSlug, levels } from "@/content/levels";

export function generateStaticParams() {
  return languages.flatMap((language) =>
    levels.flatMap((level) =>
      language.verbs.map((verb) => ({ lang: language.code, level: level.slug, id: verb.id }))
    )
  );
}

export default async function VerbPage({
  params,
}: PageProps<"/[lang]/[level]/werkwoorden/[id]">) {
  const { lang, level: slug, id } = await params;
  const language = getLanguage(lang);
  const level = levelFromSlug(slug);
  const verb = language?.verbs.find((v) => v.id === id);
  if (!language || !level || !verb) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href={`/${language.code}/${slug}/werkwoorden`}
          className="text-sm text-muted hover:text-accent"
        >
          ← Vervoeging
        </Link>
        <h1 className="target text-4xl font-semibold tracking-tight">{verb.infinitive}</h1>
        <p className="text-lg text-muted">{verb.en}</p>
      </div>
      <VerbConjugationView language={language} verb={verb} />
    </div>
  );
}
