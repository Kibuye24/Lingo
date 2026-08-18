import type { Lesson, Unit } from "./types";
import type { Progress } from "./progress";

/**
 * Module unlock logic.
 *
 * Modules run in order: the first is open, and each later one stays locked
 * until the previous module's consolidation test is passed. Existing progress
 * is grandfathered — a module you've already started counts as unlocked — so
 * turning gating on doesn't wall off work already done.
 */
export interface UnitState {
  unit: Unit;
  lessons: Lesson[];
  lessonsDone: number;
  allLessonsDone: boolean;
  testPassed: boolean;
  /** Whether this module's lessons can be opened. */
  unlocked: boolean;
  /** Whether the module test can be taken (all lessons done). */
  testUnlocked: boolean;
}

export function computeUnitStates(
  code: string,
  units: Unit[],
  lessons: Lesson[],
  progress: Progress
): UnitState[] {
  const doneLesson = (id: string) => progress.lessonsCompleted.includes(`${code}:${id}`);
  const testPassedFor = (uid: string) => progress.testsPassed.includes(`${code}:${uid}`);

  let prevOpensNext = true; // nothing gates the first module
  return units.map((unit) => {
    const uLessons = lessons.filter((l) => l.unit === unit.id);
    const lessonsDone = uLessons.filter((l) => doneLesson(l.id)).length;
    const allLessonsDone = uLessons.length > 0 && lessonsDone === uLessons.length;
    const testPassed = testPassedFor(unit.id);
    const unlocked = prevOpensNext || lessonsDone > 0;
    const testUnlocked = unlocked && allLessonsDone;
    prevOpensNext = unlocked && testPassed;
    return { unit, lessons: uLessons, lessonsDone, allLessonsDone, testPassed, unlocked, testUnlocked };
  });
}

export function unitStateById(
  code: string,
  units: Unit[],
  lessons: Lesson[],
  progress: Progress,
  unitId: string
): { state: UnitState; nextUnit?: Unit } | null {
  const states = computeUnitStates(code, units, lessons, progress);
  const index = states.findIndex((s) => s.unit.id === unitId);
  if (index < 0) return null;
  return { state: states[index], nextUnit: states[index + 1]?.unit };
}
