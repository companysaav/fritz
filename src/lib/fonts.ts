import {
  Shrikhand,
  Fraunces,
  Nunito,
  IBM_Plex_Mono,
  Courier_Prime,
  Caveat,
  UnifrakturMaguntia,
} from "next/font/google";

/** Chunky, warm display face — the fritz voice. Wordmark + headlines only. */
export const display = Shrikhand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/** Comfortable reading serif for long-form prose (novels + essays). */
export const body = Fraunces({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

/** Friendly rounded sans for UI, nav, and metadata. */
export const sans = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/* ---------------------------------------------------------------------------
   Opt-in prose faces. Default prose stays Fraunces; these are applied only via
   the {key}…{/key} font tag (or the toolbar font picker). Keep this list in
   sync with FONT_KEYS in lib/content/sanitizeHtml + the .ff-* CSS classes.
   --------------------------------------------------------------------------- */

/** {mono} — system / status windows, stat blocks. */
export const mono = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

/** {type} — letters, journals, found documents. */
export const typewriter = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-typewriter",
  display: "swap",
});

/** {hand} — notes, signs, scrawled asides. */
export const hand = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

/** {rune} — ancient / eldritch / runic text. */
export const rune = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rune",
  display: "swap",
});
