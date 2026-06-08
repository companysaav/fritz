import { Mark, mergeAttributes } from "@tiptap/react";

import { FONT_KEYS, FONT_LABELS } from "@/lib/content/sanitizeHtml";

export const FONTS = FONT_KEYS.map((key) => ({ key, label: FONT_LABELS[key] }));

/**
 * An opt-in font run. Stores a font key and serialises to
 * <span data-font="mono" class="ff-mono">, which the .ff-* CSS styles both in
 * the editor and on the page. Apply with the toolbar picker, or by typing
 * {key}…{/key} (resolved to the same span on save — see sanitizeHtml).
 *
 * Class-based (not inline font-family) so the paste font-stripper can normalise
 * everything else without disturbing a deliberate face.
 */
export const FontTag = Mark.create({
  name: "fontTag",

  addAttributes() {
    return {
      font: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-font"),
        renderHTML: (attrs) =>
          attrs.font
            ? { "data-font": attrs.font, class: `ff-${attrs.font}` }
            : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-font]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },
});
