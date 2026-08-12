"use client";

import { useEffect, useRef, useState } from "react";
import { useActiveProfileId, useHydrated, useProfiles } from "@/lib/hooks";
import { addProfile, setActiveProfile } from "@/lib/profiles";

/**
 * Named local profiles for one shared device.
 *
 * Not accounts — no password, no server, anyone at the device can switch to
 * anyone's profile. That's the right trade for a household practising on the
 * same laptop; it isn't a privacy boundary.
 */
export default function ProfileSwitcher() {
  const hydrated = useHydrated();
  const profiles = useProfiles();
  const activeId = useActiveProfileId();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setAdding(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!hydrated) return <div className="h-8 w-8 shrink-0" />;

  const active = profiles.find((p) => p.id === activeId) ?? profiles[0];
  if (!active) return null;

  const submitNew = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const profile = addProfile(name);
    setActiveProfile(profile.id);
    setName("");
    setAdding(false);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Profile: ${active.name}`}
        aria-expanded={open}
        className="grid h-8 w-8 place-items-center rounded-full border border-line bg-sunk text-base transition-colors hover:border-accent"
      >
        <span aria-hidden>{active.emoji}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-lg">
          <p className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Wie ben je? · Who&apos;s learning?
          </p>
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => {
                setActiveProfile(profile.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-sunk ${
                profile.id === activeId ? "bg-accent-soft font-medium" : ""
              }`}
            >
              <span aria-hidden>{profile.emoji}</span>
              <span className="flex-1">{profile.name}</span>
              {profile.id === activeId && (
                <span aria-hidden className="text-accent">
                  ✓
                </span>
              )}
            </button>
          ))}

          <div className="mt-1 border-t border-line pt-1">
            {adding ? (
              <form onSubmit={submitNew} className="flex items-center gap-1.5 px-1 py-1">
                <input
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Naam"
                  className="h-8 flex-1 rounded-md border border-line bg-background px-2 text-sm outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  className="h-8 rounded-md bg-accent px-2.5 text-sm text-white"
                >
                  +
                </button>
              </form>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-muted transition-colors hover:bg-sunk hover:text-foreground"
              >
                <span aria-hidden>+</span>
                <span>Nieuw profiel · Add someone</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
