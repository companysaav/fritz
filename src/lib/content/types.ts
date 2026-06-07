/**
 * The block-document shape stored in posts.body / chapters.body (JSONB).
 * Keep it small and explicit — the BlockRenderer switches on `type`.
 */
export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level?: 2 | 3; text: string }
  | { type: "image"; src: string; alt?: string; caption?: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; tone?: "note" | "warn"; title?: string; text: string }
  | { type: "aside"; text: string } // fritz the cat, interjecting
  | { type: "youtube"; id: string; caption?: string }
  | { type: "audio"; src: string; title?: string }
  | { type: "divider" };

export type Doc = { blocks: Block[] };

/** Rich (WYSIWYG) bodies store HTML at body.html; older bodies use blocks. */
export function bodyHtml(body: unknown): string | null {
  if (
    body &&
    typeof body === "object" &&
    typeof (body as { html?: unknown }).html === "string"
  ) {
    return (body as { html: string }).html;
  }
  return null;
}

export function asDoc(body: unknown): Doc {
  if (
    body &&
    typeof body === "object" &&
    Array.isArray((body as { blocks?: unknown }).blocks)
  ) {
    return body as Doc;
  }
  return { blocks: [] };
}
