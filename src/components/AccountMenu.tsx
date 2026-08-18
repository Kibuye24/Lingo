"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth";

/**
 * The signed-in user, and a way out.
 *
 * Just identity and sign-out — no profile switching, no "sync now". Being
 * signed in already means your progress is yours and follows you, so there's
 * nothing to toggle here.
 */
export default function AccountMenu() {
  const { user, configured, ready } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // No account UI before auth resolves, in guest builds, or when signed out.
  if (!configured || !ready || !user) return <div className="h-8 w-8 shrink-0" />;

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        aria-expanded={open}
        className="grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-semibold text-white"
      >
        {initial}
      </button>

      {open && (
        <div className="fade-in absolute right-0 z-40 mt-2 w-60 rounded-2xl border border-line bg-surface p-1.5 shadow-lg">
          <div className="px-2.5 py-2">
            <p className="text-xs text-muted">Signed in as</p>
            <p className="truncate text-sm font-medium">{user.email}</p>
          </div>
          <div className="border-t border-line pt-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/welcome");
              }}
              className="w-full rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-sunk"
            >
              Talen wijzigen · Change languages
            </button>
            <button
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.replace("/login");
              }}
              className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-bad transition-colors hover:bg-sunk"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
