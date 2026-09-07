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

export interface AppItem {
  id: string;
  title: string;
  description: string;
  category: string;
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
  author_name: string;
  media_url: string | null;
  app_url: string | null;
};

export type SortKey = "likes" | "newest";
