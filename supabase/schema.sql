-- =============================================================
-- MINT App Gallery - Supabase schema (再実行安全版)
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
  pdf_url      text,                               -- 資料 PDF（任意・1 投稿 1 ファイル）
  author_name  text not null,
  likes_count  integer not null default 0,
  created_at   timestamptz not null default now()
);

-- 既存テーブルへの後方互換マイグレーション
alter table public.apps
  add column if not exists category text not null default '自作アプリ';
alter table public.apps
  add column if not exists visibility text not null default 'public';
alter table public.apps
  add column if not exists pdf_url text;

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
-- ログイン済みユーザー（authenticated）のみ閲覧・登録・いいね・編集・削除できる設定
-- アカウントは Supabase ダッシュボード > Authentication > Users で発行する
alter table public.apps enable row level security;

-- 旧ポリシー（匿名キーで誰でも操作可能）を削除
drop policy if exists "apps are viewable by everyone" on public.apps;
drop policy if exists "anyone can insert apps" on public.apps;
drop policy if exists "anyone can update likes" on public.apps;
drop policy if exists "anyone can delete apps" on public.apps;

drop policy if exists "authenticated can view apps" on public.apps;
create policy "authenticated can view apps"
  on public.apps for select
  to authenticated
  using (true);

drop policy if exists "authenticated can insert apps" on public.apps;
create policy "authenticated can insert apps"
  on public.apps for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update apps" on public.apps;
create policy "authenticated can update apps"
  on public.apps for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete apps" on public.apps;
create policy "authenticated can delete apps"
  on public.apps for delete
  to authenticated
  using (true);

-- 4. Realtime (既に登録済みの場合はスキップする安全処置) ------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
      and schemaname = 'public' 
      and tablename = 'apps'
  ) then
    alter publication supabase_realtime add table public.apps;
  end if;
end $$;

-- 5. Storage バケット（画像 / 動画 / PDF）--------------------------------
insert into storage.buckets (id, name, public)
values ('app-media', 'app-media', true)
on conflict (id) do nothing;

drop policy if exists "public read app-media" on storage.objects;
drop policy if exists "anyone can upload app-media" on storage.objects;

drop policy if exists "authenticated read app-media" on storage.objects;
create policy "authenticated read app-media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'app-media');

drop policy if exists "authenticated upload app-media" on storage.objects;
create policy "authenticated upload app-media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'app-media');
