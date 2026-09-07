"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import SortTabs from "@/components/SortTabs";
import CategoryTabs from "@/components/CategoryTabs";
import AppCard from "@/components/AppCard";
import AppModal from "@/components/AppModal";
import AppFormModal from "@/components/AppFormModal";
import { deleteApp, fetchApps, likeApp } from "@/lib/apps";
import { supabase } from "@/lib/supabaseClient";
import { ALL_CATEGORY } from "@/lib/types";
import type { AppItem, CategoryFilter, SortKey } from "@/lib/types";

export default function Gallery() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [sort, setSort] = useState<SortKey>("likes");
  const [category, setCategory] = useState<CategoryFilter>(ALL_CATEGORY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AppItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<AppItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setApps(await fetchApps(sort, category));
    } catch (err) {
      console.error(err);
      setError("データの取得に失敗しました。Supabase の接続設定を確認してください。");
    } finally {
      setLoading(false);
    }
  }, [sort, category]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: apps テーブルの変更を購読して即時反映
  useEffect(() => {
    const channel = supabase
      .channel("apps-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "apps" },
        (payload) => {
          setApps((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as AppItem;
              return prev.some((a) => a.id === row.id) ? prev : [row, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as AppItem;
              return prev.map((a) => (a.id === row.id ? { ...a, ...row } : a));
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
      (a) => category === ALL_CATEGORY || a.category === category
    );
    list.sort((a, b) =>
      sort === "likes"
        ? b.likes_count - a.likes_count ||
          +new Date(b.created_at) - +new Date(a.created_at)
        : +new Date(b.created_at) - +new Date(a.created_at)
    );
    return list;
  }, [apps, sort, category]);

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

  return (
    <div className="relative min-h-screen">
      {/* 背景アクセント：ミントの柔らかい円形グラデーション */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-mint-300/30 blur-3xl animate-blob-drift" />
        <div
          className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl animate-blob-drift"
          style={{ animationDelay: "-6s" }}
        />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-mint-200/40 blur-3xl animate-blob-drift" />
      </div>

      <Header onAdd={() => setAddOpen(true)} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slateink">みんなのAIアプリ</h1>
          <p className="mt-1 text-sm text-slateink-soft">
            MINT 勉強会で生まれたアプリ・議事録・活用ネタを見て、試して、🌱しよう。
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <CategoryTabs value={category} onChange={setCategory} />
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">
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
          <div className="rounded-2xl border border-dashed border-mint-300 bg-white/60 py-20 text-center text-slateink-soft">
            まだ投稿がありません。「🌱 投稿する」から追加してみましょう。
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
    </div>
  );
}
