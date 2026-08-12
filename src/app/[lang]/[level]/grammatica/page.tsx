import Link from "next/link";
import { notFound } from "next/navigation";
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
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href={`/${language.code}/${slug}`} className="text-sm text-muted hover:text-accent">
          ← {level}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Grammatica</h1>
        <p className="max-w-2xl text-muted">
          The rules you genuinely have to be told. No amount of repeating phrases
          will reveal what &ldquo;hij&rdquo; is, or why it takes a different verb ending.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {grammar.map((point) => (
          <Link
            key={point.id}
            href={`/${language.code}/${slug}/grammatica/${point.id}`}
            className="group flex gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
          >
            <span aria-hidden className="text-3xl leading-none">
              {point.icon}
            </span>
            <span className="flex-1">
              <span className="target block text-lg font-semibold group-hover:text-accent">
                {point.title}
              </span>
              <span className="block text-sm text-muted">{point.titleEn}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">
                {point.canDo}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
