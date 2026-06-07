import Link from "next/link";

import { Mascot } from "./Mascot";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-paper-2">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-5 py-12 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Mascot size={48} className="text-ink" />
          <div>
            <Wordmark size="text-xl" />
            <p className="mt-1 text-sm text-muted">stories, told properly.</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink-soft">
          <Link href="/novels" className="hover:text-ember">
            Novels
          </Link>
          <Link href="/writing" className="hover:text-ember">
            Writing
          </Link>
          <Link href="/about" className="hover:text-ember">
            About
          </Link>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-muted">
          © {new Date().getFullYear()} fritz — curled up somewhere warm, writing.
        </p>
      </div>
    </footer>
  );
}
