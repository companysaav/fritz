import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { readingTime, readingTimeLong, wordCount } from "@/lib/format";
import { getNovel } from "@/lib/queries";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const novel = await getNovel(slug);
  if (!novel) return { title: "Not found" };
  return { title: novel.title, description: novel.tagline ?? undefined };
}

export default async function NovelPage({ params }: Params) {
  const { slug } = await params;
  const novel = await getNovel(slug);
  if (!novel) notFound();

  const accent = novel.accent_color ?? "var(--color-mustard)";

  const totalWords = novel.chapters.reduce((n, c) => n + (c.word_count ?? 0), 0);
  const totalMinutes = novel.chapters.reduce(
    (n, c) => n + (c.reading_time_minutes ?? 0),
    0,
  );

  return (
    <div>
      {/* banner */}
      <div className="border-b border-line bg-paper-2">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 py-14 sm:grid-cols-[200px_1fr] sm:items-center">
          {novel.cover?.url && (
            <Image
              src={novel.cover.url}
              alt={novel.cover.alt ?? novel.title}
              width={400}
              height={533}
              priority
              className="w-40 rounded-2xl border border-line object-cover shadow-[6px_6px_0_0_var(--color-ink)] sm:w-full"
            />
          )}
          <div>
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink"
              style={{ backgroundColor: accent }}
            >
              {novel.status ?? "ongoing"}
            </span>
            <h1 className="font-display text-4xl lowercase leading-tight text-ink sm:text-5xl">
              {novel.title}
            </h1>
            {novel.tagline && (
              <p className="mt-3 text-lg text-ink-soft">{novel.tagline}</p>
            )}
            {novel.chapters.length > 0 && (
              <p className="mt-4 text-sm font-semibold text-muted">
                {novel.chapters.length} chapter
                {novel.chapters.length === 1 ? "" : "s"}
                {totalWords > 0 && (
                  <>
                    {" · "}
                    {wordCount(totalWords)}
                    {" · "}
                    {readingTimeLong(totalMinutes)}
                  </>
                )}
              </p>
            )}
            {novel.chapters[0] && (
              <Link
                href={`/novels/${novel.slug}/${novel.chapters[0].slug}`}
                className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-ember"
              >
                Start reading →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 py-14">
        {novel.synopsis && (
          <div className="mb-12 space-y-4 font-body text-xl leading-relaxed text-ink-soft">
            {novel.synopsis.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}

        {/* contents */}
        <h2 className="mb-5 font-display text-2xl lowercase text-ink">contents</h2>
        <ol className="space-y-2">
          {novel.chapters.map((ch) => (
            <li key={ch.slug}>
              <Link
                href={`/novels/${novel.slug}/${ch.slug}`}
                className="flex items-baseline justify-between gap-4 rounded-xl border border-line bg-paper px-5 py-4 transition-colors hover:border-ink"
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-display text-lg text-muted">
                    {ch.number ?? "•"}
                  </span>
                  <span className="font-display text-lg lowercase text-ink">
                    {ch.title}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {ch.word_count ? `${wordCount(ch.word_count)} · ` : ""}
                  {readingTime(ch.reading_time_minutes)}
                </span>
              </Link>
            </li>
          ))}
        </ol>

        {/* cast */}
        {novel.characters.length > 0 && (
          <>
            <h2 className="mt-14 mb-5 font-display text-2xl lowercase text-ink">
              the cast
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {novel.characters.map((c) => (
                <div
                  key={c.slug}
                  className="flex gap-4 rounded-2xl border border-line bg-paper p-4"
                >
                  {c.portrait?.url && (
                    <Image
                      src={c.portrait.url}
                      alt={c.portrait.alt ?? c.name}
                      width={140}
                      height={140}
                      className="h-20 w-20 shrink-0 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-display text-lg lowercase text-ink">
                      {c.name}
                    </p>
                    {c.role && (
                      <p className="text-xs font-bold uppercase tracking-wide text-mustard">
                        {c.role}
                      </p>
                    )}
                    {c.bio && (
                      <p className="mt-1 text-sm text-ink-soft">{c.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
