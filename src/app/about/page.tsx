import type { Metadata } from "next";

import { Mascot } from "@/components/site/Mascot";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <div className="mb-8 flex items-center gap-5">
        <Mascot size={84} className="text-ink" />
        <h1 className="font-display text-5xl lowercase text-ink">hello.</h1>
      </div>

      <div className="prose-fritz">
        <p>
          I&apos;m fritz. I keep this house. People leave stories here — long
          ones told a chapter at a time, short ones meant for a single sitting —
          and I make sure they&apos;re told <em>properly</em>.
        </p>
        <p>
          Most of the web treats writing like filler between the ads. Here it&apos;s
          the point. The pictures, the sound, the film — they come in only when
          they make the story bigger, and never when they don&apos;t.
        </p>
        <p>
          So: read slowly. Turn the ambience on if a chapter offers it. Come
          back when the next one drops — I&apos;ll have kept your place, and
          probably the warm chair too.
        </p>
        <p className="font-display text-2xl lowercase text-ember">— fritz</p>
      </div>
    </div>
  );
}
