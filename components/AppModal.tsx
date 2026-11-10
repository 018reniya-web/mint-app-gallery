"use client";

import { ExternalLink, FileText, Pencil, Trash2, User } from "lucide-react";
import Modal from "@/components/Modal";
import CategoryBadge from "@/components/CategoryBadge";
import LikeButton from "@/components/LikeButton";
import { formatRelativeDate, isVideoUrl } from "@/lib/utils";
import type { AppItem } from "@/lib/types";

export default function AppModal({
  app,
  onClose,
  onLike,
  onEdit,
  onDelete,
}: {
  app: AppItem | null;
  onClose: () => void;
  onLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal
      open={!!app}
      onClose={onClose}
      title={app?.title}
      size={app?.pdf_url ? "xl" : "md"}
    >
      {app && (
        <div
          className={
            app.pdf_url ? "grid gap-6 lg:grid-cols-2" : "flex flex-col gap-4"
          }
        >
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-mint-50">
              {app.media_url ? (
                isVideoUrl(app.media_url) ? (
                  <video
                    src={app.media_url}
                    controls
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={app.media_url}
                    alt={app.title}
                    className="aspect-video w-full object-cover"
                  />
                )
              ) : (
                <div className="aspect-video w-full" />
              )}
            </div>

            <div>
              <CategoryBadge category={app.category} />
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slateink-soft">
              {app.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <User className="h-4 w-4" />
                {app.author_name}
              </span>
              <span>{formatRelativeDate(app.created_at)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
              <LikeButton count={app.likes_count} onLike={onLike} size="lg" />

              {app.app_url && (
                <a
                  href={app.app_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slateink px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slateink-soft"
                >
                  <ExternalLink className="h-4 w-4" />
                  アプリを開く
                </a>
              )}

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slateink-soft transition hover:border-mint-400 hover:text-mint-600"
                >
                  <Pencil className="h-4 w-4" />
                  編集
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-400 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  削除
                </button>
              </div>
            </div>
          </div>

          {app.pdf_url && <PdfPanel url={app.pdf_url} title={app.title} />}
        </div>
      )}
    </Modal>
  );
}

/** 資料 PDF の表示枠。PC では右カラム、スマホでは詳細の下に縦並び */
function PdfPanel({ url, title }: { url: string; title: string }) {
  return (
    <section className="flex flex-col gap-2 border-t border-slate-100 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slateink">
          <FileText className="h-4 w-4 text-mint-600" />
          資料（PDF）
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-mint-600 hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          新しいタブで開く
        </a>
      </div>
      <iframe
        src={url}
        title={`${title} の資料`}
        className="h-[70vh] w-full rounded-xl border border-slate-100 bg-slate-50"
      />
    </section>
  );
}
