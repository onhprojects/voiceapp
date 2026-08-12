-- Resume Builder feature
-- Everything in this file is isolated to the resume-builder feature and can be
-- dropped by removing the tables/bucket below.

-- Storage bucket for exported resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Metadata table for user resumes
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Resume',
  template text not null default 'classic',
  doc_json jsonb not null default '{}'::jsonb,   -- ProseMirror document
  model text not null default 'poolside/laguna-s-2.1:free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resumes enable row level security;

drop policy if exists "resume owner read" on public.resumes;
create policy "resume owner read"
  on public.resumes for select
  using (auth.uid() = user_id);

drop policy if exists "resume owner write" on public.resumes;
create policy "resume owner write"
  on public.resumes for insert
  with check (auth.uid() = user_id);

drop policy if exists "resume owner update" on public.resumes;
create policy "resume owner update"
  on public.resumes for update
  using (auth.uid() = user_id);

drop policy if exists "resume owner delete" on public.resumes;
create policy "resume owner delete"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- Admin-chosen global default model (single row)
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null
);

insert into public.app_settings (key, value)
values ('openrouter_model', '"poolside/laguna-s-2.1:free"')
ON CONFLICT (key) DO NOTHING;

alter table public.app_settings enable row level security;

-- Any authenticated user may read app_settings (needed to know the active model)
drop policy if exists "app_settings read" on public.app_settings;
create policy "app_settings read"
  on public.app_settings for select
  to authenticated
  using (true);

-- Storage policy: users only touch their own folder
drop policy if exists "resume owner storage" on storage.objects;
create policy "resume owner storage"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
