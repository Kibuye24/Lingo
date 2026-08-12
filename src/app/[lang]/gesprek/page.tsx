import { Suspense } from "react";
import { notFound } from "next/navigation";
import Conversation from "@/components/Conversation";
import { getLanguage, languageCodes } from "@/content";

export function generateStaticParams() {
  return languageCodes().map((lang) => ({ lang }));
}

export default async function ConversationPage({
  params,
}: PageProps<"/[lang]/gesprek">) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="target text-4xl font-semibold tracking-tight">
          {language.ui.conversation}
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed text-muted">
          Speak or type. The tutor stays in {language.nameEn}, keeps it near your
          level, and flags only the mistakes that actually get in the way.
        </p>
      </div>
      <Suspense fallback={<div className="h-96" />}>
        <Conversation language={language} />
      </Suspense>
    </div>
  );
}
