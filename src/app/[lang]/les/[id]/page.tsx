import { notFound } from "next/navigation";
import LessonRunner from "@/components/LessonRunner";
import { getLanguage, languages } from "@/content";

export function generateStaticParams() {
  return languages.flatMap((language) =>
    language.lessons.map((lesson) => ({ lang: language.code, id: lesson.id }))
  );
}

export default async function LessonPage({ params }: PageProps<"/[lang]/les/[id]">) {
  const { lang, id } = await params;
  const language = getLanguage(lang);
  const lesson = language?.lessons.find((l) => l.id === id);
  if (!language || !lesson) notFound();

  return <LessonRunner language={language} lesson={lesson} />;
}
