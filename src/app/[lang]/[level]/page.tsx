import { redirect } from "next/navigation";
import { languageCodes } from "@/content";
import { levels } from "@/content/levels";

export function generateStaticParams() {
  return languageCodes().flatMap((lang) => levels.map((l) => ({ lang, level: l.slug })));
}

/**
 * The old section menu. Every destination it listed now lives in the bottom
 * bar, so this only existed to be tapped through — home is the useful landing
 * spot instead.
 */
export default async function LevelIndex({ params }: PageProps<"/[lang]/[level]"> ) {
  const { lang } = await params;
  redirect(`/${lang}`);
}
