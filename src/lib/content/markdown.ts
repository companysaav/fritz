import type { Block } from "./types";

/**
 * Compiles the Studio's writing syntax into content blocks.
 *
 *   ## heading            -> heading (h2)        ### -> h3
 *   > a quote — a source  -> quote (em-dash sets the citation)
 *   ![caption](url)       -> image
 *   @youtube <id> | cap   -> youtube embed
 *   @audio <url> | title  -> audio player
 *   ::: aside text :::     -> fritz aside (also: note / warn for callouts)
 *   ---                   -> divider
 *   anything else         -> paragraph (blank line separates paragraphs)
 *
 * Inline **bold**, *italic*, [links](url) are handled by the renderer.
 */
export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = (src ?? "").replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];
  let i = 0;

  const flush = () => {
    if (para.length) {
      blocks.push({ type: "paragraph", text: para.join(" ").trim() });
      para = [];
    }
  };

  while (i < lines.length) {
    const t = lines[i].trim();

    if (t === "") {
      flush();
      i++;
      continue;
    }
    if (t === "---") {
      flush();
      blocks.push({ type: "divider" });
      i++;
      continue;
    }
    if (t.startsWith("### ")) {
      flush();
      blocks.push({ type: "heading", level: 3, text: t.slice(4) });
      i++;
      continue;
    }
    if (t.startsWith("## ")) {
      flush();
      blocks.push({ type: "heading", level: 2, text: t.slice(3) });
      i++;
      continue;
    }

    let m = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (m) {
      flush();
      blocks.push({
        type: "image",
        src: m[2],
        alt: m[1],
        caption: m[1] || undefined,
      });
      i++;
      continue;
    }

    m = t.match(/^@youtube\s+(\S+)(?:\s*\|\s*(.+))?$/i);
    if (m) {
      flush();
      blocks.push({ type: "youtube", id: m[1], caption: m[2]?.trim() });
      i++;
      continue;
    }

    m = t.match(/^@audio\s+(\S+)(?:\s*\|\s*(.+))?$/i);
    if (m) {
      flush();
      blocks.push({ type: "audio", src: m[1], title: m[2]?.trim() });
      i++;
      continue;
    }

    if (t.startsWith(">")) {
      flush();
      const q: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        q.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      let text = q.join(" ").trim();
      let cite: string | undefined;
      const parts = text.split(/\s+—\s+/);
      if (parts.length > 1) {
        cite = parts.pop();
        text = parts.join(" — ");
      }
      blocks.push({ type: "quote", text, cite });
      continue;
    }

    m = t.match(/^:::\s*(aside|note|warn)\b\s*(.*)$/i);
    if (m) {
      flush();
      const kind = m[1].toLowerCase();
      const buf: string[] = [];
      let rest = m[2];
      const closedInline = rest.endsWith(":::");
      if (closedInline) rest = rest.slice(0, -3).trim();
      if (rest) buf.push(rest);
      if (!closedInline) {
        i++;
        while (i < lines.length && lines[i].trim() !== ":::") {
          buf.push(lines[i]);
          i++;
        }
      }
      i++;
      const text = buf.join(" ").trim();
      if (kind === "aside") blocks.push({ type: "aside", text });
      else
        blocks.push({
          type: "callout",
          tone: kind === "warn" ? "warn" : "note",
          text,
        });
      continue;
    }

    para.push(t);
    i++;
  }

  flush();
  return blocks;
}

/** Flatten block text for full-text search + word counting. */
export function blocksToPlainText(blocks: Block[]): string {
  return blocks
    .map((b) => ("text" in b ? b.text : "caption" in b ? (b.caption ?? "") : ""))
    .join(" ")
    .trim();
}

export function contentStats(blocks: Block[]) {
  const text = blocksToPlainText(blocks);
  const words = text ? text.split(/\s+/).length : 0;
  return {
    plain_text: text,
    word_count: words,
    reading_time_minutes: Math.max(1, Math.round(words / 220)),
  };
}
