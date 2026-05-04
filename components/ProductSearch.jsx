"use client";

export default function ProductSearch({ value, onChange }) {
  return (
    <div className="mb-6 w-full sm:mb-8">
      <label htmlFor="product-search" className="sr-only">
        Cari produk
      </label>
      <div className="relative mx-auto max-w-2xl">
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          aria-hidden
        >
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </span>
        <input
          id="product-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          placeholder="Cari nama, merk, warna, deskripsi…"
          className="font-display w-full rounded-3xl border border-white/80 bg-white/90 py-3.5 pl-12 pr-12 text-base text-stone-800 shadow-md shadow-violet-100/60 ring-1 ring-violet-100/40 placeholder:text-stone-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-aira-yellow sm:py-4 sm:pl-14 sm:text-lg"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
            aria-label="Hapus pencarian"
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
}
