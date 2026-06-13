import { slugify } from "@/lib/slug";
import { tidyBodyHtml } from "./sanitizeHtml";
import { asDoc, bodyHtml, type Block } from "./types";

const ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|\w+);/gi, (match, entity: string) => {
    const key = entity.toLowerCase();
    if (key[0] === "#") {
      const base = key[1] === "x" ? 16 : 10;
      const raw = key[1] === "x" ? key.slice(2) : key.slice(1);
      const code = Number.parseInt(raw, base);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match;
    }
    return ENTITIES[key] ?? match;
  });
}

function cleanLines(text: string): string {
  return decodeHtmlEntities(text)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inlineMarkupToText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\[([^\]]+)\](?:\s*\{\w+\})?/g, "[$1]")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

function blockToText(block: Block): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "aside":
      return inlineMarkupToText(block.text);
    case "quote":
      return `> ${inlineMarkupToText(block.text)}${
        block.cite ? `\n> - ${block.cite}` : ""
      }`;
    case "callout":
      return [block.title, inlineMarkupToText(block.text)].filter(Boolean).join("\n");
    case "image":
      return `[Image: ${block.alt || block.caption || block.src}]`;
    case "youtube":
      return `[YouTube: ${block.caption || block.id}]`;
    case "audio":
      return `[Audio: ${block.title || block.src}]`;
    case "divider":
      return "***";
    default:
      return "";
  }
}

export function htmlToPlainText(html: string): string {
  const text = tidyBodyHtml(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/gi, "\n$1\n")
    .replace(/<img\b[^>]*\balt="([^"]*)"[^>]*>/gi, "\n[Image: $1]\n")
    .replace(/<img\b[^>]*>/gi, "\n[Image]\n")
    .replace(/<iframe\b[^>]*\bsrc="([^"]*)"[^>]*><\/iframe>/gi, "\n[Media: $1]\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n\n***\n\n")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|h[1-6]|blockquote|li|ul|ol|figure|aside)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");
  return cleanLines(text);
}

export function bodyToPlainText(body: unknown): string {
  const html = bodyHtml(body);
  if (html) return htmlToPlainText(html);
  return cleanLines(asDoc(body).blocks.map(blockToText).filter(Boolean).join("\n\n"));
}

export function txtFilename(title: string, fallback: string): string {
  return `${slugify(title) || fallback}.txt`;
}

export function txtResponse(filename: string, text: string): Response {
  return new Response(`${cleanLines(text)}\n`, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
