"use client";

import { cn } from "@/lib/utils";
import { ALL_CATEGORY, CATEGORIES } from "@/lib/types";
import type { CategoryFilter } from "@/lib/types";

const ITEMS: CategoryFilter[] = [ALL_CATEGORY, ...CATEGORIES];

export default function CategoryTabs({
  value,
  onChange,
}: {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ITEMS.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
            value === item
              ? "border-mint-500 bg-mint-500 text-white shadow-sm"
              : "border-slate-200 bg-white/70 text-slateink-soft backdrop-blur hover:border-mint-300 hover:bg-mint-50"
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
