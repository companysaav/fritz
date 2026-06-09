/**
 * Prose hygiene for the WYSIWYG body.
 *
 * The pain: pasting from Docs / Word / the web drags in inline font-family and
 * font-size everywhere, so a chapter ends up a patchwork of faces and sizes.
 * `stripInlineFonts` removes those (keeping `color`, which is the bleed-through
 * system) so everything inherits the one prose face — Fraunces.
 *
 * The escape hatch: when you *want* a different face, wrap it in {key}…{/key}.
 * `applyFontTags` turns that into a class span the CSS styles. Class-based on
 * purpose, so the font-stripper above can nuke inline fonts without touching it.
 *
 * Keep FONT_KEYS in sync with lib/fonts.ts and the .ff-* classes in globals.css.
 */

export const FONT_KEYS = ["mono", "type", "hand", "rune", "chant"] as const;
export type FontKey = (typeof FONT_KEYS)[number];

export const FONT_LABELS: Record<FontKey, string> = {
  mono: "mono",
  type: "typewriter",
  hand: "hand",
  rune: "rune",
  chant: "chant",
};

/** Animated word effects, same {key}...{/key} mechanism as fonts.
 *  bounce/shake loop gently; grow/reveal fire when scrolled into view. */
export const FX_KEYS = [
  "bounce",
  "shake",
  "grow",
  "shimmer",
  "glitch",
  "flicker",
  "pulse",
  "whisper",
  "reveal",
  "redact",
] as const;
export type FxKey = (typeof FX_KEYS)[number];

const FX_KEY_SET = new Set<string>(FX_KEYS);

export const FX_LABELS: Record<FxKey, string> = {
  bounce: "bounce",
  shake: "shake",
  grow: "grow",
  shimmer: "shimmer",
  glitch: "glitch",
  flicker: "flicker",
  pulse: "pulse",
  whisper: "whisper",
  reveal: "reveal",
  redact: "redact",
};

/** How big {grow} swells to by default — overridable per-use with {grow=2.5}. */
export const GROW_DEFAULT = 1.8;
export const GROW_MIN = 1;
export const GROW_MAX = 3;

/** Effects that animate on scroll-into-view (driven by ProseFX), not on a loop. */
export const FX_SCROLL: FxKey[] = ["grow", "reveal"];

export function normalizeFxList(value: unknown): FxKey[] {
  const seen = new Set<string>();
  return String(value ?? "")
    .split(/\s+/)
    .filter((key): key is FxKey => {
      if (!FX_KEY_SET.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function normalizeGrowScale(value: unknown): string {
  const raw =
    typeof value === "number" ? value : Number(String(value ?? "").trim());
  const safe = Number.isFinite(raw) ? raw : GROW_DEFAULT;
  const clamped = Math.min(GROW_MAX, Math.max(GROW_MIN, safe));
  return String(Math.round(clamped * 100) / 100);
}

function growAttrs(value: unknown): string {
  const scale = normalizeGrowScale(value);
  return ` data-grow="${scale}" style="--fx-grow-scale: ${scale}"`;
}

/** Drop pasted font-family / font-size / line-height + <font> + Word mso-* junk.
 *  Everything else in a style attribute (notably `color`) is preserved. */
export function stripInlineFonts(html: string): string {
  return html
    .replace(/<\/?font\b[^>]*>/gi, "")
    .replace(/\sstyle="([^"]*)"/gi, (_m, css: string) => {
      const kept = css
        .split(";")
        .map((d) => d.trim())
        .filter(
          (d) =>
            d &&
            !/^(font-family|font-size|line-height|font|mso-[\w-]+)\s*:/i.test(d),
        )
        .join("; ");
      return kept ? ` style="${kept}"` : "";
    });
}

/** Convert typed {key}…{/key} font tags into class spans (inline use). */
export function applyFontTags(html: string): string {
  let out = html;
  for (const key of FONT_KEYS) {
    const re = new RegExp(`\\{${key}\\}([\\s\\S]*?)\\{\\/${key}\\}`, "gi");
    out = out.replace(re, `<span data-font="${key}" class="ff-${key}">$1</span>`);
  }
  return out;
}

/** Convert typed {effect}...{/effect} tags into nested animated spans. Effects
 *  stack: directly-nested tags fold into one outer data-fx list (so they
 *  round-trip through the editor) while staying nested so the animations
 *  actually compound. Grow supports {grow=2.4}...{/grow}. */
export function applyEffectTags(html: string): string {
  let out = html;
  for (const key of FX_KEYS) {
    if (key === "grow") {
      out = out.replace(
        /\{grow(?:\s*=\s*([0-9]+(?:\.[0-9]+)?))?\}([\s\S]*?)\{\/grow\}/gi,
        (_m, scale: string | undefined, body: string) =>
          `<span data-fx="grow"${growAttrs(scale)} class="fx-grow">${body}</span>`,
      );
      continue;
    }
    const re = new RegExp(`\\{${key}\\}([\\s\\S]*?)\\{\\/${key}\\}`, "gi");
    out = out.replace(re, `<span data-fx="${key}" class="fx-${key}">$1</span>`);
  }
  // Fold nested effect spans into their parent's list: the inner span keeps its
  // class but drops data-fx, while the outer accumulates the full list.
  const merge =
    /<span data-fx="([^"]+)"(?: data-grow="([^"]+)")?(?: style="--fx-grow-scale: [^"]+")? class="(fx-[^"]+)">((?:<span class="fx-[^"]+">)*)<span data-fx="([^"]+)"(?: data-grow="([^"]+)")?(?: style="--fx-grow-scale: [^"]+")? class="(fx-[^"]+)">/g;
  let prev: string;
  do {
    prev = out;
    out = out.replace(
      merge,
      (
        _m,
        outerFx: string,
        outerGrow: string | undefined,
        outerClass: string,
        wrappers: string,
        innerFx: string,
        innerGrow: string | undefined,
        innerClass: string,
      ) => {
        const list = normalizeFxList(`${outerFx} ${innerFx}`);
        const scale = innerGrow ?? outerGrow;
        const grow = list.includes("grow") ? growAttrs(scale) : "";
        return `<span data-fx="${list.join(" ")}"${grow} class="${outerClass}">${wrappers}<span class="${innerClass}">`;
      },
    );
  } while (out !== prev);
  return out;
}

/** Turn a paragraph that's only a run of dashes/underscores/asterisks
 *  (---, ___, ***, any length ≥ 3) into a real scene break. Catches the
 *  literal separators that come in when a chapter is pasted from elsewhere. */
export function resolveBreaks(html: string): string {
  return html.replace(
    /<p[^>]*>\s*(?:<br\s*\/?>\s*)*[-_*](?:\s*[-_*]){2,}\s*(?:<br\s*\/?>\s*)*<\/p>/gi,
    "<hr>",
  );
}

/** Full clean for storage/render: normalise fonts, resolve tags + breaks. */
export function tidyBodyHtml(html: string): string {
  return resolveBreaks(applyEffectTags(applyFontTags(stripInlineFonts(html))));
}
