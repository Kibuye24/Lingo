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
    <div>
      <Suspense fallback={<div className="h-96" />}>
        <Conversation language={language} />
      </Suspense>
    </div>
  );
}
