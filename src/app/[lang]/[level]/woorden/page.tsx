import Link from "next/link";
import { notFound } from "next/navigation";
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
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href={`/${language.code}/${slug}`} className="text-sm text-muted hover:text-accent">
          ← {level}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Woorden</h1>
        <p className="max-w-2xl text-muted">
          Lessons teach phrases you can say. These teach the words you slot into
          them — with the article attached, because that&apos;s the part you have to
          memorise.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {vocabSets.map((set) => (
          <Link
            key={set.id}
            href={`/${language.code}/${slug}/woorden/${set.id}`}
            className="group flex gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent"
          >
            <span aria-hidden className="text-3xl leading-none">
              {set.icon}
            </span>
            <span className="flex-1">
              <span className="target block text-lg font-semibold group-hover:text-accent">
                {set.title}
              </span>
              <span className="block text-sm text-muted">{set.titleEn}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{set.blurb}</span>
              <span className="mt-2 block text-xs font-medium text-muted">
                {set.items.length} words
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
