import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { asDoc, bodyHtml } from "@/lib/content/types";
import { formatDate, readingTime } from "@/lib/format";
import { getPost } from "@/lib/queries";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { RichContent } from "@/components/content/RichContent";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.excerpt ?? post.dek ?? undefined };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <Link
        href="/writing"
        className="text-sm font-bold text-ember hover:underline"
      >
        ← writing
      </Link>

      <header className="mt-6 mb-10">
        <h1 className="font-display text-4xl lowercase leading-tight text-ink sm:text-5xl">
          {post.title}
        </h1>
        {post.dek && <p className="mt-4 text-xl text-ink-soft">{post.dek}</p>}
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
          {formatDate(post.published_at)} ·{" "}
          {readingTime(post.reading_time_minutes)}
        </p>
      </header>

      {post.cover?.url && (
        <Image
          src={post.cover.url}
          alt={post.cover.alt ?? post.title}
          width={1600}
          height={900}
          priority
          className="mb-10 w-full rounded-2xl border border-line object-cover"
        />
      )}

      {bodyHtml(post.body) ? (
        <RichContent html={bodyHtml(post.body)!} />
      ) : (
        <BlockRenderer doc={asDoc(post.body)} />
      )}
    </article>
  );
}
