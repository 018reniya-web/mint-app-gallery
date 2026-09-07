"use client";

import { Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortKey } from "@/lib/types";

const TABS: { key: SortKey; label: string; icon: typeof Trophy }[] = [
  { key: "likes", label: "いいねランキング順", icon: Trophy },
  { key: "newest", label: "新着順", icon: Clock },
];

export default function SortTabs({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (key: SortKey) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
            value === key
              ? "bg-mint-500 text-white shadow-sm"
              : "text-slateink-soft hover:bg-mint-50"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
