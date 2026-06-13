import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { wordCount } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { deleteItem } from "./actions";
import { ExportActions } from "./ExportActions";

type Row = {
  id: string;
  title: string;
  status?: string;
  visibility?: string;
  word_count?: number | null;
};

function WordTag({ count }: { count?: number | null }) {
  if (!count) return null;
  return (
    <span className="shrink-0 text-xs tabular-nums text-muted">
      {wordCount(count)}
    </span>
  );
}

function StatusPill({ value }: { value?: string }) {
  const live = value === "published";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
        live ? "bg-mustard text-ink" : "bg-paper-2 text-muted"
      }`}
    >
      {value ?? "draft"}
    </span>
  );
}

function DeleteButton({ table, id }: { table: string; id: string }) {
  return (
    <form action={deleteItem} className="inline">
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button className="text-xs font-bold text-muted hover:text-ember">
        delete
      </button>
    </form>
  );
}

export default async function StudioDashboard() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, status, word_count")
    .order("updated_at", { ascending: false });

  const { data: novels } = await supabase
    .from("novels")
    .select("id, title, visibility")
    .order("updated_at", { ascending: false });

  const novelList = (novels ?? []) as Row[];
  const chaptersByNovel: Record<string, Row[]> = {};
  const novelWords: Record<string, number> = {};
  for (const n of novelList) {
    const { data: chs } = await supabase
      .from("chapters")
      .select("id, title, status, number, word_count")
      .eq("novel_id", n.id)
      .order("number", { ascending: true });
    const list = (chs ?? []) as Row[];
    chaptersByNovel[n.id] = list;
    novelWords[n.id] = list.reduce((sum, c) => sum + (c.word_count ?? 0), 0);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-display text-4xl lowercase text-ink">the writing desk</h1>
      <p className="mt-2 text-ink-soft">Draft, edit, and publish. Pull up a chair.</p>

      {/* posts */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl lowercase text-ink">posts</h2>
          <Link
            href="/studio/posts/new"
            className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper hover:bg-ember"
          >
            + new post
          </Link>
        </div>
        <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
          {(posts ?? []).length === 0 && (
            <li className="px-5 py-4 text-sm text-muted">no posts yet.</li>
          )}
          {((posts ?? []) as Row[]).map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <Link
                href={`/studio/posts/${p.id}`}
                className="flex items-center gap-3 font-semibold text-ink hover:text-ember"
              >
                {p.title}
                <StatusPill value={p.status} />
              </Link>
              <div className="flex items-center gap-4">
                <WordTag count={p.word_count} />
                <ExportActions href={`/studio/export/posts/${p.id}`} compact />
                <DeleteButton table="posts" id={p.id} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* novels */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl lowercase text-ink">novels</h2>
          <Link
            href="/studio/novels/new"
            className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper hover:bg-ember"
          >
            + new novel
          </Link>
        </div>
        <div className="space-y-4">
          {novelList.length === 0 && (
            <p className="rounded-2xl border border-line bg-paper px-5 py-4 text-sm text-muted">
              no novels yet.
            </p>
          )}
          {novelList.map((n) => (
            <div key={n.id} className="rounded-2xl border border-line bg-paper p-5">
              <div className="flex items-center justify-between gap-4">
                <Link
                  href={`/studio/novels/${n.id}`}
                  className="flex items-center gap-3 font-display text-xl lowercase text-ink hover:text-ember"
                >
                  {n.title}
                  <StatusPill value={n.visibility} />
                </Link>
                <div className="flex items-center gap-4">
                  <WordTag count={novelWords[n.id]} />
                  <ExportActions href={`/studio/export/novels/${n.id}`} compact />
                  <Link
                    href={`/studio/novels/${n.id}/chapters/new`}
                    className="text-sm font-bold text-ember hover:underline"
                  >
                    + chapter
                  </Link>
                  <DeleteButton table="novels" id={n.id} />
                </div>
              </div>
              <ul className="mt-3 space-y-1 border-t border-line pt-3">
                {chaptersByNovel[n.id]?.length === 0 && (
                  <li className="text-sm text-muted">no chapters yet.</li>
                )}
                {chaptersByNovel[n.id]?.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <Link
                      href={`/studio/chapters/${c.id}`}
                      className="flex items-center gap-2 text-sm text-ink-soft hover:text-ember"
                    >
                      {c.title}
                      <StatusPill value={c.status} />
                    </Link>
                    <div className="flex items-center gap-4">
                      <WordTag count={c.word_count} />
                      <DeleteButton table="chapters" id={c.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
