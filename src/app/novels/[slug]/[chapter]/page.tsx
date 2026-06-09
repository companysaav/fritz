import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { asDoc, bodyHtml } from "@/lib/content/types";
import { readingTime, wordCount } from "@/lib/format";
import { getChapter } from "@/lib/queries";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { RichContent } from "@/components/content/RichContent";
import { ProseFX } from "@/components/content/ProseFX";
import { ChapterNav } from "@/components/reader/ChapterNav";
import { ReadingProgress } from "@/components/reader/ReadingProgress";
import { Soundtrack } from "@/components/reader/Soundtrack";

type Params = { params: Promise<{ slug: string; chapter: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, chapter } = await params;
  const data = await getChapter(slug, chapter);
  if (!data) return { title: "Not found" };
  return { title: `${data.chapter.title} · ${data.novel.title}` };
}

export default async function ChapterPage({ params }: Params) {
  const { slug, chapter } = await params;
  const data = await getChapter(slug, chapter);
  if (!data) notFound();

  const { novel, chapter: ch, prev, next, position, total } = data;
  const tracks = Array.isArray(ch.soundtrack)
    ? (ch.soundtrack as { youtube?: string; title?: string }[])
    : [];

  return (
    <>
      <ReadingProgress />
      <Soundtrack tracks={tracks} />

      <article className="mx-auto max-w-2xl px-5 py-14">
        <Link
          href={`/novels/${novel.slug}`}
          className="text-sm font-bold text-ember hover:underline"
        >
          ← {novel.title}
        </Link>

        <header className="mt-8 mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            Chapter {ch.number ?? position} of {total}
            {ch.word_count ? ` · ${wordCount(ch.word_count)}` : ""} ·{" "}
            {readingTime(ch.reading_time_minutes)}
          </p>
          <h1 className="mt-3 font-display text-4xl lowercase leading-tight text-ink sm:text-5xl">
            {ch.title}
          </h1>
        </header>

        {ch.hero?.url && (
          <Image
            src={ch.hero.url}
            alt={ch.hero.alt ?? ch.title}
            width={1400}
            height={800}
            priority
            className="mb-12 w-full rounded-2xl border border-line object-cover"
          />
        )}

        {bodyHtml(ch.body) ? (
          <RichContent html={bodyHtml(ch.body)!} dropcap />
        ) : (
          <BlockRenderer doc={asDoc(ch.body)} dropcap />
        )}
        <ProseFX />

        {ch.author_note && (
          <aside className="mt-12 rounded-2xl border border-line bg-paper-2 p-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-mustard">
              from fritz
            </p>
            <p className="font-body italic text-ink-soft">{ch.author_note}</p>
          </aside>
        )}

        <ChapterNav
          novelSlug={novel.slug}
          prev={prev ? { slug: prev.slug, title: prev.title } : null}
          next={next ? { slug: next.slug, title: next.title } : null}
        />
      </article>
    </>
  );
}
