import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { asDoc } from "@/lib/content/types";
import { blocksToHtml } from "@/lib/content/blocksToHtml";
import { createClient } from "@/lib/supabase/server";
import { Editor, Field, TextArea } from "@/app/studio/Editor";
import { ImageDropzone } from "@/app/studio/ImageDropzone";
import { saveChapter } from "@/app/studio/actions";
import { NotesPanel } from "@/app/studio/notes/NotesPanel";
import { NOTE_COLUMNS, type Note } from "@/app/studio/notes/types";

export default async function EditChapter({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("chapters")
    .select(
      "id, novel_id, title, slug, number, status, body, author_note, soundtrack, hero:hero_media_id(url)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const ch = data as unknown as {
    id: string;
    novel_id: string;
    title: string;
    slug: string;
    number: number | null;
    status: string;
    body: { html?: string } | null;
    author_note: string | null;
    soundtrack: { youtube?: string }[] | null;
    hero: { url: string | null } | null;
  };
  const youtube = Array.isArray(ch.soundtrack)
    ? (ch.soundtrack[0]?.youtube ?? "")
    : "";

  const { data: notes } = await supabase
    .from("notes")
    .select(NOTE_COLUMNS)
    .eq("subject_type", "chapter")
    .eq("subject_id", ch.id)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  return (
    <>
    <Editor
      action={saveChapter}
      id={ch.id}
      novelId={ch.novel_id}
      title={ch.title}
      slug={ch.slug}
      status={ch.status}
      body={ch.body?.html ?? blocksToHtml(asDoc(ch.body).blocks)}
      dropcap
      anchors
    >
      <Field
        label="chapter number"
        name="number"
        defaultValue={ch.number != null ? String(ch.number) : ""}
      />
      <ImageDropzone
        label="hero image"
        name="hero_url"
        defaultValue={ch.hero?.url ?? ""}
        kind="chapter-hero"
      />
      <Field
        label="ambience (youtube id)"
        name="soundtrack_youtube"
        defaultValue={youtube}
      />
      <TextArea
        label="author note (from fritz)"
        name="author_note"
        defaultValue={ch.author_note ?? ""}
      />
      <Field
        label="reschedule (optional)"
        name="publish_at"
        type="datetime-local"
      />
    </Editor>
    <NotesPanel
      subjectType="chapter"
      subjectId={ch.id}
      initialNotes={(notes ?? []) as Note[]}
      anchors
    />
    </>
  );
}
