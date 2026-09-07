import { MEDIA_BUCKET, supabase } from "@/lib/supabaseClient";
import { ALL_CATEGORY } from "@/lib/types";
import type {
  AppItem,
  CategoryFilter,
  NewAppInput,
  SortKey,
} from "@/lib/types";

const TABLE = "apps";

/** 一覧取得。カテゴリ絞り込み + sort に応じていいね順 / 新着順で並べ替える */
export async function fetchApps(
  sort: SortKey,
  category: CategoryFilter = ALL_CATEGORY
): Promise<AppItem[]> {
  let query = supabase.from(TABLE).select("*");

  if (category !== ALL_CATEGORY) {
    query = query.eq("category", category);
  }

  const { data, error } =
    sort === "likes"
      ? await query
          .order("likes_count", { ascending: false })
          .order("created_at", { ascending: false })
      : await query.order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AppItem[];
}

/** 新規アプリを登録する */
export async function addApp(input: NewAppInput): Promise<AppItem> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...input, likes_count: 0 })
    .select()
    .single();

  if (error) throw error;
  return data as AppItem;
}

/** 既存アプリを更新する */
export async function updateApp(
  id: string,
  input: NewAppInput
): Promise<AppItem> {
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as AppItem;
}

/** アプリを削除する */
export async function deleteApp(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

/**
 * いいねをインクリメントする。
 * 競合状態を避けるため Supabase 側の RPC (increment_likes) を利用する。
 */
export async function likeApp(id: string): Promise<number> {
  const { data, error } = await supabase.rpc("increment_likes", { app_id: id });
  if (error) throw error;
  return data as number;
}

/** メディアファイルを Storage にアップロードし、公開 URL を返す */
export async function uploadMedia(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
