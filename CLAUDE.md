# MINT App Gallery Project Guide

## 1. Project Overview
社内AI勉強会「MINT (Mind Innovation & Next Technology)」で作成されたAIアプリやプロトタイプを一画面で一覧・共有・評価できるポータルサイト。
勉強会メンバーが誰でも新しいアプリを登録でき、リアルタイムに「いいね」やランキングが反映される仕組みを提供する。

## 2. Design System & Style Guidelines
- **Primary Color**: MINT Green (`#2EC4B6` または `#4CAF50` 周辺の爽やかな黄緑)
- **Secondary Color**: White (`#FFFFFF`) & Off-White (`#F8FAFC`)
- **Accent/Text Color**: Slate Grey (`#1E293B` / `#334155`)
- **UI Components**:
  - カード型のグリッドレイアウト（四角形のボックス配置）
  - 各カードには「タイトル」「画像または動画プレビュー」「いいねボタン＆カウント」を表示
  - カードタップ時に詳細説明を展開するモーダル（ポップアップ）ダイアログ
  - 上部に「いいねランキング順」「新着順」のソートタブ

## 3. Tech Stack
- **Framework**: Next.js (App Router, React, TypeScript)
- **Styling**: Tailwind CSS, lucide-react (Icons), shadcn/ui
- **Backend / Database**: Supabase (PostgreSQL, Realtime, Storage for images/videos)

## 4. Data Structure (Supabase Schema)

### `apps` Table
| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | 一意の識別子 (`default: gen_random_uuid()`) |
| `title` | `text` | アプリのタイトル |
| `description` | `text` | アプリの簡単な説明・概要 |
| `media_url` | `text` | デモ画像または動画のURL |
| `app_url` | `text` | アプリ本体へのリンクURL（任意） |
| `author_name` | `text` | 制作者名 |
| `likes_count` | `integer` | いいね数 (`default: 0`) |
| `created_at` | `timestamptz` | 作成日時 (`default: now()`) |

## 5. Main Features & Requirements
1. **アプリカード一覧 (Gallery View)**
   - 黄緑と白を基調としたレスポンシブなグリッド配置。
   - タイトルとメディア（画像/動画）を四角形ボックス内に収める。
2. **詳細モーダル (Detail Modal)**
   - カードをクリックするとモーダルが開き、説明文・アプリURL・制作者名を表示。
3. **いいね！＆ランキング機能 (Like & Ranking)**
   - カード上の「いいね」ボタンを押すと `likes_count` がインクリメントされる。
   - ソート切り替え（いいね順 / 新着順）によりランキング表示が可能。
4. **新規アプリ追加フォーム (App Submission Form)**
   - ヘッダーの「+ アプリを追加」ボタンからモーダルでフォームを表示。
   - タイトル、説明、制作者名、メディア（URL/ファイル）、アプリURLを入力して追加。

## 6. Coding Principles for Claude Code
- React Components は機能ごとに分割して作成する (`components/AppCard.tsx`, `components/AppModal.tsx`, `components/AddAppModal.tsx` など)。
- Tailwind CSS のカラー指定は `bg-emerald-500` やカスタム定義した MINT グリーンを使用し、統一感を保つ。
- Supabase のクライアント呼び出しは `@/lib/supabaseClient.ts` に共通化する。