import Link from "next/link";
import { notFound } from "next/navigation";
import { getLanguage, languageCodes } from "@/content";
import { levelFromSlug, levels } from "@/content/levels";

export function generateStaticParams() {
  return languageCodes().flatMap((lang) => levels.map((l) => ({ lang, level: l.slug })));
}

export default async function VerbIndex({
  params,
}: PageProps<"/[lang]/[level]/werkwoorden">) {
  const { lang, level: slug } = await params;
  const language = getLanguage(lang);
  const level = levelFromSlug(slug);
  if (!language || !level) notFound();

  // Verbs aren't leveled the way lessons are yet — show the whole library.
  const verbs = language.verbs;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href={`/${language.code}/${slug}`} className="text-sm text-muted hover:text-accent">
          ← {level}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Vervoeging</h1>
        <p className="max-w-2xl text-muted">
          Tap any verb to see it across every tense — present, simple past,
          present perfect, and future — each with a real sentence and a
          speak-and-check.
        </p>
      </div>

      {verbs.length === 0 ? (
        <p className="rounded-xl border border-line bg-sunk px-4 py-3 text-sm text-muted">
          Nothing here yet for this language.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {verbs.map((verb) => (
            <Link
              key={verb.id}
              href={`/${language.code}/${slug}/werkwoorden/${verb.id}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:border-accent"
            >
              <span>
                <span className="target block font-semibold group-hover:text-accent">
                  {verb.infinitive}
                </span>
                <span className="block text-sm text-muted">{verb.en}</span>
              </span>
              <span aria-hidden className="text-muted">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
