/**
 * fritz — the house cat. Shows up across the site (hero, asides, 404, footer)
 * to give it a recurring personality. Peeking-eyes motif from the brand inspo.
 */
export function Mascot({
  size = 64,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* head */}
      <path
        d="M20 44c0-6-4-22-2-26 2-3 13 6 17 9a40 40 0 0 1 30 0c4-3 15-12 17-9 2 4-2 20-2 26 6 8 6 24-6 33-7 5-16 7-24 7s-17-2-24-7c-12-9-12-25-6-33Z"
        fill="currentColor"
      />
      {/* eyes */}
      <ellipse cx="38" cy="52" rx="6.5" ry="9" fill="var(--color-mustard)" />
      <ellipse cx="62" cy="52" rx="6.5" ry="9" fill="var(--color-mustard)" />
      <ellipse cx="38" cy="53" rx="2.4" ry="6" fill="var(--color-ink)" />
      <ellipse cx="62" cy="53" rx="2.4" ry="6" fill="var(--color-ink)" />
      {/* nose */}
      <path d="M47 64h6l-3 4z" fill="var(--color-ember)" />
      {/* whisker hints */}
      <path
        d="M30 66h-12M30 70l-11 3M70 66h12M70 70l11 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Just the peeking eyes — for inline accents and loaders. */
export function MascotEyes({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <ellipse cx="18" cy="15" rx="7" ry="11" fill="var(--color-mustard)" />
      <ellipse cx="42" cy="15" rx="7" ry="11" fill="var(--color-mustard)" />
      <ellipse cx="18" cy="16" rx="2.6" ry="7.5" fill="var(--color-ink)" />
      <ellipse cx="42" cy="16" rx="2.6" ry="7.5" fill="var(--color-ink)" />
    </svg>
  );
}
