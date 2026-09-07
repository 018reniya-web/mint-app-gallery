"use client";

import { ImageOff, Pencil, Trash2 } from "lucide-react";
import { isVideoUrl } from "@/lib/utils";
import CategoryBadge from "@/components/CategoryBadge";
import LikeButton from "@/components/LikeButton";
import type { AppItem } from "@/lib/types";

export default function AppCard({
  app,
  onOpen,
  onLike,
  onEdit,
  onDelete,
}: {
  app: AppItem;
  onOpen: () => void;
  onLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      onClick={onOpen}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/85 shadow-card backdrop-blur transition hover:-translate-y-0.5 hover:border-mint-300 hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-mint-50">
        {app.media_url ? (
          isVideoUrl(app.media_url) ? (
            <video
              src={app.media_url}
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={app.media_url}
              alt={app.title}
              className="h-full w-full object-cover transition group-hover:scale-[1.03]"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-mint-300">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        <CategoryBadge
          category={app.category}
          className="absolute left-3 top-3 shadow-sm"
        />

        {/* ホバーで表示される編集 / 削除 */}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            aria-label="編集"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="rounded-lg bg-white/90 p-1.5 text-slateink-soft shadow-sm transition hover:text-mint-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="削除"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-lg bg-white/90 p-1.5 text-rose-500 shadow-sm transition hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-bold text-slateink">{app.title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-slateink-soft">
          {app.description}
        </p>

        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-slate-400">by {app.author_name}</span>
          <LikeButton count={app.likes_count} onLike={onLike} />
        </div>
      </div>
    </article>
  );
}
