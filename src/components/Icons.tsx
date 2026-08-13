/**
 * Inline icons. Deliberately dependency-free — an icon library would be more
 * bytes than the whole shipped lexicon.
 *
 * All draw on a 24×24 grid and inherit `currentColor`, so a single `text-*`
 * class controls active/inactive state.
 */

type Props = { className?: string };

const base = "h-6 w-6";

export function HomeIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.5 20.5v-6h5v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function FlameIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <path
        d="M12 3s5 4 5 8.5a5 5 0 0 1-10 0C7 9 9 7.5 9 7.5S9.5 10 11 10c1.2 0 1-3.5 1-7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MicIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SendIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <path d="M4 12 20 4l-8 16-2-6-6-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function PathIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <path
        d="M6 20c0-3 3-3 6-3s6 0 6-3-3-3-6-3-6 0-6-3 3-3 6-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="6" cy="20" r="1.8" fill="currentColor" />
      <circle cx="18" cy="5" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function WordsIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5h-5A1.5 1.5 0 0 1 4 16V5.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 0 20 16V5.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReviewIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <path
        d="M20 12a8 8 0 1 1-2.6-5.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M20 4v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <path
        d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MoreIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <circle cx="5" cy="12" r="1.9" fill="currentColor" />
      <circle cx="12" cy="12" r="1.9" fill="currentColor" />
      <circle cx="19" cy="12" r="1.9" fill="currentColor" />
    </svg>
  );
}

export function CloseIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SunIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-5 w-5"} aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? "h-5 w-5"} aria-hidden>
      <path
        d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GrammarIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <path d="M4 20 12 4l8 16" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7.5 14h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function BuildIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <rect x="3" y="4" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="4" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="7" y="14" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function VerbIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SoundIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className ?? base} aria-hidden>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
