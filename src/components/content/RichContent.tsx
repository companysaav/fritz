/**
 * Renders the WYSIWYG (TipTap) HTML body authored in the Studio. Authoring is
 * admin-only, so the HTML is trusted. Styled by `.prose-fritz` in globals.css,
 * which also gives any inline-coloured run its bleed-through glow.
 */
import { FRITZ_INLINE_SVG } from "@/components/site/InlineFritz";
import { tidyBodyHtml } from "@/lib/content/sanitizeHtml";

export function RichContent({
  html,
  dropcap = false,
}: {
  html: string;
  dropcap?: boolean;
}) {
  // Normalise pasted fonts/sizes and resolve {key}…{/key} font tags — so even
  // older content stored with inline-font junk renders in one consistent face.
  const tidy = tidyBodyHtml(html);
  // Replace the editor's placeholder spans AND any literal {fritz} tokens
  // (pasted / legacy) with the real inline cat SVG.
  const withFritz = tidy
    .replace(/<span\b[^>]*\bdata-fritz\b[^>]*>\s*<\/span>/gi, FRITZ_INLINE_SVG)
    .replace(/\{fritz\}/gi, FRITZ_INLINE_SVG);
  return (
    <div
      className={`prose-fritz ${dropcap ? "dropcap" : ""}`}
      dangerouslySetInnerHTML={{ __html: withFritz }}
    />
  );
}
