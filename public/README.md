# public/

静的ファイルの配置場所。ここに置いたファイルはサイトルート `/` から参照できます。

## MINTLogo.png

ヘッダー左上に表示する MINT ロゴ画像。`public/MINTLogo.png` として配置してください
（[components/Header.tsx](../components/Header.tsx) の `src` と大文字小文字を一致させること。
Linux 環境へのデプロイでは case-sensitive）。

- 推奨: 高さ 80〜120px 程度、横長、背景透過 PNG
- 表示側は `h-9`〜`h-10`（36〜40px）・`w-auto`・`object-contain` で調整
- ファイルが無い場合は自動でテキストロゴ（MINT）にフォールバックします
