import type { Block } from "./types";

/**
 * Converts the legacy block-document format into editor HTML, so content
 * written before the WYSIWYG switch (and seeded content) loads into the editor.
 * Old inline tags [skill]{color} become real coloured <span>s. One-way: on the
 * next save the body is stored as HTML.
 */
const HEX: Record<string, string> = {
  gold: "#9a7300",
  ember: "#bf3a1d",
  frost: "#1f6f8b",
  void: "#6b3fa0",
  jade: "#2f7d4f",
  rose: "#b0306a",
  ash: "#6b5d4f",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineToHtml(text: string): string {
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  const regex =
    /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)|\[([^\]]+)\](?:\s*\{(\w+)\})?)/g;
  while ((m = regex.exec(text))) {
    out += esc(text.slice(last, m.index));
    if (m[2]) out += `<strong>${esc(m[2])}</strong>`;
    else if (m[3]) out += `<em>${esc(m[3])}</em>`;
    else if (m[4]) out += `<a href="${esc(m[5])}">${esc(m[4])}</a>`;
    else if (m[6]) {
      const hex = (m[7] && HEX[m[7]]) || HEX.gold;
      out += `<span style="color: ${hex}">[${esc(m[6])}]</span>`;
    }
    last = m.index + m[0].length;
  }
  out += esc(text.slice(last));
  return out;
}

export function blocksToHtml(blocks: Block[]): string {
  if (!blocks?.length) return "";
  return blocks
    .map((b) => {
      switch (b.type) {
        case "paragraph":
          return `<p>${inlineToHtml(b.text)}</p>`;
        case "heading":
          return b.level === 3
            ? `<h3>${inlineToHtml(b.text)}</h3>`
            : `<h2>${inlineToHtml(b.text)}</h2>`;
        case "image":
          return `<img src="${esc(b.src)}" alt="${esc(b.alt ?? "")}">`;
        case "quote":
          return `<blockquote><p>${inlineToHtml(b.text)}${
            b.cite ? ` — ${esc(b.cite)}` : ""
          }</p></blockquote>`;
        case "callout":
        case "aside":
          return `<blockquote><p>${inlineToHtml(b.text)}</p></blockquote>`;
        case "youtube":
          return `<div data-youtube-video><iframe src="https://www.youtube.com/watch?v=${esc(
            b.id,
          )}"></iframe></div>`;
        case "audio":
          return `<p>♪ <a href="${esc(b.src)}">${esc(b.title ?? "audio")}</a></p>`;
        case "divider":
          return `<hr>`;
        default:
          return "";
      }
    })
    .join("");
}
