import Link from "next/link";
import { languages } from "@/content";

/**
 * Onboarding: pick a language.
 *
 * Deliberately sparse. This is the first screen anyone sees, and the job is a
 * single decision — so it gets a flag, a name, and nothing competing for
 * attention. The detail about *why* Dutch is hard belongs later, once the
 * choice is made.
 */
export default function LanguagePicker() {
  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="pt-6">
        <span
          aria-hidden
          className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-2xl font-bold text-white"
        >
          L
        </span>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight">
          Leer hardop.
          <span className="block text-muted">Learn out loud.</span>
        </h1>
      </div>

      <p className="mt-4 text-lg leading-relaxed text-muted">
        Which language are you learning?
      </p>

      <div className="mt-6 space-y-3">
        {languages.map((language) => (
          <Link
            key={language.code}
            href={`/${language.code}`}
            className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-all hover:border-accent hover:shadow-sm active:scale-[0.99]"
          >
            <span aria-hidden className="text-4xl leading-none">
              {language.flag}
            </span>
            <span className="flex-1">
              <span className="target block text-xl font-semibold group-hover:text-accent">
                {language.name}
              </span>
              <span className="block text-sm text-muted">{language.nameEn}</span>
            </span>
            <span
              aria-hidden
              className="text-xl text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
            >
              →
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-auto pt-10 text-center text-xs leading-relaxed text-muted">
        Speech runs in your browser — no API keys, no quotas.
        <br />
        Chrome or Edge works best.
      </p>
    </div>
  );
}
