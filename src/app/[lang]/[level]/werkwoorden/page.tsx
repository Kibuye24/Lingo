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

  const verbs = language.verbs;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Link href={`/${language.code}`} className="text-sm text-muted hover:text-accent">
          ← Home
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Vervoeging</h1>
        <p className="text-sm text-muted">
          Tap a verb to see it in present, past, present-perfect and future.
        </p>
      </div>

      {verbs.length === 0 ? (
        <p className="rounded-2xl border border-line bg-sunk px-4 py-3 text-sm text-muted">
          Nothing here yet for this language.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {verbs.map((verb, i) => {
            const tile = `tile-${(i % 6) + 1}`;
            return (
              <Link
                key={verb.id}
                href={`/${language.code}/${slug}/werkwoorden/${verb.id}`}
                className={`${tile} tile-bg flex flex-col gap-1 rounded-2xl p-3.5 transition-transform active:scale-95`}
              >
                <span className="target text-lg font-semibold leading-tight tile-fg">
                  {verb.infinitive}
                </span>
                <span className="text-xs text-muted">{verb.en}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
