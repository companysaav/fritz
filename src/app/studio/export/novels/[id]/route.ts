import { requireAdmin } from "@/lib/auth";
import {
  bodyToPlainText,
  txtFilename,
  txtResponse,
} from "@/lib/content/exportText";
import { createClient } from "@/lib/supabase/server";

type NovelExport = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  synopsis: string | null;
};

type ChapterExport = {
  id: string;
  number: number | null;
  title: string;
  body: unknown;
  author_note: string | null;
};

function chapterHeading(chapter: ChapterExport, index: number): string {
  const number = chapter.number ?? index + 1;
  return `Chapter ${number}: ${chapter.title}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: novel } = await supabase
    .from("novels")
    .select("id, title, slug, tagline, synopsis")
    .eq("id", id)
    .maybeSingle();

  if (!novel) return new Response("Novel not found.", { status: 404 });

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, number, title, body, author_note")
    .eq("novel_id", id)
    .order("number", { ascending: true })
    .order("created_at", { ascending: true });

  const n = novel as NovelExport;
  const chapterList = (chapters ?? []) as ChapterExport[];
  const header = [
    n.title,
    n.tagline,
    n.synopsis ? `Synopsis\n${n.synopsis}` : null,
  ].filter(Boolean);

  const chapterText =
    chapterList.length > 0
      ? chapterList.map((chapter, index) => {
          const body = bodyToPlainText(chapter.body);
          return [
            chapterHeading(chapter, index),
            body,
            chapter.author_note ? `Author note\n${chapter.author_note}` : null,
          ]
            .filter(Boolean)
            .join("\n\n");
        })
      : ["No chapters yet."];

  return txtResponse(
    txtFilename(n.slug || n.title, "novel"),
    [...header, ...chapterText].join("\n\n---\n\n"),
  );
}
