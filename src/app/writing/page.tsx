import type { Metadata } from "next";

import { getPosts } from "@/lib/queries";
import { PostCard } from "@/components/cards/PostCard";
import { MascotEyes } from "@/components/site/Mascot";

export const metadata: Metadata = { title: "Writing" };

export default async function WritingPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <header className="mb-12 max-w-2xl">
        <h1 className="font-display text-5xl lowercase text-ink">writing</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Essays, notes from the desk, and the occasional thinking-out-loud.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-line py-24 text-center">
          <MascotEyes className="h-8 w-16" />
          <p className="text-muted">nothing written yet — fritz is sharpening a pencil.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
