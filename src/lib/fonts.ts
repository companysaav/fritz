import { Shrikhand, Fraunces, Nunito } from "next/font/google";

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
