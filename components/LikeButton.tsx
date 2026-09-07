"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Spark = {
  id: number;
  content: string;
  isDot: boolean;
  style: CSSProperties;
};

const EMOJIS = ["✨", "🌟", "💫", "🌱", "⭐️"];
const DOT_COLORS = ["#facc15", "#a3e635", "#4ade80", "#2ec4b6", "#fde047"];

/**
 * 連打歓迎の「若葉マーク（🌱）」いいねボタン。
 * 押すたびに poyon バウンス + クリック位置からキラキラが外へ飛び散る。
 */
export default function LikeButton({
  count,
  onLike,
  size = "sm",
  className,
}: {
  count: number;
  onLike: () => void;
  size?: "sm" | "lg";
  className?: string;
}) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [bounce, setBounce] = useState(0);
  const seq = useRef(0);

  const burst = useCallback(() => {
    const n = 12 + Math.floor(Math.random() * 5);
    const batch: Spark[] = Array.from({ length: n }).map((_, i) => {
      seq.current += 1;
      const angle = (Math.PI * 2 * i) / n + Math.random() * 0.6;
      const dist = 34 + Math.random() * 46;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist - 14; // 上向きバイアス
      const isDot = Math.random() < 0.45;
      return {
        id: seq.current,
        isDot,
        content: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        style: {
          ["--tx" as string]: `${tx.toFixed(1)}px`,
          ["--ty" as string]: `${ty.toFixed(1)}px`,
          ["--rot" as string]: `${(Math.random() * 260 - 130).toFixed(0)}deg`,
          ["--dur" as string]: `${(0.7 + Math.random() * 0.5).toFixed(2)}s`,
          fontSize: `${(11 + Math.random() * 9).toFixed(0)}px`,
          ...(isDot
            ? {
                width: `${(5 + Math.random() * 5).toFixed(0)}px`,
                height: `${(5 + Math.random() * 5).toFixed(0)}px`,
                borderRadius: "9999px",
                background:
                  DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
                boxShadow: "0 0 6px currentColor",
              }
            : {}),
        } as CSSProperties,
      };
    });

    setSparks((prev) => [...prev, ...batch]);
    const ids = new Set(batch.map((b) => b.id));
    window.setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !ids.has(s.id)));
    }, 1300);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onLike();
      setBounce((b) => b + 1);
      burst();
    },
    [onLike, burst]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="若葉マークを送る"
      className={cn(
        "relative inline-flex select-none items-center gap-1 rounded-full border border-mint-200 bg-white font-semibold text-mint-700 shadow-sm transition hover:border-mint-400 hover:bg-mint-50 active:scale-95",
        size === "lg" ? "px-4 py-2 text-base" : "px-2.5 py-1 text-sm",
        className
      )}
    >
      <span
        key={bounce}
        className={cn(
          "leading-none",
          size === "lg" ? "text-xl" : "text-base",
          bounce > 0 && "animate-poyon"
        )}
      >
        🌱
      </span>
      <span className="tabular-nums">{count}</span>

      {/* キラキラ・パーティクル層（ボタン中心を原点に飛び散る） */}
      <span className="pointer-events-none absolute inset-0 overflow-visible">
        {sparks.map((s) => (
          <span
            key={s.id}
            className="spark"
            style={s.style}
            aria-hidden
          >
            {s.isDot ? "" : s.content}
          </span>
        ))}
      </span>
    </button>
  );
}
