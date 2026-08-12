import Link from "next/link";
import { notFound } from "next/navigation";
import { getLanguage, languageCodes } from "@/content";
import { contentForLevel, levels } from "@/content/levels";
import ProgressSummary from "@/components/ProgressSummary";

export function generateStaticParams() {
  return languageCodes().map((lang) => ({ lang }));
}

export default async function LevelPicker({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link href="/" className="text-sm text-muted hover:text-accent">
          ← All languages
        </Link>
        <h1 className="target text-4xl font-semibold tracking-tight">{language.name}</h1>
        <p className="max-w-2xl leading-relaxed text-muted">{language.blurb}</p>
        <ProgressSummary language={language} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Choose a level
        </h2>
        {levels.map((level) => {
          const content = contentForLevel(language, level.id);
          const total =
            content.lessons.length + content.vocabSets.length + content.grammar.length;
          const empty = total === 0;

          return (
            <Link
              key={level.id}
              href={empty ? `/${language.code}` : `/${language.code}/${level.slug}`}
              aria-disabled={empty}
              className={`flex items-center gap-4 rounded-2xl border p-5 transition-colors ${
                empty
                  ? "pointer-events-none border-line bg-sunk opacity-60"
                  : "border-line bg-surface hover:border-accent"
              }`}
            >
              <span
                aria-hidden
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl text-lg font-bold ${
                  empty ? "bg-locked text-white" : "bg-accent text-white"
                }`}
              >
                {level.id}
              </span>
              <span className="flex-1">
                <span className="block text-lg font-semibold">{level.title}</span>
                <span className="block text-sm leading-relaxed text-muted">{level.blurb}</span>
                <span className="mt-1 block text-xs text-muted">
                  {empty
                    ? "Nothing here yet — coming next."
                    : `${content.lessons.length} lessons · ${content.vocabSets.length} word sets · ${content.grammar.length} grammar points`}
                </span>
              </span>
              {!empty && <span aria-hidden className="text-2xl text-muted">→</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
