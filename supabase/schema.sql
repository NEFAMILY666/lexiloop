-- Run this file once in Supabase > SQL Editor.
-- The approved email is intentionally NOT stored in this repository.

create extension if not exists "pgcrypto";

create table if not exists public.allowed_users (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.allowed_users enable row level security;

create or replace function public.is_allowed()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.allowed_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_allowed() from public;
grant execute on function public.is_allowed() to authenticated;

create table if not exists public.words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  term text not null,
  definition text not null,
  example text default '',
  part_of_speech text default '',
  level text default 'B1',
  created_at timestamptz not null default now()
);

create table if not exists public.word_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id uuid not null references public.words(id) on delete cascade,
  mastery int not null default 0 check (mastery between 0 and 5),
  correct_count int not null default 0,
  wrong_count int not null default 0,
  last_practiced_at timestamptz,
  primary key (user_id, word_id)
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp int not null default 0,
  streak int not null default 0,
  last_practice_date date
);

alter table public.words enable row level security;
alter table public.word_progress enable row level security;
alter table public.profiles enable row level security;

create policy "owner can read words" on public.words for select using (auth.uid() = user_id and public.is_allowed());
create policy "owner can add words" on public.words for insert with check (auth.uid() = user_id and public.is_allowed());
create policy "owner can update words" on public.words for update using (auth.uid() = user_id and public.is_allowed());
create policy "owner can delete words" on public.words for delete using (auth.uid() = user_id and public.is_allowed());
create policy "owner can read progress" on public.word_progress for select using (auth.uid() = user_id and public.is_allowed());
create policy "owner can add progress" on public.word_progress for insert with check (auth.uid() = user_id and public.is_allowed());
create policy "owner can update progress" on public.word_progress for update using (auth.uid() = user_id and public.is_allowed());
create policy "owner can read profile" on public.profiles for select using (auth.uid() = user_id and public.is_allowed());
create policy "owner can add profile" on public.profiles for insert with check (auth.uid() = user_id and public.is_allowed());
create policy "owner can update profile" on public.profiles for update using (auth.uid() = user_id and public.is_allowed());

