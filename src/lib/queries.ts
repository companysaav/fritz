import { createClient } from "@/lib/supabase/server";

/**
 * Server-side data access. Uses the cookie-aware anon client, so RLS only ever
 * returns published content to the public — drafts stay invisible.
 *
 * Note: PostgREST returns many-to-one embeds (e.g. cover_media_id) as a single
 * object, but the select-string inference types them as arrays — so each query
 * is cast to an explicit shape below.
 */

export type Media = { url: string | null; alt: string | null } | null;

export type PostListItem = {
  slug: string;
  title: string;
  dek: string | null;
  excerpt: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  featured: boolean;
  cover: Media;
};

export type PostFull = PostListItem & { id: string; body: unknown };

export type NovelListItem = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  synopsis: string | null;
  status: string | null;
  accent_color: string | null;
  featured: boolean;
  cover: Media;
};

export type ChapterStub = {
  id: string;
  slug: string;
  number: number | null;
  title: string;
  excerpt: string | null;
  reading_time_minutes: number | null;
  word_count: number | null;
  published_at: string | null;
};

export type Character = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  bio: string | null;
  portrait: Media;
};

export type NovelFull = NovelListItem & {
  banner: Media;
  chapters: ChapterStub[];
  characters: Character[];
};

export type ChapterFull = ChapterStub & {
  body: unknown;
  author_note: string | null;
  soundtrack: unknown;
  hero: Media;
};

export async function getSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("key, value");
  const map: Record<string, Record<string, unknown>> = {};
  for (const row of (data ?? []) as { key: string; value: Record<string, unknown> }[])
    map[row.key] = row.value;
  return map;
}

export async function getPosts(limit?: number): Promise<PostListItem[]> {
  const supabase = await createClient();
  let q = supabase
    .from("posts")
    .select(
      "id, slug, title, dek, excerpt, reading_time_minutes, published_at, featured, cover:cover_media_id(url, alt)",
    )
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data ?? []) as unknown as PostListItem[];
}

export async function getPost(slug: string): Promise<PostFull | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(
      "id, slug, title, dek, excerpt, body, reading_time_minutes, published_at, featured, cover:cover_media_id(url, alt)",
    )
    .eq("slug", slug)
    .maybeSingle();
  return (data as unknown as PostFull) ?? null;
}

export async function getNovels(): Promise<NovelListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("novels")
    .select(
      "id, slug, title, tagline, synopsis, status, accent_color, featured, cover:cover_media_id(url, alt)",
    )
    .order("featured", { ascending: false });
  return (data ?? []) as unknown as NovelListItem[];
}

export async function getFeaturedNovel(): Promise<NovelListItem | null> {
  const novels = await getNovels();
  return novels[0] ?? null;
}

export async function getNovel(slug: string): Promise<NovelFull | null> {
  const supabase = await createClient();
  const { data: novel } = await supabase
    .from("novels")
    .select(
      "id, slug, title, tagline, synopsis, status, accent_color, featured, cover:cover_media_id(url, alt), banner:banner_media_id(url, alt)",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!novel) return null;

  const { data: chapters } = await supabase
    .from("chapters")
    .select(
      "id, slug, number, title, excerpt, reading_time_minutes, word_count, published_at",
    )
    .eq("novel_id", (novel as { id: string }).id)
    .order("number", { ascending: true });

  const { data: characters } = await supabase
    .from("characters")
    .select("id, slug, name, role, bio, portrait:portrait_media_id(url, alt)")
    .eq("novel_id", (novel as { id: string }).id)
    .order("position", { ascending: true });

  return {
    ...(novel as object),
    chapters: (chapters ?? []) as unknown as ChapterStub[],
    characters: (characters ?? []) as unknown as Character[],
  } as NovelFull;
}

export async function getChapter(novelSlug: string, chapterSlug: string) {
  const supabase = await createClient();
  const { data: novel } = await supabase
    .from("novels")
    .select("id, slug, title, accent_color")
    .eq("slug", novelSlug)
    .maybeSingle();
  if (!novel) return null;

  const { data: chapters } = await supabase
    .from("chapters")
    .select(
      "id, slug, number, title, excerpt, body, author_note, soundtrack, reading_time_minutes, word_count, published_at, hero:hero_media_id(url, alt)",
    )
    .eq("novel_id", (novel as { id: string }).id)
    .order("number", { ascending: true });

  const list = (chapters ?? []) as unknown as ChapterFull[];
  const index = list.findIndex((c) => c.slug === chapterSlug);
  if (index === -1) return null;

  return {
    novel: novel as { id: string; slug: string; title: string; accent_color: string | null },
    chapter: list[index],
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
    total: list.length,
    position: index + 1,
  };
}
