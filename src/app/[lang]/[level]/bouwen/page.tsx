import Link from "next/link";
import { notFound } from "next/navigation";
import SentenceBuilder from "@/components/SentenceBuilder";
import { getLanguage, languageCodes } from "@/content";
import { contentForLevel, levelFromSlug, levels } from "@/content/levels";

export function generateStaticParams() {
  return languageCodes().flatMap((lang) => levels.map((l) => ({ lang, level: l.slug })));
}

export default async function BuildPage({ params }: PageProps<"/[lang]/[level]/bouwen">) {
  const { lang, level: slug } = await params;
  const language = getLanguage(lang);
  const level = levelFromSlug(slug);
  if (!language || !level) notFound();

  const { sentenceDrills } = contentForLevel(language, level);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link href={`/${language.code}/${slug}`} className="text-sm text-muted hover:text-accent">
          ← {level}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Zinnen bouwen</h1>
        <p className="max-w-2xl text-muted">
          Pick a subject, a verb and an object. The app conjugates for you and
          shows exactly which part changed — then you say it out loud.
        </p>
      </div>

      {sentenceDrills.map((drill) => (
        <section key={drill.id} className="space-y-4">
          <div>
            <h2 className="target text-xl font-semibold">
              <span aria-hidden className="mr-2">
                {drill.icon}
              </span>
              {drill.title}
            </h2>
            <p className="text-sm text-muted">{drill.blurb}</p>
          </div>
          <SentenceBuilder language={language} drill={drill} />
        </section>
      ))}
    </div>
  );
}
