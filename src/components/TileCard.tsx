import Link from "next/link";

/**
 * A colourful list card: a tinted badge carrying an emoji or icon, then text.
 *
 * The badge is the point — it turns a wall of near-identical rows into
 * something scannable by colour, matching the home screen's cards. Callers
 * pass a tile index; the CSS classes (globals.css) supply six theme-aware
 * background/foreground pairs it cycles through.
 */
export default function TileCard({
  href,
  emoji,
  Icon,
  title,
  subtitle,
  meta,
  tint,
}: {
  href: string;
  emoji?: string;
  Icon?: (props: { className?: string }) => React.ReactElement;
  title: string;
  subtitle?: string;
  meta?: string;
  /** 0-based; wraps around the six tints. */
  tint: number;
}) {
  const tile = `tile-${(tint % 6) + 1}`;

  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 rounded-3xl border border-line bg-surface p-3.5 transition-all hover:border-accent active:scale-[0.99]"
    >
      <span
        aria-hidden
        className={`${tile} tile-bg grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl`}
      >
        {Icon ? <Icon className="tile-fg h-7 w-7" /> : emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="target block truncate text-base font-semibold group-hover:text-accent">
          {title}
        </span>
        {subtitle && <span className="block truncate text-sm text-muted">{subtitle}</span>}
        {meta && <span className="mt-0.5 block text-xs font-medium text-muted">{meta}</span>}
      </span>
      <span aria-hidden className={`${tile} tile-fg text-lg opacity-60`}>
        →
      </span>
    </Link>
  );
}
