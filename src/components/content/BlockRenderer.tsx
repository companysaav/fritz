import Image from "next/image";
import { Fragment, type ReactNode } from "react";

import type { Block, Doc } from "@/lib/content/types";
import { MascotEyes } from "@/components/site/Mascot";
import { InlineFritz } from "@/components/site/InlineFritz";

/** Allowed bleed-through tag colours (skills / classes / system text). */
const BLEED = new Set(["gold", "ember", "frost", "void", "jade", "rose", "ash"]);

/**
 * Inline formatter: **bold**, *italic*, [label](url) links, and the
 * "bleed-through" tags — [text] glows gold, [text]{frost} etc. for variants.
 */
function inline(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  const regex =
    /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)|\[([^\]]+)\](?:\s*\{(\w+)\})?|(\{[Ff]ritz\}))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2]) nodes.push(<strong key={k++}>{m[2]}</strong>);
    else if (m[3]) nodes.push(<em key={k++}>{m[3]}</em>);
    else if (m[4])
      nodes.push(
        <a key={k++} href={m[5]} target="_blank" rel="noopener noreferrer">
          {m[4]}
        </a>,
      );
    else if (m[6]) {
      const color = m[7] && BLEED.has(m[7]) ? m[7] : "gold";
      nodes.push(
        <span key={k++} className={`bleed-tag bleed-${color}`}>
          [{m[6]}]
        </span>,
      );
    } else if (m[8]) {
      nodes.push(<InlineFritz key={k++} />);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.map((n, i) => <Fragment key={i}>{n}</Fragment>);
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return <p>{inline(block.text)}</p>;

    case "heading": {
      const Tag = block.level === 3 ? "h3" : "h2";
      return (
        <Tag className="mt-12 mb-4 font-display text-2xl lowercase text-ink">
          {inline(block.text)}
        </Tag>
      );
    }

    case "image":
      return (
        <figure className="my-10 -mx-2 sm:-mx-8">
          <Image
            src={block.src}
            alt={block.alt ?? ""}
            width={1600}
            height={1000}
            sizes="(max-width: 768px) 100vw, 720px"
            className="w-full rounded-2xl border border-line object-cover"
          />
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm text-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "youtube":
      return (
        <figure className="my-10 -mx-2 sm:-mx-8">
          <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-ink">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${block.id}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm text-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "audio":
      return (
        <figure className="my-8 rounded-2xl border border-line bg-paper-2 p-4">
          {block.title && (
            <figcaption className="mb-2 text-sm font-semibold text-ink-soft">
              {block.title}
            </figcaption>
          )}
          <audio controls src={block.src} className="w-full" />
        </figure>
      );

    case "quote":
      return (
        <blockquote className="my-10 border-l-4 border-mustard pl-6">
          <p className="font-display text-2xl leading-snug text-ink">
            “{inline(block.text)}”
          </p>
          {block.cite && (
            <cite className="mt-2 block text-sm not-italic text-muted">
              — {block.cite}
            </cite>
          )}
        </blockquote>
      );

    case "callout":
      return (
        <aside
          className={`my-8 rounded-2xl border p-5 ${
            block.tone === "warn"
              ? "border-ember/40 bg-ember/10"
              : "border-line bg-paper-2"
          }`}
        >
          {block.title && (
            <p className="mb-1 font-semibold text-ink">{block.title}</p>
          )}
          <p className="text-ink-soft">{inline(block.text)}</p>
        </aside>
      );

    case "aside":
      // fritz, breaking the fourth wall
      return (
        <aside className="my-9 flex gap-4 rounded-2xl border-2 border-dashed border-mustard bg-mustard/10 p-5">
          <MascotEyes className="mt-1 h-6 w-12 shrink-0" />
          <p className="font-sans text-base italic text-ink-soft">
            {inline(block.text)}
          </p>
        </aside>
      );

    case "divider":
      return (
        <div className="my-12 flex items-center justify-center gap-3 text-mustard">
          <span className="h-px w-16 bg-line" />
          <MascotEyes className="h-4 w-8" />
          <span className="h-px w-16 bg-line" />
        </div>
      );

    default:
      return null;
  }
}

export function BlockRenderer({
  doc,
  dropcap = false,
}: {
  doc: Doc;
  dropcap?: boolean;
}) {
  return (
    <div className={`prose-fritz ${dropcap ? "dropcap" : ""}`}>
      {doc.blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
