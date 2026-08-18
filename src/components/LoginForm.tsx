"use client";

import { useState } from "react";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth";

/**
 * The login page's form. Email and password, with a sign-in / sign-up toggle.
 *
 * On a successful session the AuthGate takes over and routes onward (to
 * onboarding for a new account, or the app for an existing one), so this screen
 * only owns the credential step and its error and confirmation states.
 */
export default function LoginForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true);
    setError("");

    const result =
      mode === "up"
        ? await signUpWithPassword(email.trim(), password)
        : await signInWithPassword(email.trim(), password);

    setBusy(false);
    if (result.error) {
      setError(result.error);
    } else if (mode === "up" && "needsConfirmation" in result && result.needsConfirmation) {
      setConfirm(true);
    }
    // On success with a session, AuthGate redirects; nothing to do here.
  };

  if (confirm) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-6 text-center">
        <p className="text-3xl">📬</p>
        <h2 className="mt-2 text-lg font-semibold">Bevestig je e-mail</h2>
        <p className="mt-1 text-sm text-muted">
          We sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Open it, then come back and
          log in.
        </p>
        <button
          onClick={() => {
            setConfirm(false);
            setMode("in");
          }}
          className="mt-4 text-sm font-medium text-accent hover:underline"
        >
          Back to log in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-3xl border border-line bg-surface p-5">
      <div className="flex rounded-full bg-sunk p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => {
            setMode("in");
            setError("");
          }}
          className={`flex-1 rounded-full py-1.5 transition-colors ${
            mode === "in" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("up");
            setError("");
          }}
          className={`flex-1 rounded-full py-1.5 transition-colors ${
            mode === "up" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          Sign up
        </button>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">E-mail</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="h-11 w-full rounded-xl border border-line bg-background px-3 outline-none focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">Wachtwoord · Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete={mode === "up" ? "new-password" : "current-password"}
          className="h-11 w-full rounded-xl border border-line bg-background px-3 outline-none focus:border-accent"
        />
      </label>

      {error && <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="h-12 w-full rounded-xl bg-accent font-semibold text-white transition-transform active:scale-[0.99] disabled:opacity-50"
      >
        {busy ? "…" : mode === "up" ? "Account aanmaken" : "Log in"}
      </button>
    </form>
  );
}
