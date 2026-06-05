"use client";

export default function ProductSortButton({ value, onChange }) {
  const isHighFirst = value === "desc";

  return (
    <button
      type="button"
      onClick={() => onChange(isHighFirst ? "asc" : "desc")}
      className="inline-flex h-[3.25rem] shrink-0 items-center justify-center gap-1.5 rounded-3xl border border-white/55 bg-white/72 px-4 text-aira-navy shadow-md shadow-slate-300/25 backdrop-blur-md transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:ring-offset-2 focus:ring-offset-aira-snow sm:h-[3.5rem] motion-reduce:bg-white/95 motion-reduce:backdrop-blur-none"
      aria-label={
        isHighFirst
          ? "Urutkan harga terendah ke tertinggi"
          : "Urutkan harga tertinggi ke terendah"
      }
      title={isHighFirst ? "Harga tertinggi" : "Harga terendah"}
    >
      <svg
        className="h-5 w-5 sm:h-6 sm:w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {isHighFirst ? (
          <>
            <path d="M4 6h6" />
            <path d="M4 12h10" />
            <path d="M4 18h14" />
            <path d="M17 8v12" />
            <path d="M14 17l3 3 3-3" />
          </>
        ) : (
          <>
            <path d="M4 6h14" />
            <path d="M4 12h10" />
            <path d="M4 18h6" />
            <path d="M17 4v12" />
            <path d="M14 7l3-3 3 3" />
          </>
        )}
      </svg>
      <span className="sr-only sm:not-sr-only sm:text-sm sm:font-semibold">
        {isHighFirst ? "Tertinggi" : "Terendah"}
      </span>
    </button>
  );
}
