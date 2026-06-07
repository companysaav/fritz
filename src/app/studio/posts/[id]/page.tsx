import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { asDoc } from "@/lib/content/types";
import { blocksToHtml } from "@/lib/content/blocksToHtml";
import { createClient } from "@/lib/supabase/server";
import { Editor, Field } from "@/app/studio/Editor";
import { savePost } from "@/app/studio/actions";

export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, dek, status, body, featured, cover:cover_media_id(url)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const post = data as unknown as {
    id: string;
    title: string;
    slug: string;
    dek: string | null;
    status: string;
    body: { html?: string } | null;
    featured: boolean;
    cover: { url: string | null } | null;
  };

  return (
    <Editor
      action={savePost}
      id={post.id}
      title={post.title}
      slug={post.slug}
      status={post.status}
      body={post.body?.html ?? blocksToHtml(asDoc(post.body).blocks)}
    >
      <Field
        label="cover image url"
        name="cover_url"
        defaultValue={post.cover?.url ?? ""}
      />
      <Field label="subtitle / dek" name="dek" defaultValue={post.dek ?? ""} />
      <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
        <input type="checkbox" name="featured" defaultChecked={post.featured} />{" "}
        feature on homepage
      </label>
      <Field
        label="reschedule (optional)"
        name="publish_at"
        type="datetime-local"
      />
    </Editor>
  );
}
