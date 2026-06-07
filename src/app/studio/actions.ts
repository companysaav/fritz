"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";

type DB = ReturnType<typeof createAdminClient>;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const has = (f: FormData, k: string) => f.get(k) != null;

/**
 * Status + (optional) scheduled publish time. A future `publish_at` marks the
 * row published with a future published_at; RLS hides it until that moment, and
 * since pages are server-rendered per request it goes live on its own — no cron.
 */
function scheduleFields(formData: FormData): {
  status: string;
  published_at?: string;
} {
  const publishAt = str(formData, "publish_at");
  if (publishAt) {
    const d = new Date(publishAt);
    if (!isNaN(d.getTime()))
      return { status: "published", published_at: d.toISOString() };
  }
  return { status: str(formData, "status") || "draft" };
}

/** Store the WYSIWYG HTML body + derive search/stat fields from its text. */
function buildBody(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return {
    body: { html },
    plain_text: text,
    word_count: words,
    reading_time_minutes: Math.max(1, Math.round(words / 220)),
  };
}

/** Reuse a media row for a given URL, or create one. Avoids cover duplication. */
async function mediaIdForUrl(db: DB, url: string, alt: string) {
  if (!url) return null;
  const { data } = await db
    .from("media_assets")
    .select("id")
    .eq("url", url)
    .limit(1)
    .maybeSingle();
  if (data) return (data as { id: string }).id;
  const { data: ins } = await db
    .from("media_assets")
    .insert({ type: "image", url, external_url: url, alt })
    .select("id")
    .single();
  return ins ? (ins as { id: string }).id : null;
}

export async function savePost(formData: FormData) {
  await requireAdmin();
  const db = createAdminClient();

  const id = str(formData, "id");
  const title = str(formData, "title") || "Untitled";
  const slug = slugify(str(formData, "slug") || title);
  const dek = str(formData, "dek") || null;
  const coverUrl = str(formData, "cover_url");

  const payload = {
    title,
    slug,
    dek,
    excerpt: str(formData, "excerpt") || dek,
    featured: has(formData, "featured"),
    cover_media_id: await mediaIdForUrl(db, coverUrl, title),
    ...scheduleFields(formData),
    ...buildBody(str(formData, "body_html")),
  };

  if (id) await db.from("posts").update(payload).eq("id", id);
  else await db.from("posts").insert(payload);

  revalidatePath("/");
  revalidatePath("/writing");
  redirect("/studio");
}

export async function saveNovel(formData: FormData) {
  await requireAdmin();
  const db = createAdminClient();

  const id = str(formData, "id");
  const title = str(formData, "title") || "Untitled";
  const slug = slugify(str(formData, "slug") || title);
  const coverUrl = str(formData, "cover_url");

  const payload = {
    title,
    slug,
    tagline: str(formData, "tagline") || null,
    synopsis: str(formData, "synopsis") || null,
    status: str(formData, "status") || "ongoing",
    visibility: has(formData, "published") ? "published" : "draft",
    accent_color: str(formData, "accent_color") || null,
    featured: has(formData, "featured"),
    cover_media_id: await mediaIdForUrl(db, coverUrl, title),
  };

  if (id) await db.from("novels").update(payload).eq("id", id);
  else await db.from("novels").insert(payload);

  revalidatePath("/");
  revalidatePath("/novels");
  redirect("/studio");
}

export async function saveChapter(formData: FormData) {
  await requireAdmin();
  const db = createAdminClient();

  const id = str(formData, "id");
  const novelId = str(formData, "novel_id");
  const title = str(formData, "title") || "Untitled";
  const slug = slugify(str(formData, "slug") || title);
  const numberRaw = str(formData, "number");
  const heroUrl = str(formData, "hero_url");
  const youtube = str(formData, "soundtrack_youtube");

  const payload = {
    novel_id: novelId,
    title,
    slug,
    number: numberRaw ? Number(numberRaw) : null,
    author_note: str(formData, "author_note") || null,
    hero_media_id: await mediaIdForUrl(db, heroUrl, title),
    soundtrack: youtube ? [{ youtube, title: "ambience" }] : [],
    ...scheduleFields(formData),
    ...buildBody(str(formData, "body_html")),
  };

  if (id) await db.from("chapters").update(payload).eq("id", id);
  else await db.from("chapters").insert(payload);

  revalidatePath("/novels");
  redirect("/studio");
}

export async function deleteItem(formData: FormData) {
  await requireAdmin();
  const db = createAdminClient();
  const table = str(formData, "table");
  const id = str(formData, "id");
  if (["posts", "novels", "chapters"].includes(table) && id) {
    await db.from(table).delete().eq("id", id);
  }
  revalidatePath("/");
  revalidatePath("/writing");
  revalidatePath("/novels");
  redirect("/studio");
}
