# public/

静的ファイルの配置場所。ここに置いたファイルはサイトルート `/` から参照できます。

## MINTlognew.png

ヘッダー左上に表示する MINT ロゴ画像。[components/Header.tsx](../components/Header.tsx) が
`src="/MINTlognew.png"` で参照します（大文字小文字を一致させること。Linux デプロイは case-sensitive）。

- 推奨: 高さ 80〜120px 程度、横長、背景透過 PNG
- 表示側は `h-9`〜`h-10`（36〜40px）・`w-auto`・`object-contain` で調整
- ファイルが無い場合は自動でテキストロゴ（MINT）にフォールバックします
- 裏モードでは自動で白抜き表示（`brightness-0 invert`）になります

## MINTアイコン.png

ブラウザのタブ / ブックマークに表示される favicon。
[app/layout.tsx](../app/layout.tsx) の `metadata.icons` が参照します。

- 推奨: 正方形（512×512 など）、背景透過または単色
