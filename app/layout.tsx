import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MINT App Gallery",
  description:
    "社内AI勉強会「MINT」で作られたアプリ・プロトタイプを一覧・共有・評価するポータル",
  icons: {
    icon: "/MINTアイコン.png",
    shortcut: "/MINTアイコン.png",
    apple: "/MINTアイコン.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
