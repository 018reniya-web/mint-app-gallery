"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import Header from "@/components/Header";
import SortTabs from "@/components/SortTabs";
import CategoryTabs from "@/components/CategoryTabs";
import AppCard from "@/components/AppCard";
import AppModal from "@/components/AppModal";
import AppFormModal from "@/components/AppFormModal";
import CommandBar, { type CommandResult } from "@/components/CommandBar";
import { deleteApp, fetchApps, likeApp } from "@/lib/apps";
import { supabase } from "@/lib/supabaseClient";
import { ALL_CATEGORY } from "@/lib/types";
import type { AppItem, CategoryFilter, SortKey, Visibility } from "@/lib/types";

const MODE_KEY = "mint:mode";

export default function Gallery() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [sort, setSort] = useState<SortKey>("likes");
  const [category, setCategory] = useState<CategoryFilter>(ALL_CATEGORY);
  const [mode, setMode] = useState<Visibility>("public");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AppItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<AppItem | null>(null);

  // 購読クロージャから最新の mode を参照するための ref
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // 直前のモードを復元（裏モードのまま再読み込みしても維持される）
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY);
      if (saved === "secret" || saved === "public") setMode(saved);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* noop */
    }
  }, [mode]);

  const secret = mode === "secret";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setApps(await fetchApps(sort, category, mode));
    } catch (err) {
      console.error(err);
      setError("データの取得に失敗しました。Supabase の接続設定を確認してください。");
    } finally {
      setLoading(false);
    }
  }, [sort, category, mode]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: apps テーブルの変更を購読して即時反映（現在のモードのみ）
  useEffect(() => {
    const channel = supabase
      .channel("apps-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "apps" },
        (payload) => {
          const current = modeRef.current;
          setApps((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as AppItem;
              if (row.visibility !== current) return prev;
              return prev.some((a) => a.id === row.id) ? prev : [row, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as AppItem;
              if (row.visibility !== current) {
                return prev.filter((a) => a.id !== row.id);
              }
              return prev.some((a) => a.id === row.id)
                ? prev.map((a) => (a.id === row.id ? { ...a, ...row } : a))
                : [row, ...prev];
            }
            if (payload.eventType === "DELETE") {
              const old = payload.old as { id: string };
              return prev.filter((a) => a.id !== old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const visibleApps = useMemo(() => {
    const list = apps.filter(
      (a) =>
        a.visibility === mode &&
        (category === ALL_CATEGORY || a.category === category)
    );
    list.sort((a, b) =>
      sort === "likes"
        ? b.likes_count - a.likes_count ||
          +new Date(b.created_at) - +new Date(a.created_at)
        : +new Date(b.created_at) - +new Date(a.created_at)
    );
    return list;
  }, [apps, sort, category, mode]);

  const handleLike = useCallback(async (app: AppItem) => {
    // 連打歓迎：制限なしで毎回インクリメント（楽観的更新）
    setApps((prev) =>
      prev.map((a) =>
        a.id === app.id ? { ...a, likes_count: a.likes_count + 1 } : a
      )
    );
    setSelected((s) =>
      s && s.id === app.id ? { ...s, likes_count: s.likes_count + 1 } : s
    );

    try {
      await likeApp(app.id);
    } catch (err) {
      console.error(err);
      setApps((prev) =>
        prev.map((a) =>
          a.id === app.id ? { ...a, likes_count: Math.max(0, a.likes_count - 1) } : a
        )
      );
    }
  }, []);

  const handleDelete = useCallback(async (app: AppItem) => {
    if (!window.confirm(`「${app.title}」を本当に削除しますか？`)) return;

    const snapshot = app;
    setApps((prev) => prev.filter((a) => a.id !== app.id));
    setSelected((s) => (s && s.id === app.id ? null : s));
    setEditing((e) => (e && e.id === app.id ? null : e));

    try {
      await deleteApp(app.id);
    } catch (err) {
      console.error(err);
      window.alert("削除に失敗しました。時間をおいて再度お試しください。");
      setApps((prev) =>
        prev.some((a) => a.id === snapshot.id) ? prev : [snapshot, ...prev]
      );
    }
  }, []);

  const handleSaved = useCallback((app: AppItem) => {
    setApps((prev) => {
      const exists = prev.some((a) => a.id === app.id);
      return exists
        ? prev.map((a) => (a.id === app.id ? { ...a, ...app } : a))
        : [app, ...prev];
    });
    setSelected((s) => (s && s.id === app.id ? { ...s, ...app } : s));
  }, []);

  // コマンドバーからの入力を処理する
  const handleCommand = useCallback(
    (raw: string): CommandResult => {
      const cmd = raw.trim().toLowerCase();
      if (["ura", "裏", "裏投稿", "secret", "うら"].includes(cmd)) {
        setMode("secret");
        return { ok: true, message: "🔒 裏投稿モードに切り替えました" };
      }
      if (
        ["omote", "表", "おもて", "exit", "quit", "public", "back"].includes(cmd)
      ) {
        setMode("public");
        return { ok: true, message: "通常（表）モードに戻りました" };
      }
      if (["help", "?", "ヘルプ", "コマンド"].includes(cmd)) {
        return {
          ok: false,
          message:
            "ura / 裏 → 裏投稿モード ・ omote / 表 → 通常モード",
        };
      }
      return { ok: false, message: `不明なコマンド: ${raw}` };
    },
    []
  );

  return (
    <div className={"relative min-h-screen " + (secret ? "bg-slate-950" : "")}>
      {/* 背景アクセント */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {secret ? (
          <>
            <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-slate-700/40 blur-3xl animate-blob-drift" />
            <div
              className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-indigo-900/40 blur-3xl animate-blob-drift"
              style={{ animationDelay: "-6s" }}
            />
          </>
        ) : (
          <>
            <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-mint-300/30 blur-3xl animate-blob-drift" />
            <div
              className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl animate-blob-drift"
              style={{ animationDelay: "-6s" }}
            />
            <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-mint-200/40 blur-3xl animate-blob-drift" />
          </>
        )}
      </div>

      <Header onAdd={() => setAddOpen(true)} mode={mode} />

      {secret && (
        <div className="border-b border-slate-700 bg-slate-900 text-slate-100">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6">
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-mint-400" />
              裏投稿モード — ここでの投稿は裏モードでのみ表示されます
            </span>
            <button
              type="button"
              onClick={() => setMode("public")}
              className="rounded-md border border-slate-600 px-2.5 py-1 text-xs font-semibold transition hover:bg-slate-800"
            >
              表に戻る
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1
            className={
              "text-2xl font-bold " + (secret ? "text-white" : "text-slateink")
            }
          >
            {secret ? "裏・みんなのAIアプリ" : "みんなのAIアプリ"}
          </h1>
          <p
            className={
              "mt-1 text-sm " + (secret ? "text-slate-400" : "text-slateink-soft")
            }
          >
            {secret
              ? "内輪向けの裏チャンネル。表には出ません。"
              : "MINT 勉強会で生まれたアプリ・議事録・活用ネタを見て、試して、🌱しよう。"}
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <CategoryTabs value={category} onChange={setCategory} />
          <div className="flex items-center justify-between">
            <span
              className={
                "text-sm " + (secret ? "text-slate-500" : "text-slate-400")
              }
            >
              {visibleApps.length} 件
            </span>
            <SortTabs value={sort} onChange={setSort} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24 text-mint-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : visibleApps.length === 0 ? (
          <div
            className={
              "rounded-2xl border border-dashed py-20 text-center " +
              (secret
                ? "border-slate-700 bg-slate-900/60 text-slate-400"
                : "border-mint-300 bg-white/60 text-slateink-soft")
            }
          >
            {secret
              ? "裏投稿はまだありません。「投稿する」から追加してみましょう。"
              : "まだ投稿がありません。「🌱 投稿する」から追加してみましょう。"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onOpen={() => setSelected(app)}
                onLike={() => handleLike(app)}
                onEdit={() => setEditing(app)}
                onDelete={() => handleDelete(app)}
              />
            ))}
          </div>
        )}
      </main>

      <AppModal
        app={selected}
        onClose={() => setSelected(null)}
        onLike={() => selected && handleLike(selected)}
        onEdit={() => {
          if (selected) {
            setEditing(selected);
            setSelected(null);
          }
        }}
        onDelete={() => {
          if (selected) handleDelete(selected);
        }}
      />

      <AppFormModal
        open={addOpen}
        mode="create"
        visibility={mode}
        onClose={() => setAddOpen(false)}
        onSaved={handleSaved}
      />

      <AppFormModal
        open={!!editing}
        mode="edit"
        target={editing}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
      />

      <CommandBar mode={mode} onCommand={handleCommand} />
    </div>
  );
}
