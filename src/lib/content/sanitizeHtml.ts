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

export const FONT_KEYS = ["mono", "type", "hand", "rune"] as const;
export type FontKey = (typeof FONT_KEYS)[number];

export const FONT_LABELS: Record<FontKey, string> = {
  mono: "mono",
  type: "typewriter",
  hand: "hand",
  rune: "rune",
};

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

/** Full clean for storage/render: normalise fonts, then resolve font tags. */
export function tidyBodyHtml(html: string): string {
  return applyFontTags(stripInlineFonts(html));
}
