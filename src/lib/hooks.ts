"use client";

import { useSyncExternalStore } from "react";
import {
  progressSnapshot,
  serverProgressSnapshot,
  subscribeProgress,
  type Progress,
} from "./progress";
import {
  activeProfileId,
  listProfiles,
  serverActiveProfileId,
  serverProfiles,
  subscribeProfiles,
  type Profile,
} from "./profiles";
import {
  selectedLanguages,
  serverSelectedLanguages,
  subscribeLanguages,
} from "./languagePrefs";

const neverChanges = () => () => {};

/**
 * False during server render and the hydration pass, true afterwards.
 *
 * Lets a component hold back browser-only output (stored progress, speech
 * support) until it can render the real answer, instead of flashing a wrong
 * one. Uses the store API rather than an effect so it never triggers a
 * cascading render.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false
  );
}

/** Live view of stored progress, kept in sync across tabs and profile switches. */
export function useProgress(): Progress {
  return useSyncExternalStore(
    subscribeProgress,
    progressSnapshot,
    serverProgressSnapshot
  );
}

/** All local profiles, kept in sync as they're added, renamed or removed. */
export function useProfiles(): Profile[] {
  return useSyncExternalStore(subscribeProfiles, listProfiles, serverProfiles);
}

/** The profile currently active on this device. */
export function useActiveProfileId(): string {
  return useSyncExternalStore(subscribeProfiles, activeProfileId, serverActiveProfileId);
}

/** Language codes the learner has chosen to study (empty = not chosen yet). */
export function useSelectedLanguages(): string[] {
  return useSyncExternalStore(
    subscribeLanguages,
    selectedLanguages,
    serverSelectedLanguages
  );
}
