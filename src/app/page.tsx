import Link from "next/link";

import { display } from "@/lib/fonts";
import { getFeaturedNovel, getPosts } from "@/lib/queries";
import { ButtonLink } from "@/components/ui/Button";
import { Mascot, MascotEyes } from "@/components/site/Mascot";
import { NovelCard } from "@/components/cards/NovelCard";
import { PostCard } from "@/components/cards/PostCard";
import { Subscribe } from "@/components/site/Subscribe";

export default async function Home() {
  const [novel, posts] = await Promise.all([getFeaturedNovel(), getPosts(3)]);

  return (
    <>
      {/* hero */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:pt-24">
        <div className="flex flex-col items-start gap-8">
          <span className="flex items-center gap-2 rounded-full border border-line bg-paper-2 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ink-soft">
            <MascotEyes className="h-3 w-6" /> a reading house
          </span>
          <h1
            className={`${display.className} max-w-4xl text-5xl leading-[0.95] lowercase text-ink sm:text-7xl`}
          >
            stories, told <span className="text-ember">properly</span>.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
            Serialized novels and essays where the words come first and the
            media — sound, picture, film — is woven in, not bolted on. Pull up a
            chair. fritz has been waiting.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/novels" variant="primary">
              Start the novel
            </ButtonLink>
            <ButtonLink href="/writing" variant="ghost">
              Read the writing
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* featured novel */}
      {novel && (
        <section className="border-y border-line bg-paper-2 py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-3xl lowercase text-ink">
                the novel
              </h2>
              <Link
                href="/novels"
                className="text-sm font-bold text-ember hover:underline"
              >
                all novels →
              </Link>
            </div>
            <NovelCard novel={novel} />
          </div>
        </section>
      )}

      {/* latest writing */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-3xl lowercase text-ink">
              latest writing
            </h2>
            <Link
              href="/writing"
              className="text-sm font-bold text-ember hover:underline"
            >
              everything →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* fritz aside */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="flex items-center gap-6 rounded-2xl border-2 border-dashed border-mustard bg-mustard/10 p-8">
          <Mascot size={72} className="shrink-0 text-ink" />
          <p className="font-display text-xl lowercase leading-snug text-ink">
            “a story you can hear, see and fall into. that&apos;s the whole
            idea.” <span className="text-muted">— fritz</span>
          </p>
        </div>
      </section>

      {/* subscribe */}
      <section className="mx-auto max-w-3xl px-5 pb-8">
        <Subscribe />
      </section>
    </>
  );
}
