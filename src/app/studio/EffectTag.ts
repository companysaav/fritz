import { Mark, mergeAttributes } from "@tiptap/react";

import { FX_KEYS, FX_LABELS } from "@/lib/content/sanitizeHtml";

export const EFFECTS = FX_KEYS.map((key) => ({ key, label: FX_LABELS[key] }));

/**
 * An animated word run. Stores an effect key and serialises to
 * <span data-fx="shake" class="fx-shake">, animated by the .fx-* CSS (and, for
 * grow, the ProseFX scroll observer). Apply with the toolbar, or by typing
 * {key}…{/key}. Separate mark from FontTag so a word can be both (e.g. a
 * shaking chant).
 */
export const EffectTag = Mark.create({
  name: "effectTag",

  addAttributes() {
    return {
      fx: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-fx"),
        renderHTML: (attrs) =>
          attrs.fx ? { "data-fx": attrs.fx, class: `fx-${attrs.fx}` } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-fx]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },
});
