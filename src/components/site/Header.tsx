import Link from "next/link";

import { Wordmark } from "./Wordmark";

const nav = [
  { href: "/novels", label: "Novels" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Wordmark />
        <nav className="flex items-center gap-1 text-sm font-semibold">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-ink-soft transition-colors hover:bg-ink hover:text-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
