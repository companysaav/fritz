import {
  Node,
  mergeAttributes,
  nodeInputRule,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";

import { InlineFritz } from "@/components/site/InlineFritz";

/**
 * Inline fritz: typing {fritz} (any case) becomes the cat. Shows the real
 * coloured face live in the editor (React node-view) and serializes to
 * <span data-fritz>, which RichContent turns into the inline SVG on the page.
 */
function FritzNodeView() {
  return (
    <NodeViewWrapper as="span" className="fritz-nodeview" contentEditable={false}>
      <InlineFritz />
    </NodeViewWrapper>
  );
}

export const FritzInline = Node.create({
  name: "fritz",
  inline: true,
  group: "inline",
  atom: true,
  selectable: false,

  parseHTML() {
    return [{ tag: "span[data-fritz]" }];
  },

  renderHTML() {
    return [
      "span",
      mergeAttributes({
        "data-fritz": "",
        class: "fritz-inline",
        "aria-label": "fritz",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FritzNodeView);
  },

  addInputRules() {
    return [nodeInputRule({ find: /\{fritz\}$/i, type: this.type })];
  },
});
