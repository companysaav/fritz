import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Editor, Field, TextArea } from "@/app/studio/Editor";
import { ExportActions } from "@/app/studio/ExportActions";
import { saveNovel } from "@/app/studio/actions";
import { NotesPanel } from "@/app/studio/notes/NotesPanel";
import { NoteRollup, type RollupChapter } from "@/app/studio/notes/NoteRollup";
import { NOTE_COLUMNS, type Note } from "@/app/studio/notes/types";

const STATUSES = ["ongoing", "hiatus", "completed", "draft"];

export default async function EditNovel({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("novels")
    .select(
      "id, title, slug, tagline, synopsis, status, visibility, accent_color, featured, cover:cover_media_id(url)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const novel = data as unknown as {
    id: string;
    title: string;
    slug: string;
    tagline: string | null;
    synopsis: string | null;
    status: string;
    visibility: string;
    accent_color: string | null;
    featured: boolean;
    cover: { url: string | null } | null;
  };

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, title, number, status")
    .eq("novel_id", id)
    .order("number", { ascending: true });

  const chapterList = (chapters ?? []) as {
    id: string;
    title: string;
    number: number | null;
    status: string;
  }[];

  // The novel's own notes, plus every chapter's notes rolled up into one digest.
  const chapterIds = chapterList.map((c) => c.id);
  const [{ data: novelNotes }, { data: chNotes }] = await Promise.all([
    supabase
      .from("notes")
      .select(NOTE_COLUMNS)
      .eq("subject_type", "novel")
      .eq("subject_id", id)
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false }),
    chapterIds.length
      ? supabase
          .from("notes")
          .select(NOTE_COLUMNS)
          .eq("subject_type", "chapter")
          .in("subject_id", chapterIds)
          .order("pinned", { ascending: false })
          .order("updated_at", { ascending: false })
      : Promise.resolve({ data: [] as Note[] }),
  ]);

  const notesByChapter = new Map<string, Note[]>();
  for (const n of (chNotes ?? []) as Note[]) {
    const arr = notesByChapter.get(n.subject_id) ?? [];
    arr.push(n);
    notesByChapter.set(n.subject_id, arr);
  }
  const rollup: RollupChapter[] = chapterList.map((c) => ({
    id: c.id,
    title: c.title,
    number: c.number,
    notes: notesByChapter.get(c.id) ?? [],
  }));

  return (
    <>
      <Editor
        action={saveNovel}
        id={novel.id}
        title={novel.title}
        slug={novel.slug}
        hideStatus
        hideBody
      >
        <ExportActions href={`/studio/export/novels/${novel.id}`} />
        <Field
          label="cover image url"
          name="cover_url"
          defaultValue={novel.cover?.url ?? ""}
        />
        <Field label="tagline" name="tagline" defaultValue={novel.tagline ?? ""} />
        <TextArea
          label="synopsis"
          name="synopsis"
          defaultValue={novel.synopsis ?? ""}
        />
        <Field
          label="accent colour"
          name="accent_color"
          defaultValue={novel.accent_color ?? ""}
        />
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
            story status
          </span>
          <select
            name="status"
            defaultValue={novel.status}
            className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <input
            type="checkbox"
            name="published"
            defaultChecked={novel.visibility === "published"}
          />{" "}
          publish (list publicly)
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <input type="checkbox" name="featured" defaultChecked={novel.featured} />{" "}
          feature on homepage
        </label>
      </Editor>

      <NotesPanel
        subjectType="novel"
        subjectId={novel.id}
        initialNotes={(novelNotes ?? []) as Note[]}
      />

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl lowercase text-ink">chapters</h2>
          <Link
            href={`/studio/novels/${id}/chapters/new`}
            className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper hover:bg-ember"
          >
            + new chapter
          </Link>
        </div>
        <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
          {chapterList.length === 0 && (
            <li className="px-5 py-4 text-sm text-muted">no chapters yet.</li>
          )}
          {chapterList.map((c) => (
            <li key={c.id} className="px-5 py-4">
              <Link
                href={`/studio/chapters/${c.id}`}
                className="font-semibold text-ink hover:text-ember"
              >
                <span className="text-muted">{c.number ?? "•"}</span> {c.title}{" "}
                <span className="text-xs text-muted">({c.status})</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <NoteRollup chapters={rollup} />
    </>
  );
}
