import { notFound } from "next/navigation";
import SoundLab from "@/components/SoundLab";
import { getLanguage, languageCodes } from "@/content";

export function generateStaticParams() {
  return languageCodes().map((lang) => ({ lang }));
}

export default async function SoundsPage({ params }: PageProps<"/[lang]/klanken">) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="target text-4xl font-semibold tracking-tight">
          {language.ui.sounds}
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed text-muted">
          A handful of sounds account for most of what makes an English speaker&apos;s{" "}
          {language.nameEn} hard to follow. Work one at a time: read how it&apos;s
          made, listen, then say the words and see which ones land.
        </p>
      </div>
      <SoundLab language={language} />
    </div>
  );
}
