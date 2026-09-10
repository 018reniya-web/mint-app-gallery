"use client";

import { useEffect, useRef, useState } from "react";
import { TerminalSquare } from "lucide-react";
import type { Visibility } from "@/lib/types";

export type CommandResult = { ok: boolean; message: string };

/**
 * コマンド入力バー。
 * `Alt + M`（または画面右下の小さなボタン）で開閉し、
 * コマンドを打つと表 / 裏の投稿モードを切り替えられる。
 *
 * 使えるコマンド:
 *   ura / 裏 / 裏投稿   → 裏投稿モードへ
 *   omote / 表 / exit  → 通常（表）モードへ
 *   help / ?           → ヘルプ表示
 */
export default function CommandBar({
  mode,
  onCommand,
}: {
  mode: Visibility;
  onCommand: (raw: string) => CommandResult;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<CommandResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Alt + M でトグル / Escape で閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setFeedback(null);
      // レンダー後にフォーカス
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setValue("");
    }
  }, [open]);

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = value.trim();
    if (!raw) return;
    const result = onCommand(raw);
    setFeedback(result);
    if (result.ok) {
      setValue("");
      // モード切り替え成功時は少し見せてから閉じる
      window.setTimeout(() => setOpen(false), 700);
    }
  };

  return (
    <>
      {/* 右下の控えめな起動ボタン */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="コマンドバーを開く"
        title="コマンドバー (Alt+M)"
        className="fixed bottom-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-500 shadow-card backdrop-blur transition hover:text-slate-900"
      >
        <TerminalSquare className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 pt-24 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl border border-slate-700 bg-slate-900 font-mono text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={run} className="flex items-center gap-2 px-4 py-3">
              <span className="select-none text-mint-400">
                {mode === "secret" ? "裏$" : "$"}
              </span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="コマンドを入力（例: ura / 裏, omote / 表, help）"
                spellCheck={false}
                autoComplete="off"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
            </form>

            <div className="border-t border-slate-800 px-4 py-2 text-xs">
              {feedback ? (
                <span
                  className={feedback.ok ? "text-mint-400" : "text-rose-400"}
                >
                  {feedback.message}
                </span>
              ) : (
                <span className="text-slate-500">
                  Alt+M で開閉 ・ Enter で実行 ・ Esc で閉じる
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
