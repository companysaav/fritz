import Link from "next/link";

import { Mascot } from "@/components/site/Mascot";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-32 text-center">
      <Mascot size={120} className="text-ink" />
      <h1 className="mt-6 font-display text-5xl lowercase text-ink">
        4 — oh — 4
      </h1>
      <p className="mt-3 text-lg text-ink-soft">
        fritz looked everywhere. This page isn&apos;t here.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-ember"
      >
        back to the front door
      </Link>
    </div>
  );
}
