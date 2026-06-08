import Link from "next/link";

import type { Note } from "./types";

const HEX: Record<string, string> = {
  gold: "#9a7300",
  ember: "#bf3a1d",
  frost: "#1f6f8b",
  void: "#6b3fa0",
  jade: "#2f7d4f",
  rose: "#b0306a",
  ash: "#6b5d4f",
};

export type RollupChapter = {
  id: string;
  title: string;
  number: number | null;
  notes: Note[];
};

/**
 * Read-only digest of every chapter's notes for a novel — so thoughts scattered
 * across chapters become one surface. Each line deep-links to its chapter editor.
 */
export function NoteRollup({ chapters }: { chapters: RollupChapter[] }) {
  const withNotes = chapters.filter((c) => c.notes.length > 0);
  if (withNotes.length === 0) return null;

  const total = withNotes.reduce((n, c) => n + c.notes.length, 0);

  return (
    <section className="mx-auto max-w-5xl px-5 pb-20">
      <div className="mb-4">
        <h2 className="font-display text-2xl lowercase text-ink">
          notes across chapters
        </h2>
        <p className="text-sm text-muted">
          {total} note{total === 1 ? "" : "s"} scattered through the chapters —
          gathered here so nothing slips through.
        </p>
      </div>

      <div className="space-y-5">
        {withNotes.map((c) => (
          <div key={c.id}>
            <Link
              href={`/studio/chapters/${c.id}`}
              className="font-sans text-sm font-bold text-ink hover:text-ember"
            >
              <span className="text-muted">{c.number ?? "•"}</span> {c.title}
              <span className="ml-1 text-xs font-normal text-muted">
                ({c.notes.length})
              </span>
            </Link>
            <ul className="mt-2 space-y-2">
              {c.notes.map((n) => {
                const spine = n.color ? HEX[n.color] : null;
                return (
                  <li
                    key={n.id}
                    className="rounded-xl border border-line bg-paper px-4 py-3"
                    style={spine ? { borderLeft: `3px solid ${spine}` } : undefined}
                  >
                    {n.title && (
                      <p className="font-sans text-sm font-bold text-ink">
                        {n.title}
                      </p>
                    )}
                    {n.anchor_text && (
                      <p className="line-clamp-1 border-l-2 border-mustard pl-2 font-body text-xs italic text-muted">
                        “{n.anchor_text}”
                      </p>
                    )}
                    {n.body && (
                      <p className="line-clamp-2 whitespace-pre-wrap font-body text-sm text-ink-soft">
                        {n.body}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
