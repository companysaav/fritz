import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Editor, Field, TextArea } from "@/app/studio/Editor";
import { saveNovel } from "@/app/studio/actions";

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
          {(chapters ?? []).length === 0 && (
            <li className="px-5 py-4 text-sm text-muted">no chapters yet.</li>
          )}
          {(
            (chapters ?? []) as {
              id: string;
              title: string;
              number: number | null;
              status: string;
            }[]
          ).map((c) => (
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
    </>
  );
}
