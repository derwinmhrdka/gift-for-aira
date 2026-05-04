"use client";

export default function CategoryPills({ categories, active, onSelect }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 px-1 py-2">
      <button
        type="button"
        onClick={() => onSelect("all")}
        className={`font-display rounded-full px-5 py-2.5 text-base font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-aira-yellow ${
          active === "all"
            ? "bg-gradient-to-r from-violet-300 to-fuchsia-200 text-violet-900"
            : "bg-white/80 text-stone-600 hover:bg-white"
        }`}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`font-display rounded-full px-5 py-2.5 text-base font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-aira-yellow ${
            active === cat
              ? "bg-gradient-to-r from-emerald-300 to-teal-200 text-emerald-900"
              : "bg-white/80 text-stone-600 hover:bg-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
