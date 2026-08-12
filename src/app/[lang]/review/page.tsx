import { notFound } from "next/navigation";
import ReviewSession from "@/components/ReviewSession";
import { getLanguage, languageCodes } from "@/content";

export function generateStaticParams() {
  return languageCodes().map((lang) => ({ lang }));
}

export default async function ReviewPage({ params }: PageProps<"/[lang]/review">) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="target text-4xl font-semibold tracking-tight">
          {language.ui.review}
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed text-muted">
          Phrases come back just before you&apos;d forget them. You&apos;ll see the
          English — say the {language.nameEn} from memory, then check.
        </p>
      </div>
      <ReviewSession language={language} />
    </div>
  );
}
