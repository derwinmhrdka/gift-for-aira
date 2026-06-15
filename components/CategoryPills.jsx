"use client";

import { useAddSparkBurst } from "@/components/SparkBurstProvider";

const PILL_BASE =
  "font-display rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-aira-snow sm:px-5 sm:py-2.5 sm:text-base";

function pillClass(active, activeStyle, inactiveStyle) {
  return `${PILL_BASE} ${
    active ? activeStyle : inactiveStyle
  }`;
}

const PILL_ACTIVE =
  "bg-gradient-to-r from-sky-200 to-blue-100 text-slate-950 shadow-sky-200/50";
const PILL_INACTIVE =
  "border border-white/55 bg-white/68 text-slate-800 shadow-sm backdrop-blur-sm hover:bg-white/80 motion-reduce:bg-white/95 motion-reduce:backdrop-blur-none";
const PILL_RESERVED_ACTIVE =
  "border border-white/70 bg-gradient-to-r from-aira-ice via-aira-frost to-aira-iceLight text-aira-navy shadow-[0_4px_14px_-6px_rgba(197,221,240,0.85)]";
const PILL_RESERVED_INACTIVE =
  "border border-aira-ice/55 bg-aira-iceLight/75 text-aira-navySoft shadow-sm backdrop-blur-sm hover:border-aira-ice/70 hover:bg-aira-frost/90 motion-reduce:bg-aira-iceLight/90 motion-reduce:backdrop-blur-none";

export default function CategoryPills({
  categories,
  active,
  onSelect,
  reservedCount = 0,
  reservedFilterValue = "__reserved__",
}) {
  const addBurst = useAddSparkBurst();

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 px-1 py-1.5 sm:gap-2 sm:py-2">
      <button
        type="button"
        onClick={(e) => {
          addBurst(e.clientX, e.clientY);
          onSelect("all");
        }}
        className={pillClass(active === "all", PILL_ACTIVE, PILL_INACTIVE)}
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
          className={pillClass(active === cat, PILL_ACTIVE, PILL_INACTIVE)}
        >
          {cat}
        </button>
      ))}
      {reservedCount > 0 ? (
        <button
          type="button"
          onClick={(e) => {
            addBurst(e.clientX, e.clientY);
            onSelect(reservedFilterValue);
          }}
          className={pillClass(
            active === reservedFilterValue,
            PILL_RESERVED_ACTIVE,
            PILL_RESERVED_INACTIVE,
          )}
        >
          Sudah Dibeli
        </button>
      ) : null}
    </div>
  );
}
