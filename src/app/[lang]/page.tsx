import { notFound } from "next/navigation";
import HomeDashboard from "@/components/HomeDashboard";
import { getLanguage, languageCodes } from "@/content";

export function generateStaticParams() {
  return languageCodes().map((lang) => ({ lang }));
}

export default async function LanguageHome({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const language = getLanguage(lang);
  if (!language) notFound();

  return <HomeDashboard language={language} />;
}
