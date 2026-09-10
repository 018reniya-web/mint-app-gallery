"use client";

import { useState } from "react";
import { Lock, Sparkles, Sprout } from "lucide-react";
import type { Visibility } from "@/lib/types";

export default function Header({
  onAdd,
  mode = "public",
}: {
  onAdd: () => void;
  mode?: Visibility;
}) {
  const [logoOk, setLogoOk] = useState(true);
  const secret = mode === "secret";

  return (
    <header
      className={
        "sticky top-0 z-20 border-b backdrop-blur transition-colors " +
        (secret
          ? "border-slate-700 bg-slate-900/85"
          : "border-slate-200/70 bg-white/80")
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          {logoOk ? (
            // public/MINTlognew.png を配置すると表示される。無い場合は下のフォールバックへ。
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/MINTlognew.png"
              alt="MINT"
              className={
                "h-9 w-auto max-w-[160px] object-contain sm:h-10 " +
                (secret ? "brightness-0 invert" : "")
              }
              onError={() => setLogoOk(false)}
            />
          ) : (
            <>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-500 text-white shadow-card">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p
                  className={
                    "text-base font-bold " +
                    (secret ? "text-white" : "text-slateink")
                  }
                >
                  MINT
                </p>
                <p
                  className={
                    "text-xs " + (secret ? "text-slate-400" : "text-slateink-soft")
                  }
                >
                  Mind Innovation &amp; Next Technology
                </p>
              </div>
            </>
          )}

          {secret && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-100">
              <Lock className="h-3 w-3" />
              裏モード
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onAdd}
          className={
            "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-card transition focus:outline-none focus:ring-2 focus:ring-offset-2 " +
            (secret
              ? "bg-slate-700 hover:bg-slate-600 focus:ring-slate-500"
              : "bg-mint-500 hover:bg-mint-600 focus:ring-mint-400")
          }
        >
          <Sprout className="h-4 w-4" />
          投稿する
        </button>
      </div>
    </header>
  );
}
