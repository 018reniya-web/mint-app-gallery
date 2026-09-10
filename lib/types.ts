export const CATEGORIES = [
  "自作アプリ",
  "議事録",
  "活用ネタ",
  "課題相談",
  "AI使ってみた",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** カテゴリ絞り込みタブ用（「すべて」を含む） */
export const ALL_CATEGORY = "すべて" as const;
export type CategoryFilter = typeof ALL_CATEGORY | Category;

/**
 * 投稿の公開範囲。
 * - "public": 通常（表）の投稿
 * - "secret": 裏投稿モードでのみ表示される投稿
 */
export type Visibility = "public" | "secret";

export interface AppItem {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: Visibility;
  media_url: string | null;
  app_url: string | null;
  author_name: string;
  likes_count: number;
  created_at: string;
}

export type NewAppInput = {
  title: string;
  description: string;
  category: Category;
  visibility: Visibility;
  author_name: string;
  media_url: string | null;
  app_url: string | null;
};

export type SortKey = "likes" | "newest";
