"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import Modal from "@/components/Modal";
import { addApp, updateApp, uploadMedia } from "@/lib/apps";
import { CATEGORIES } from "@/lib/types";
import type { AppItem, Category, NewAppInput } from "@/lib/types";

type FormState = {
  title: string;
  description: string;
  category: string;
  author_name: string;
  media_url: string;
  app_url: string;
};

const EMPTY: FormState = {
  title: "",
  description: "",
  category: CATEGORIES[0],
  author_name: "",
  media_url: "",
  app_url: "",
};

function toForm(app: AppItem): FormState {
  return {
    title: app.title,
    description: app.description,
    category: app.category || CATEGORIES[0],
    author_name: app.author_name,
    media_url: app.media_url ?? "",
    app_url: app.app_url ?? "",
  };
}

export default function AppFormModal({
  open,
  mode,
  target,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  target?: AppItem | null;
  onClose: () => void;
  onSaved: (app: AppItem) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // モーダルを開くたびに初期値を同期する
  useEffect(() => {
    if (!open) return;
    setForm(mode === "edit" && target ? toForm(target) : EMPTY);
    setFile(null);
    setError(null);
  }, [open, mode, target]);

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const close = () => {
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      let mediaUrl: string | null = form.media_url.trim() || null;
      if (file) mediaUrl = await uploadMedia(file);

      const payload: NewAppInput = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category as Category,
        author_name: form.author_name.trim(),
        media_url: mediaUrl,
        app_url: form.app_url.trim() || null,
      };

      const saved =
        mode === "edit" && target
          ? await updateApp(target.id, payload)
          : await addApp(payload);

      onSaved(saved);
      close();
    } catch (err) {
      console.error(err);
      setError(
        mode === "edit"
          ? "更新に失敗しました。入力内容と Supabase の設定を確認してください。"
          : "登録に失敗しました。入力内容と Supabase の設定を確認してください。"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={mode === "edit" ? "投稿を編集" : "投稿する"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="タイトル" required>
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
            placeholder="MINT ランキングボット"
          />
        </Field>

        <Field label="ジャンル" required>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <label
                key={c}
                className={
                  "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition " +
                  (form.category === c
                    ? "border-mint-500 bg-mint-500 text-white"
                    : "border-slate-200 bg-white text-slateink-soft hover:border-mint-300 hover:bg-mint-50")
                }
              >
                <input
                  type="radio"
                  name="category"
                  value={c}
                  checked={form.category === c}
                  onChange={(e) => set("category", e.target.value)}
                  className="sr-only"
                />
                {c}
              </label>
            ))}
          </div>
        </Field>

        <Field label="説明・概要" required>
          <textarea
            required
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="どんな内容か、使いどころなどを記入"
          />
        </Field>

        <Field label="制作者名" required>
          <input
            required
            value={form.author_name}
            onChange={(e) => set("author_name", e.target.value)}
            className={inputClass}
            placeholder="山田 太郎"
          />
        </Field>

        <Field label="メディア（画像 / 動画）">
          <input
            value={form.media_url}
            onChange={(e) => set("media_url", e.target.value)}
            className={inputClass}
            placeholder="https://example.com/demo.png"
            disabled={!!file}
          />
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slateink-soft transition hover:border-mint-400 hover:text-mint-600">
            <Upload className="h-4 w-4" />
            {file ? file.name : "ファイルをアップロード"}
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {file && (
            <button
              type="button"
              onClick={() => setFile(null)}
              className="mt-1 self-start text-xs text-slate-400 underline"
            >
              ファイルをクリア
            </button>
          )}
        </Field>

        <Field label="アプリURL（任意）">
          <input
            value={form.app_url}
            onChange={(e) => set("app_url", e.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-mint-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mint-600 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "edit" ? "更新する" : "登録する"}
        </button>
      </form>
    </Modal>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slateink outline-none transition focus:border-mint-400 focus:ring-2 focus:ring-mint-100";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slateink">
        {label}
        {required && <span className="ml-0.5 text-mint-600">*</span>}
      </span>
      {children}
    </label>
  );
}
