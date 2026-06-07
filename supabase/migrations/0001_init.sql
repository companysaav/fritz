-- ============================================================================
-- fritz — initial schema
-- Blog posts + serialized web novels with rich inline media, a cast/story bible,
-- reader engagement, an email list, and cached "narrator" (cat) AI personality.
--
-- Backend: Supabase (Postgres + Auth + Storage). Run with `supabase db push`
-- or paste into the SQL editor. RLS is ON for every table; the service-role key
-- (used by your server / admin) bypasses RLS, anon/auth users go through policies.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;     -- case-insensitive email/handles

-- Helper functions are defined before the tables they reference, so skip SQL
-- function-body validation during this migration (relations exist by runtime).
set check_function_bodies = off;

-- ----------------------------------------------------------------------------
-- 1. Enums
-- ----------------------------------------------------------------------------
create type user_role      as enum ('admin', 'author', 'reader');
create type content_status as enum ('draft', 'scheduled', 'published', 'archived');
create type novel_status   as enum ('draft', 'ongoing', 'hiatus', 'completed');
create type media_type     as enum ('image', 'video', 'audio', 'embed', 'file');
create type comment_status as enum ('pending', 'approved', 'spam', 'deleted');
create type reaction_type  as enum ('clap', 'heart', 'star');
-- The narrator persona(s) — fritz is the house voice; extend as the cast grows.
create type ai_kind        as enum ('recap', 'intro_line', 'scene_prompt', 'narrator_quip', 'summary');

-- ----------------------------------------------------------------------------
-- 2. Helper functions
-- ----------------------------------------------------------------------------

-- Generic updated_at bump.
create or replace function public.tg_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Stamp published_at the first time a row goes live (tables with status column).
create or replace function public.tg_set_published_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end $$;

-- Admin check. SECURITY DEFINER so it reads `profiles` without tripping that
-- table's own RLS (avoids the classic Supabase policy-recursion footgun).
-- Only admins may write/publish/edit content; 'author'/'reader' are read-only here.
create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- ============================================================================
-- 3. Tables
-- ============================================================================

