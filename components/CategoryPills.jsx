"use client";

import { useAddSparkBurst } from "@/components/SparkBurstProvider";

export default function CategoryPills({ categories, active, onSelect }) {
  const addBurst = useAddSparkBurst();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 px-1 py-2">
      <button
        type="button"
        onClick={(e) => {
          addBurst(e.clientX, e.clientY);
          onSelect("all");
        }}
        className={`font-display rounded-full px-5 py-2.5 text-base font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-aira-snow ${
          active === "all"
            ? "bg-gradient-to-r from-sky-200 to-blue-100 text-slate-950 shadow-sky-200/50"
            : "border border-white/55 bg-white/68 text-slate-800 shadow-sm backdrop-blur-sm hover:bg-white/80 motion-reduce:bg-white/95 motion-reduce:backdrop-blur-none"
        }`}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={(e) => {
            addBurst(e.clientX, e.clientY);
            onSelect(cat);
          }}
          className={`font-display rounded-full px-5 py-2.5 text-base font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-aira-snow ${
            active === cat
              ? "bg-gradient-to-r from-sky-200 to-blue-100 text-slate-950 shadow-sky-200/50"
              : "border border-white/55 bg-white/68 text-slate-800 shadow-sm backdrop-blur-sm hover:bg-white/80 motion-reduce:bg-white/95 motion-reduce:backdrop-blur-none"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
