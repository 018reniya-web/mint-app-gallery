# MINT App Gallery

社内AI勉強会「MINT (Mind Innovation & Next Technology)」で作られたAIアプリ・プロトタイプを
一覧・共有・評価するポータルサイト。

## 技術スタック

- **Next.js 14** (App Router / React / TypeScript)
- **Tailwind CSS** + lucide-react
- **Supabase** (PostgreSQL / Realtime / Storage)

## セットアップ

```bash
npm install
cp .env.local.example .env.local   # 値を編集
npm run dev
```

### Supabase 設定

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. `supabase/schema.sql` を SQL Editor で実行（テーブル・RPC・RLS・Storage を作成）
3. Project Settings > API の URL と anon key を `.env.local` に設定

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET=app-media
```

## ディレクトリ構成

```
app/
  layout.tsx          ルートレイアウト
  page.tsx            トップ（Gallery を描画）
  globals.css         Tailwind エントリ
components/
  Gallery.tsx         一覧・状態管理・Realtime 購読・背景アクセントの中核
  Header.tsx          ヘッダー / 「🌱 投稿する」ボタン
  CategoryTabs.tsx    ジャンル絞り込みタブ（すべて / 自作アプリ / ...）
  SortTabs.tsx        いいね順 / 新着順の切り替え
  AppCard.tsx         カード（メディア・ジャンルバッジ・いいね・編集/削除）
  AppModal.tsx        詳細モーダル（編集/削除ボタン）
  AppFormModal.tsx    投稿 / 編集 兼用フォームモーダル（create / edit）
  LikeButton.tsx      🌱 連打いいねボタン + キラキラパーティクル演出
  CategoryBadge.tsx   ジャンル色分けバッジ
  Modal.tsx           共通モーダルラッパー
lib/
  supabaseClient.ts   Supabase クライアント共通化
  apps.ts             データアクセス（取得 / 追加 / いいね / アップロード）
  types.ts            型定義
  utils.ts            cn / 日付・メディア判定ヘルパー
supabase/
  schema.sql          DB スキーマ一式
```

## 主な機能

| 機能 | 説明 |
| :-- | :-- |
| ギャラリー表示 | レスポンシブなカードグリッド。画像/動画プレビュー対応 |
| ジャンル分類 | `category`（自作アプリ / 議事録 / 活用ネタ / 課題相談 / AI使ってみた）。トップに絞り込みタブ |
| 詳細モーダル | 説明文・制作者・アプリURL・ジャンルを表示 |
| 🌱 いいね | 連打歓迎。`increment_likes` RPC で毎回加算＋楽観的更新。poyon バウンス＋クリック位置から ✨🌟 が飛び散るキラキラ演出 |
| ランキング | いいね順 / 新着順ソート |
| 投稿フォーム | ヘッダー「🌱 投稿する」から。URL 入力または Storage へのファイルアップロード |
| 編集 / 削除 | カードのホバー、または詳細モーダルの Pencil / Trash から。削除は確認ダイアログ付き |
| リアルタイム | `postgres_changes` を購読し他ユーザーの投稿・いいね・編集・削除を即時反映 |
| デザイン | 白 × ミントグリーンのグラデーション背景と柔らかい円形アクセント。ヘッダーは `public/MINTLogo.png`（無ければテキストにフォールバック） |
