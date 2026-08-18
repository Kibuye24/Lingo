import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Log in — Lingo" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-sm flex-col justify-center">
      <div className="mb-6 text-center">
        <span
          aria-hidden
          className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-2xl font-bold text-white"
        >
          L
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Welkom bij Lingo</h1>
        <p className="mt-1 text-sm text-muted">Log in to keep your progress and streak.</p>
      </div>
      <LoginForm />
      <p className="mt-6 text-center text-xs text-muted">
        Speech runs in your browser — no quotas, no limits.
      </p>
    </div>
  );
}
