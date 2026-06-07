-- ============================================================================
-- fritz — admin allowlist
-- Replaces role-on-profiles admin gating with a simple table you control.
-- Authorize someone to write by inserting their email here (Studio login is
-- email + password). The auth user must also exist (Dashboard → Authentication
-- → Add user, or scripts/create-admin.mjs).
-- ============================================================================

create table if not exists public.admins (
  email      citext primary key,
  note       text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- A signed-in user may check whether THEY are an admin (their own row only).
-- The service role (dashboard / server) bypasses RLS to manage the list.
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins
  for select using (email = auth.email());

-- Admin = your email is on the allowlist. SECURITY DEFINER so it reads the
-- table regardless of the caller's RLS (drives every write policy in 0001).
create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public, pg_temp as $$
  select exists (select 1 from public.admins where email = auth.email());
$$;

-- seed the first admin
insert into public.admins (email, note)
values ('companysaav@gmail.com', 'founder')
on conflict (email) do nothing;
