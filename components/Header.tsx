"use client";

import { useState } from "react";
import { Sparkles, Sprout } from "lucide-react";

export default function Header({ onAdd }: { onAdd: () => void }) {
  const [logoOk, setLogoOk] = useState(true);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          {logoOk ? (
            // public/MINTLogo.png を配置すると表示される。無い場合は下のフォールバックへ。
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/MINTLogo.png"
              alt="MINT"
              className="h-9 w-auto max-w-[160px] object-contain sm:h-10"
              onError={() => setLogoOk(false)}
            />
          ) : (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-500 text-white shadow-card">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-base font-bold text-slateink">MINT</p>
                <p className="text-xs text-slateink-soft">
                  Mind Innovation &amp; Next Technology
                </p>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-mint-500 px-3.5 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-mint-600 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:ring-offset-2"
        >
          <Sprout className="h-4 w-4" />
          投稿する
        </button>
      </div>
    </header>
  );
}
