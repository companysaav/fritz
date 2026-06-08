-- ============================================================================
-- fritz — the notebook (private author notes)
-- A place to brain-dump while writing: thoughts that aren't formalised yet but
-- are too valuable to lose. Notes attach to any work level via a polymorphic
-- (subject_type, subject_id) pair — the same shape as comments/reactions:
--   'novel'   → global notes for the whole work (themes, the ending, seeds)
--   'post'    → notes for a standalone essay
--   'chapter' → chapter notes, optionally anchored to a passage in the prose
--
-- These are AUTHOR-ONLY. Unlike every other content table there is NO public
-- read policy — the notebook never leaks to readers. Admins only.
-- ============================================================================

create table if not exists public.notes (
  id           uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('novel', 'post', 'chapter')),
  subject_id   uuid not null,
  title        text,
  body         text not null default '',          -- can run as long as a chapter
  color        text,                              -- bleed-palette label key, or null
  anchor_text  text,                              -- passage this note pins to (chapters)
  pinned       boolean not null default false,
  position     int not null default 0,
  author_id    uuid references public.profiles on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists notes_subject_idx
  on public.notes (subject_type, subject_id, pinned desc, updated_at desc);

alter table public.notes enable row level security;

-- Author-only. No `for select using (true)` here on purpose: the notebook is
-- private. The service role (Studio server actions) bypasses RLS to write.
drop policy if exists notes_admin_all on public.notes;
create policy notes_admin_all on public.notes for all
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists touch_notes on public.notes;
create trigger touch_notes before update on public.notes
  for each row execute function public.tg_touch_updated_at();

-- Done.
