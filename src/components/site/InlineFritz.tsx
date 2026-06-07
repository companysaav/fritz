/**
 * The inline fritz face — black head, gold eyes, ember nose — sized to the
 * surrounding text. Used two ways:
 *  - <InlineFritz/> (React) for the editor node-view and legacy block content
 *  - FRITZ_INLINE_SVG (string) injected into published WYSIWYG HTML
 * Keep the two in sync.
 */
export function InlineFritz() {
  return (
    <svg
      className="fritz-inline"
      viewBox="0 0 100 100"
      role="img"
      aria-label="fritz"
    >
      <path d="M26 26 L22 7 L42 21 Z" fill="#1a1714" />
      <path d="M74 26 L78 7 L58 21 Z" fill="#1a1714" />
      <path
        d="M50 18 C 28 18 15 34 15 57 C 15 79 31 90 50 90 C 69 90 85 79 85 57 C 85 34 72 18 50 18 Z"
        fill="#1a1714"
      />
      <ellipse cx="37" cy="54" rx="8.5" ry="12" fill="#f2b705" />
      <ellipse cx="63" cy="54" rx="8.5" ry="12" fill="#f2b705" />
      <ellipse cx="37" cy="55" rx="3" ry="7" fill="#1a1714" />
      <ellipse cx="63" cy="55" rx="3" ry="7" fill="#1a1714" />
      <path d="M46 66 H54 L50 71 Z" fill="#e4572e" />
      <path
        d="M28 67 H10 M28 72 L11 76 M72 67 H90 M72 72 L89 76"
        stroke="#1a1714"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const FRITZ_INLINE_SVG =
  `<svg class="fritz-inline" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="fritz">` +
  `<path d="M26 26 L22 7 L42 21 Z" fill="#1a1714"/>` +
  `<path d="M74 26 L78 7 L58 21 Z" fill="#1a1714"/>` +
  `<path d="M50 18 C 28 18 15 34 15 57 C 15 79 31 90 50 90 C 69 90 85 79 85 57 C 85 34 72 18 50 18 Z" fill="#1a1714"/>` +
  `<ellipse cx="37" cy="54" rx="8.5" ry="12" fill="#f2b705"/>` +
  `<ellipse cx="63" cy="54" rx="8.5" ry="12" fill="#f2b705"/>` +
  `<ellipse cx="37" cy="55" rx="3" ry="7" fill="#1a1714"/>` +
  `<ellipse cx="63" cy="55" rx="3" ry="7" fill="#1a1714"/>` +
  `<path d="M46 66 H54 L50 71 Z" fill="#e4572e"/>` +
  `<path d="M28 67 H10 M28 72 L11 76 M72 67 H90 M72 72 L89 76" stroke="#1a1714" stroke-width="2" stroke-linecap="round"/>` +
  `</svg>`;