-- 3.1 Profiles (extends auth.users) -----------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  handle       citext unique,
  display_name text,
  bio          text,
  avatar_url   text,
  role         user_role not null default 'reader',
  links        jsonb not null default '{}'::jsonb,  -- social links etc.
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3.2 Media assets (Supabase Storage + external embeds) ----------------------
create table public.media_assets (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references public.profiles on delete set null,
  type          media_type not null,
  storage_path  text,        -- path within the 'media' bucket (uploaded files)
  url           text,        -- resolved/public URL
  external_url  text,        -- YouTube/Vimeo/Spotify etc. for embeds
  provider      text,        -- 'youtube' | 'vimeo' | 'spotify' | 'supabase' ...
  mime_type     text,
  alt           text,
  caption       text,
  credit        text,
  width         int,
  height        int,
  duration_sec  numeric,
  file_size     bigint,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

-- 3.3 Tags ------------------------------------------------------------------
create table public.tags (
  id          uuid primary key default gen_random_uuid(),
  slug        citext unique not null,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- 3.4 Posts (standalone blog / essays) --------------------------------------
-- body is a rich block document (JSONB) so any paragraph can be followed by an
-- image, gallery, video, YouTube embed, audio, callout, aside, etc.
-- plain_text mirrors the prose (set by the app) for full-text search + reading time.
create table public.posts (
  id                   uuid primary key default gen_random_uuid(),
  slug                 citext unique not null,
  title                text not null,
  dek                  text,                      -- subtitle / standfirst
  excerpt              text,
  body                 jsonb not null default '{}'::jsonb,
  plain_text           text,
  cover_media_id       uuid references public.media_assets on delete set null,
  author_id            uuid references public.profiles on delete set null,
  status               content_status not null default 'draft',
  featured             boolean not null default false,
  reading_time_minutes int,
  view_count           int not null default 0,
  published_at         timestamptz,
  scheduled_for        timestamptz,
  search               tsvector generated always as (
                         to_tsvector('english',
                           coalesce(title,'') || ' ' ||
                           coalesce(dek,'') || ' ' ||
                           coalesce(excerpt,'') || ' ' ||
                           coalesce(plain_text,''))
                       ) stored,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- 3.5 Novels (the serialized works) -----------------------------------------
create table public.novels (
  id             uuid primary key default gen_random_uuid(),
  slug           citext unique not null,
  title          text not null,
  tagline        text,
  synopsis       text,
  cover_media_id uuid references public.media_assets on delete set null,
  banner_media_id uuid references public.media_assets on delete set null,
  author_id      uuid references public.profiles on delete set null,
  status         novel_status not null default 'draft',     -- story progress
  visibility     content_status not null default 'draft',   -- public listing state
  accent_color   text,                       -- per-novel brand accent
  soundtrack     jsonb not null default '[]'::jsonb,        -- default ambient playlist
  featured       boolean not null default false,
  published_at   timestamptz,
  search         tsvector generated always as (
                   to_tsvector('english',
                     coalesce(title,'') || ' ' ||
                     coalesce(tagline,'') || ' ' ||
                     coalesce(synopsis,''))
                 ) stored,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 3.6 Novel parts / arcs (optional grouping above chapters) ------------------
create table public.novel_parts (
  id         uuid primary key default gen_random_uuid(),
  novel_id   uuid not null references public.novels on delete cascade,
  title      text not null,
  subtitle   text,
  position   int not null default 0,
  created_at timestamptz not null default now()
);

-- 3.7 Chapters --------------------------------------------------------------
create table public.chapters (
  id                   uuid primary key default gen_random_uuid(),
  novel_id             uuid not null references public.novels on delete cascade,
  part_id              uuid references public.novel_parts on delete set null,
  slug                 citext not null,
  number               numeric,           -- allows 1.5 interludes / side stories
  title                text not null,
  body                 jsonb not null default '{}'::jsonb,
  plain_text           text,
  excerpt              text,
  hero_media_id        uuid references public.media_assets on delete set null,
  soundtrack           jsonb not null default '[]'::jsonb,  -- per-chapter ambient media
  author_note          text,
  status               content_status not null default 'draft',
  word_count           int,
  reading_time_minutes int,
  view_count           int not null default 0,
  published_at         timestamptz,
  scheduled_for        timestamptz,
  search               tsvector generated always as (
                         to_tsvector('english',
                           coalesce(title,'') || ' ' ||
                           coalesce(excerpt,'') || ' ' ||
                           coalesce(plain_text,''))
                       ) stored,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (novel_id, slug)
);

-- 3.8 Characters / story bible ----------------------------------------------
create table public.characters (
  id                 uuid primary key default gen_random_uuid(),
  novel_id           uuid not null references public.novels on delete cascade,
  slug               citext not null,
  name               text not null,
  role               text,                 -- 'protagonist', 'narrator', ...
  bio                text,
  portrait_media_id  uuid references public.media_assets on delete set null,
  spoiler_level      int not null default 0,   -- hide/blur until reader is far enough
  position           int not null default 0,
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (novel_id, slug)
);

-- 3.9 Tag join tables -------------------------------------------------------
create table public.post_tags (
  post_id uuid not null references public.posts on delete cascade,
  tag_id  uuid not null references public.tags  on delete cascade,
  primary key (post_id, tag_id)
);

create table public.novel_tags (
  novel_id uuid not null references public.novels on delete cascade,
  tag_id   uuid not null references public.tags   on delete cascade,
  primary key (novel_id, tag_id)
);

-- 3.10 Comments (on posts or chapters; threaded; moderated) -----------------
create table public.comments (
  id           uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('post', 'chapter')),
  subject_id   uuid not null,
  parent_id    uuid references public.comments on delete cascade,
  author_id    uuid references public.profiles on delete set null,
  author_name  text,                 -- display fallback
  body         text not null check (length(btrim(body)) > 0),
  status       comment_status not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 3.11 Reactions (claps / hearts) -------------------------------------------
create table public.reactions (
  id           uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('post', 'chapter')),
  subject_id   uuid not null,
  user_id      uuid references public.profiles on delete cascade,
  type         reaction_type not null default 'clap',
  created_at   timestamptz not null default now(),
  unique (subject_type, subject_id, user_id, type)
);

-- 3.12 Bookmarks ------------------------------------------------------------
create table public.bookmarks (
  user_id    uuid not null references public.profiles on delete cascade,
  chapter_id uuid not null references public.chapters on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

-- 3.13 Reading progress (resume where you left off) -------------------------
create table public.reading_progress (
  user_id    uuid not null references public.profiles on delete cascade,
  chapter_id uuid not null references public.chapters on delete cascade,
  progress   numeric not null default 0 check (progress between 0 and 1),
  position   jsonb,           -- scroll anchor / block id
  updated_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

-- 3.14 Email subscribers (chapter drops / newsletter) -----------------------
create table public.subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         citext unique not null,
  status        text not null default 'pending' check (status in ('pending','active','unsubscribed')),
  novel_id      uuid references public.novels on delete set null,  -- null = whole site
  confirm_token uuid not null default gen_random_uuid(),
  source        text,
  created_at    timestamptz not null default now(),
  confirmed_at  timestamptz
);

-- 3.15 AI generations (cached narrator/cat personality output) --------------
create table public.ai_generations (
  id           uuid primary key default gen_random_uuid(),
  kind         ai_kind not null,
  subject_type text,             -- 'post' | 'chapter' | 'novel' | null
  subject_id   uuid,
  persona      text not null default 'fritz',
  prompt       text,
  output       text not null,
  model        text,
  tokens       int,
  created_at   timestamptz not null default now()
);

-- 3.16 Site settings (brand tokens + in-character microcopy, editable) ------
create table public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 4. Indexes
-- ============================================================================
create index posts_status_pub_idx    on public.posts    (status, published_at desc);
create index posts_author_idx        on public.posts    (author_id);
create index posts_search_idx        on public.posts    using gin (search);

create index novels_visibility_idx   on public.novels   (visibility, published_at desc);
create index novels_search_idx       on public.novels   using gin (search);

create index parts_novel_idx         on public.novel_parts (novel_id, position);

create index chapters_novel_idx      on public.chapters (novel_id, number);
create index chapters_status_pub_idx on public.chapters (status, published_at desc);
create index chapters_search_idx     on public.chapters using gin (search);

create index characters_novel_idx    on public.characters (novel_id, position);

create index comments_subject_idx    on public.comments (subject_type, subject_id, created_at);
create index comments_status_idx     on public.comments (status);

create index reactions_subject_idx   on public.reactions (subject_type, subject_id);

create index ai_subject_idx          on public.ai_generations (kind, subject_type, subject_id);

-- ============================================================================
-- 5. Triggers
-- ============================================================================
-- updated_at on every table that has it
create trigger touch_profiles   before update on public.profiles   for each row execute function public.tg_touch_updated_at();
create trigger touch_posts      before update on public.posts      for each row execute function public.tg_touch_updated_at();
create trigger touch_novels     before update on public.novels     for each row execute function public.tg_touch_updated_at();
create trigger touch_chapters   before update on public.chapters   for each row execute function public.tg_touch_updated_at();
create trigger touch_characters before update on public.characters for each row execute function public.tg_touch_updated_at();
create trigger touch_comments   before update on public.comments   for each row execute function public.tg_touch_updated_at();

-- stamp published_at when status flips to 'published'
create trigger pub_posts    before insert or update on public.posts    for each row execute function public.tg_set_published_at();
create trigger pub_chapters before insert or update on public.chapters for each row execute function public.tg_set_published_at();

-- auto-create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 6. Row Level Security
-- ============================================================================
alter table public.profiles         enable row level security;
alter table public.media_assets     enable row level security;
alter table public.tags             enable row level security;
alter table public.posts            enable row level security;
alter table public.novels           enable row level security;
alter table public.novel_parts      enable row level security;
alter table public.chapters         enable row level security;
alter table public.characters       enable row level security;
alter table public.post_tags        enable row level security;
alter table public.novel_tags       enable row level security;
alter table public.comments         enable row level security;
alter table public.reactions        enable row level security;
alter table public.bookmarks        enable row level security;
alter table public.reading_progress enable row level security;
alter table public.subscribers      enable row level security;
alter table public.ai_generations   enable row level security;
alter table public.site_settings    enable row level security;

-- 6.1 Profiles
create policy profiles_read   on public.profiles for select using (true);
create policy profiles_update on public.profiles for update using (id = auth.uid() or public.is_admin());
create policy profiles_insert on public.profiles for insert with check (id = auth.uid() or public.is_admin());

-- 6.2 Media — readable by all (referenced inside published content), staff writes
create policy media_read  on public.media_assets for select using (true);
create policy media_write on public.media_assets for all   using (public.is_admin()) with check (public.is_admin());

-- 6.3 Tags & joins — public read, staff write
create policy tags_read       on public.tags       for select using (true);
create policy tags_write      on public.tags       for all   using (public.is_admin()) with check (public.is_admin());
create policy posttags_read   on public.post_tags  for select using (true);
create policy posttags_write  on public.post_tags  for all   using (public.is_admin()) with check (public.is_admin());
create policy noveltags_read  on public.novel_tags for select using (true);
create policy noveltags_write on public.novel_tags for all   using (public.is_admin()) with check (public.is_admin());

-- 6.4 Posts — public sees live posts, staff sees/edits everything
create policy posts_read  on public.posts for select
  using (public.is_admin() or (status = 'published' and published_at is not null and published_at <= now()));
create policy posts_write on public.posts for all
  using (public.is_admin()) with check (public.is_admin());

-- 6.5 Novels
create policy novels_read  on public.novels for select
  using (public.is_admin() or visibility = 'published');
create policy novels_write on public.novels for all
  using (public.is_admin()) with check (public.is_admin());

-- 6.6 Novel parts — visible when their novel is public
create policy parts_read  on public.novel_parts for select
  using (public.is_admin() or exists (
    select 1 from public.novels n where n.id = novel_id and n.visibility = 'published'));
create policy parts_write on public.novel_parts for all
  using (public.is_admin()) with check (public.is_admin());

-- 6.7 Chapters — live chapter AND public novel
create policy chapters_read  on public.chapters for select
  using (public.is_admin() or (
    status = 'published' and published_at is not null and published_at <= now()
    and exists (select 1 from public.novels n where n.id = novel_id and n.visibility = 'published')));
create policy chapters_write on public.chapters for all
  using (public.is_admin()) with check (public.is_admin());

-- 6.8 Characters — visible when their novel is public
create policy characters_read  on public.characters for select
  using (public.is_admin() or exists (
    select 1 from public.novels n where n.id = novel_id and n.visibility = 'published'));
create policy characters_write on public.characters for all
  using (public.is_admin()) with check (public.is_admin());

-- 6.9 Comments — read approved (or your own); authenticated users post; edit own
create policy comments_read   on public.comments for select
  using (status = 'approved' or public.is_admin() or author_id = auth.uid());
create policy comments_insert on public.comments for insert
  with check (auth.uid() is not null and author_id = auth.uid());
create policy comments_update on public.comments for update
  using (author_id = auth.uid() or public.is_admin());
create policy comments_delete on public.comments for delete
  using (author_id = auth.uid() or public.is_admin());

-- 6.10 Reactions — counts are public; users manage their own
create policy reactions_read   on public.reactions for select using (true);
create policy reactions_insert on public.reactions for insert with check (user_id = auth.uid());
create policy reactions_delete on public.reactions for delete using (user_id = auth.uid());

-- 6.11 Bookmarks & reading progress — strictly the owner's
create policy bookmarks_all on public.bookmarks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy progress_all on public.reading_progress for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 6.12 Subscribers — anyone can sign up; only staff can read the list
--      (confirmation/unsubscribe runs server-side via the service role)
create policy subs_insert on public.subscribers for insert with check (true);
create policy subs_read   on public.subscribers for select using (public.is_admin());

-- 6.13 AI generations — cached narrator lines are public; staff/server write
create policy ai_read  on public.ai_generations for select using (true);
create policy ai_write on public.ai_generations for all
  using (public.is_admin()) with check (public.is_admin());

-- 6.14 Site settings — public read (theme/microcopy), admin write
create policy settings_read  on public.site_settings for select using (true);
create policy settings_write on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- 7. Storage bucket for media + policies
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy media_bucket_read on storage.objects for select
  using (bucket_id = 'media');
create policy media_bucket_write on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());
create policy media_bucket_update on storage.objects for update
  using (bucket_id = 'media' and public.is_admin());
create policy media_bucket_delete on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());

-- ============================================================================
-- 8. Seed — brand tokens + in-character microcopy (fritz, the warm/playful host)
-- ============================================================================
insert into public.site_settings (key, value) values
  ('brand', jsonb_build_object(
      'name', 'fritz',
      'tagline', 'stories, told properly.',
      'palette', jsonb_build_object(
        'paper',  '#F4E9D2',   -- warm cream
        'ink',    '#1A1714',   -- near-black
        'accent', '#F2B705',   -- mustard
        'accent2','#E4572E'    -- warm pop
      ),
      'fonts', jsonb_build_object(
        'display', 'hand-lettered chunky display (wordmark + headlines)',
        'body',    'clean legible reading face (prose)'
      ),
      'mascot', jsonb_build_object('name', 'fritz', 'species', 'cat', 'motif', 'peeking eyes')
  )),
  ('microcopy', jsonb_build_object(
      'not_found',   'fritz looked everywhere. this page isn''t here.',
      'empty_posts', 'nothing written yet — fritz is sharpening a pencil.',
      'subscribe',   'get the next chapter the moment it drops.',
      'new_reader',  'first time? fritz suggests starting here.'
  ))
on conflict (key) do nothing;

-- Done.
