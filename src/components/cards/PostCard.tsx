import Image from "next/image";
import Link from "next/link";

import { formatDate, readingTime } from "@/lib/format";

type Post = {
  slug: string;
  title: string;
  dek: string | null;
  excerpt: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  cover: { url: string | null; alt: string | null } | null;
};

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/writing/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--color-ink)]"
    >
      {post.cover?.url && (
        <div className="aspect-[16/10] overflow-hidden">
          <Image
            src={post.cover.url}
            alt={post.cover.alt ?? post.title}
            width={800}
            height={500}
            sizes="(max-width: 768px) 100vw, 380px"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl lowercase leading-tight text-ink">
          {post.title}
        </h3>
        {post.dek && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{post.dek}</p>
        )}
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
          {formatDate(post.published_at)} · {readingTime(post.reading_time_minutes)}
        </p>
      </div>
    </Link>
  );
}
