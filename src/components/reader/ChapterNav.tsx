import Link from "next/link";

type Stub = { slug: string; title: string } | null;

export function ChapterNav({
  novelSlug,
  prev,
  next,
}: {
  novelSlug: string;
  prev: Stub;
  next: Stub;
}) {
  return (
    <nav className="mt-16 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/novels/${novelSlug}/${prev.slug}`}
          className="rounded-2xl border border-line bg-paper p-5 transition-colors hover:border-ink"
        >
          <span className="text-xs font-bold uppercase tracking-wide text-muted">
            ← Previous
          </span>
          <p className="mt-1 font-display text-lg lowercase text-ink">
            {prev.title}
          </p>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/novels/${novelSlug}/${next.slug}`}
          className="rounded-2xl border border-line bg-paper p-5 text-right transition-colors hover:border-ink"
        >
          <span className="text-xs font-bold uppercase tracking-wide text-muted">
            Next →
          </span>
          <p className="mt-1 font-display text-lg lowercase text-ink">
            {next.title}
          </p>
        </Link>
      ) : (
        <Link
          href={`/novels/${novelSlug}`}
          className="rounded-2xl border-2 border-dashed border-mustard bg-mustard/10 p-5 text-right transition-colors hover:bg-mustard/20"
        >
          <span className="text-xs font-bold uppercase tracking-wide text-muted">
            You&apos;re all caught up
          </span>
          <p className="mt-1 font-display text-lg lowercase text-ink">
            back to contents
          </p>
        </Link>
      )}
    </nav>
  );
}
