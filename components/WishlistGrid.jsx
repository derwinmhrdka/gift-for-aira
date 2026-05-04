"use client";

import Image from "next/image";

export default function WishlistGrid({ products, onOpen }) {
  if (!products.length) {
    return (
      <p className="rounded-3xl bg-white/60 px-6 py-12 text-center text-lg text-stone-500">
        Tidak ada produk di kategori ini.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onOpen(p)}
          className="group flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/90 text-left shadow-md shadow-violet-100/80 ring-1 ring-violet-100/50 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-200/60 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-aira-yellow"
        >
          <div className="relative aspect-square w-full overflow-hidden bg-aira-lavender/40">
            {p.imageUrl ? (
              <Image
                src={p.imageUrl}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover transition duration-300 group-hover:scale-105"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">
                No photo
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
            <span className="font-display line-clamp-2 text-base font-semibold leading-snug text-stone-800 sm:text-lg">
              {p.name}
            </span>
            {p.brand ? (
              <span className="text-sm font-medium text-violet-700">
                {p.brand}
              </span>
            ) : null}
            {p.warna ? (
              <span className="text-xs text-stone-500 sm:text-sm">{p.warna}</span>
            ) : null}
            <span className="mt-auto pt-1 text-sm font-bold text-emerald-800 sm:text-base">
              {p.priceLabel}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
