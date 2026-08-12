"use client";

import { useProgress } from "@/lib/hooks";

/** Small badge showing whether a lesson has been finished. */
export default function LessonStatus({
  lang,
  lessonId,
}: {
  lang: string;
  lessonId: string;
}) {
  const progress = useProgress();

  if (!progress.lessonsCompleted.includes(`${lang}:${lessonId}`)) return null;

  return (
    <span className="shrink-0 rounded-full bg-good-soft px-2.5 py-1 text-xs font-medium text-good">
      ✓
    </span>
  );
}
