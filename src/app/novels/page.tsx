import type { Metadata } from "next";

import { getNovels } from "@/lib/queries";
import { NovelCard } from "@/components/cards/NovelCard";
import { MascotEyes } from "@/components/site/Mascot";

export const metadata: Metadata = { title: "Novels" };

export default async function NovelsPage() {
  const novels = await getNovels();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="mb-12 max-w-2xl">
        <h1 className="font-display text-5xl lowercase text-ink">novels</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Long stories, released a chapter at a time. Read with the lights low.
        </p>
      </header>

      {novels.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-line py-24 text-center">
          <MascotEyes className="h-8 w-16" />
          <p className="text-muted">no novels yet — the first one is brewing.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {novels.map((novel) => (
            <NovelCard key={novel.slug} novel={novel} />
          ))}
        </div>
      )}
    </div>
  );
}
