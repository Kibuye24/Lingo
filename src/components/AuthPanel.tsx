"use client";

import { useEffect, useState } from "react";
import { getSupabase, syncConfigured } from "@/lib/supabase";
import { syncNow } from "@/lib/sync";

/**
 * Sign-in for cross-device sync.
 *
 * Magic link rather than a password: the app never handles, stores or
 * transmits a credential, there's nothing to leak, and it works the same on a
 * laptop and a phone. Signing in is also entirely optional — without it the
 * app is unchanged and fully offline.
 */
export default function AuthPanel() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
      if (data.session) void runSync();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      if (session) void runSync();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function runSync() {
    setSyncing(true);
    const result = await syncNow();
    setSyncing(false);
    if (!result.ok && result.error) setMessage(result.error);
    else setMessage("");
  }

  if (!syncConfigured()) {
    return (
      <p className="px-2.5 py-2 text-xs leading-relaxed text-muted">
        Progress is saved on this device only. Add Supabase keys to enable sync
        across your laptop and phone.
      </p>
    );
  }

  if (userEmail) {
    return (
      <div className="space-y-1 px-2.5 py-2">
        <p className="truncate text-xs text-muted">
          Synced as <span className="font-medium text-foreground">{userEmail}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void runSync()}
            disabled={syncing}
            className="text-xs text-accent hover:underline disabled:opacity-50"
          >
            {syncing ? "Syncing…" : "Sync now"}
          </button>
          <button
            onClick={async () => {
              await getSupabase()?.auth.signOut();
              setMessage("");
            }}
            className="text-xs text-muted hover:text-foreground"
          >
            Sign out
          </button>
        </div>
        {message && <p className="text-xs text-bad">{message}</p>}
      </div>
    );
  }

  if (status === "sent") {
    return (
      <p className="px-2.5 py-2 text-xs leading-relaxed text-muted">
        Check <span className="font-medium text-foreground">{email}</span> for a
        sign-in link. Open it on each device you want synced.
      </p>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const supabase = getSupabase();
        if (!supabase || !email.trim()) return;

        setStatus("sending");
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: { emailRedirectTo: window.location.origin },
        });

        if (error) {
          setStatus("error");
          setMessage(error.message);
        } else {
          setStatus("sent");
        }
      }}
      className="space-y-1.5 px-2.5 py-2"
    >
      <label className="block text-xs text-muted" htmlFor="sync-email">
        Sync across devices
      </label>
      <div className="flex items-center gap-1.5">
        <input
          id="sync-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-8 flex-1 rounded-md border border-line bg-background px-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-8 rounded-md bg-accent px-2.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {status === "sending" ? "…" : "Send"}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-bad">{message}</p>}
    </form>
  );
}
