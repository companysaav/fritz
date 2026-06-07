import Image from "next/image";
import Link from "next/link";

type Novel = {
  slug: string;
  title: string;
  tagline: string | null;
  status: string | null;
  accent_color: string | null;
  cover: { url: string | null; alt: string | null } | null;
};

export function NovelCard({ novel }: { novel: Novel }) {
  return (
    <Link
      href={`/novels/${novel.slug}`}
      className="group flex gap-5 rounded-2xl border border-line bg-paper p-4 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--color-ink)]"
    >
      {novel.cover?.url && (
        <div className="aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={novel.cover.url}
            alt={novel.cover.alt ?? novel.title}
            width={300}
            height={400}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-col justify-center">
        <span
          className="mb-2 w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink"
          style={{ backgroundColor: novel.accent_color ?? "var(--color-mustard)" }}
        >
          {novel.status ?? "ongoing"}
        </span>
        <h3 className="font-display text-2xl lowercase leading-tight text-ink">
          {novel.title}
        </h3>
        {novel.tagline && (
          <p className="mt-2 text-sm text-ink-soft">{novel.tagline}</p>
        )}
      </div>
    </Link>
  );
}
