/**
 * Renders the WYSIWYG (TipTap) HTML body authored in the Studio. Authoring is
 * admin-only, so the HTML is trusted. Styled by `.prose-fritz` in globals.css,
 * which also gives any inline-coloured run its bleed-through glow.
 */
export function RichContent({
  html,
  dropcap = false,
}: {
  html: string;
  dropcap?: boolean;
}) {
  return (
    <div
      className={`prose-fritz ${dropcap ? "dropcap" : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
