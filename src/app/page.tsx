import Link from "next/link";
import { languages } from "@/content";

export default function LanguagePicker() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">Learn out loud.</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Whole phrases you can actually use, in the order you&apos;ll need them.
          Every one gets played to you and listened back — so pronunciation is
          part of learning it, not something you fix later.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {languages.map((language) => (
          <Link
            key={language.code}
            href={`/${language.code}`}
            className="group flex flex-col gap-2 rounded-xl border border-line bg-surface p-6 transition-colors hover:border-accent"
          >
            <h2 className="target text-2xl font-semibold group-hover:text-accent">
              {language.name}
            </h2>
            <p className="text-sm text-muted">{language.nameEn}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{language.blurb}</p>
            <p className="mt-auto pt-3 text-xs text-muted">
              {language.lessons.length} lessons · {language.soundDrills.length} sound
              drills · {language.lexicon.length} dictionary entries
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
