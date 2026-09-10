-- =============================================================
-- MINT App Gallery - Supabase schema
-- Supabase ダッシュボード > SQL Editor に貼り付けて実行してください
-- =============================================================

-- 1. apps テーブル -------------------------------------------------
create table if not exists public.apps (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null default '',
  category     text not null default '自作アプリ',
  visibility   text not null default 'public',   -- 'public'（表） / 'secret'（裏投稿）
  media_url    text,
  app_url      text,
  author_name  text not null,
  likes_count  integer not null default 0,
  created_at   timestamptz not null default now()
);

-- 既存テーブルへの後方互換マイグレーション
alter table public.apps
  add column if not exists category text not null default '自作アプリ';
alter table public.apps
  add column if not exists visibility text not null default 'public';

create index if not exists apps_likes_count_idx on public.apps (likes_count desc);
create index if not exists apps_created_at_idx  on public.apps (created_at desc);
create index if not exists apps_category_idx    on public.apps (category);
create index if not exists apps_visibility_idx  on public.apps (visibility);

-- 2. いいねインクリメント用 RPC ---------------------------------------
-- 競合状態を避けるため、加算は DB 側で原子的に行う
create or replace function public.increment_likes(app_id uuid)
returns integer
language sql
as $$
  update public.apps
  set likes_count = likes_count + 1
  where id = app_id
  returning likes_count;
$$;

-- 3. Row Level Security --------------------------------------------
-- 社内勉強会向けのため、匿名キーで自由に閲覧・登録・いいねできる設定
alter table public.apps enable row level security;

drop policy if exists "apps are viewable by everyone" on public.apps;
create policy "apps are viewable by everyone"
  on public.apps for select
  using (true);

drop policy if exists "anyone can insert apps" on public.apps;
create policy "anyone can insert apps"
  on public.apps for insert
  with check (true);

drop policy if exists "anyone can update likes" on public.apps;
create policy "anyone can update likes"
  on public.apps for update
  using (true)
  with check (true);

drop policy if exists "anyone can delete apps" on public.apps;
create policy "anyone can delete apps"
  on public.apps for delete
  using (true);

-- 4. Realtime ----------------------------------------------------
alter publication supabase_realtime add table public.apps;

-- 5. Storage バケット（画像 / 動画）--------------------------------
insert into storage.buckets (id, name, public)
values ('app-media', 'app-media', true)
on conflict (id) do nothing;

drop policy if exists "public read app-media" on storage.objects;
create policy "public read app-media"
  on storage.objects for select
  using (bucket_id = 'app-media');

drop policy if exists "anyone can upload app-media" on storage.objects;
create policy "anyone can upload app-media"
  on storage.objects for insert
  with check (bucket_id = 'app-media');
