import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  自作アプリ: "bg-mint-100 text-mint-800",
  議事録: "bg-sky-100 text-sky-800",
  活用ネタ: "bg-amber-100 text-amber-800",
  課題相談: "bg-rose-100 text-rose-800",
  AI使ってみた: "bg-violet-100 text-violet-800",
};

export default function CategoryBadge({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        STYLES[category] ?? "bg-slate-100 text-slate-700",
        className
      )}
    >
      {category}
    </span>
  );
}
