import { requireAdmin } from "@/lib/auth";
import {
  bodyToPlainText,
  txtFilename,
  txtResponse,
} from "@/lib/content/exportText";
import { createClient } from "@/lib/supabase/server";

type PostExport = {
  id: string;
  title: string;
  slug: string;
  dek: string | null;
  excerpt: string | null;
  body: unknown;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, dek, excerpt, body")
    .eq("id", id)
    .maybeSingle();

  if (!data) return new Response("Post not found.", { status: 404 });

  const post = data as PostExport;
  const parts = [
    post.title,
    post.dek,
    bodyToPlainText(post.body) || post.excerpt,
  ].filter(Boolean);

  return txtResponse(txtFilename(post.slug || post.title, "post"), parts.join("\n\n"));
}
