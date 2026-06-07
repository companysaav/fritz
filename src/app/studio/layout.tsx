import type { Metadata } from "next";
import Link from "next/link";

import { display } from "@/lib/fonts";

export const metadata: Metadata = { title: "Studio" };

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      <div className="border-b border-line bg-ink text-paper">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link
            href="/studio"
            className={`${display.className} lowercase text-lg text-paper`}
          >
            fritz studio
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/" className="text-paper/70 hover:text-mustard">
              view site ↗
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-paper/70 hover:text-ember">sign out</button>
            </form>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
