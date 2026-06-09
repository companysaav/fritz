import { Mark, mergeAttributes } from "@tiptap/react";
import type { DOMOutputSpec } from "@tiptap/pm/model";

import {
  FX_KEYS,
  FX_LABELS,
  normalizeFxList,
  normalizeGrowScale,
} from "@/lib/content/sanitizeHtml";

export const EFFECTS = FX_KEYS.map((key) => ({ key, label: FX_LABELS[key] }));

/**
 * A stack of animated word effects. `fx` holds a space-separated list (e.g.
 * "shake shimmer") and serialises to NESTED spans - each effect gets its own
 * element so transform-based animations (shake, bounce, grow…) genuinely
 * compound instead of overwriting one transform. Only the OUTER span carries
 * data-fx (the full list), so it round-trips through the editor cleanly while
 * the inner spans are pure class carriers.
 *
 * Toggle/stack via the toolbar, or type {key}…{/key} (which tidyBodyHtml
 * normalises into the same nested-with-outer-list shape). Separate mark from
 * FontTag so a word can be a shaking chant.
 */
export const EffectTag = Mark.create({
  name: "effectTag",

  addAttributes() {
    return {
      fx: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-fx"),
        renderHTML: (attrs) => {
          const list = normalizeFxList(attrs.fx);
          return list.length ? { "data-fx": list.join(" ") } : {};
        },
      },
      grow: {
        default: null,
        parseHTML: (el) => {
          const node = el as HTMLElement;
          const list = normalizeFxList(node.getAttribute("data-fx"));
          if (!list.includes("grow")) return null;
          const fromStyle = node
            .getAttribute("style")
            ?.match(/--fx-grow-scale\s*:\s*([^;]+)/i)?.[1];
          return normalizeGrowScale(node.getAttribute("data-grow") ?? fromStyle);
        },
        renderHTML: (attrs) => {
          const list = normalizeFxList(attrs.fx);
          if (!list.includes("grow")) return {};
          const scale = normalizeGrowScale(attrs.grow);
          return {
            "data-grow": scale,
            style: `--fx-grow-scale: ${scale}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-fx]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const list = normalizeFxList(HTMLAttributes["data-fx"]);
    if (list.length === 0) return ["span", HTMLAttributes, 0];

    // Nest from the inside out; the content hole (0) sits deepest.
    let inner: DOMOutputSpec | 0 = 0;
    for (let i = list.length - 1; i >= 1; i--) {
      inner = ["span", { class: `fx-${list[i]}` }, inner];
    }
    return [
      "span",
      mergeAttributes(HTMLAttributes, { class: `fx-${list[0]}` }),
      inner,
    ];
  },
});
