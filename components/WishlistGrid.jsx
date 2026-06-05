"use client";

import AirtableImage from "@/components/AirtableImage";
import { useAddSparkBurst } from "@/components/SparkBurstProvider";

export default function WishlistGrid({ products, onOpen }) {
  const addBurst = useAddSparkBurst();

  if (!products.length) {
    return (
      <p className="rounded-3xl border border-sky-100/50 bg-gradient-to-b from-white/85 to-sky-50/50 px-6 py-12 text-center text-lg font-medium text-slate-800 shadow-md shadow-sky-200/25 backdrop-blur-xl motion-reduce:from-white motion-reduce:to-white motion-reduce:backdrop-blur-none">
        Tidak ada produk di kategori ini.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => {
        const thumb = p.imageUrls?.[0] ?? p.imageUrl ?? null;
        const unavailable = p.done === true;
        return (
        <div
          key={p.id}
          role="button"
          tabIndex={unavailable ? -1 : 0}
          aria-label={
            unavailable
              ? `${p.name}, tidak tersedia`
              : `Buka detail ${p.name}`
          }
          aria-disabled={unavailable || undefined}
          className={`group relative flex flex-col overflow-hidden rounded-3xl border text-left shadow-[0_8px_30px_-8px_rgba(56,189,248,0.18),inset_0_1px_0_0_rgba(255,255,255,0.75)] backdrop-blur-xl subpixel-antialiased transition duration-300 ease-out motion-reduce:from-white motion-reduce:via-white motion-reduce:to-white motion-reduce:shadow-md motion-reduce:backdrop-blur-none motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-sky-400/90 focus:ring-offset-2 focus:ring-offset-aira-snow motion-reduce:hover:translate-y-0 ${
            unavailable
              ? "cursor-default border-slate-200/60 bg-gradient-to-b from-slate-100/80 via-slate-50/70 to-slate-100/50 opacity-95"
              : "cursor-pointer border-sky-100/45 bg-gradient-to-b from-white/82 via-white/72 to-sky-50/40 hover:-translate-y-0.5 hover:border-sky-200/55 hover:from-white/88 hover:via-white/76 hover:to-sky-50/45 hover:shadow-[0_12px_36px_-10px_rgba(56,189,248,0.22),inset_0_1px_0_0_rgba(255,255,255,0.85)]"
          }`}
          onClick={(e) => {
            if (unavailable) return;
            addBurst(e.clientX, e.clientY);
            onOpen(p);
          }}
          onKeyDown={(e) => {
            if (unavailable) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen(p);
            }
          }}
        >
          <div className="relative z-0 aspect-square w-full overflow-hidden bg-gradient-to-b from-sky-50/40 to-white/25">
            {!thumb ? (
              <div
                className={`flex h-full w-full items-center justify-center text-sm font-medium text-slate-600 ${
                  unavailable ? "grayscale blur-[2px]" : ""
                }`}
              >
                No photo
              </div>
            ) : (
              <AirtableImage
                src={thumb}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className={`object-cover transition duration-300 ${
                  unavailable
                    ? "scale-100 grayscale blur-[3px]"
                    : "group-hover:scale-105"
                }`}
                fallbackText="No photo"
              />
            )}
            {unavailable ? (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-slate-900/25">
                <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-800 shadow-sm sm:text-sm">
                  Unavailable
                </span>
              </div>
            ) : null}
          </div>
          <div
            className={`relative z-10 flex flex-1 flex-col gap-1 border-t p-3 backdrop-blur-lg sm:p-4 motion-reduce:backdrop-blur-none ${
              unavailable
                ? "border-slate-200/50 bg-gradient-to-b from-slate-100/75 to-slate-50/55 text-slate-500"
                : "border-sky-100/50 bg-gradient-to-b from-white/78 to-sky-50/38 motion-reduce:from-white motion-reduce:to-sky-50/70"
            }`}
          >
            <span
              className={`font-display line-clamp-2 text-base font-bold leading-snug sm:text-lg ${
                unavailable ? "text-slate-500" : "text-slate-950"
              }`}
            >
              {p.name}
            </span>
            {p.brand ? (
              <span className="text-sm font-semibold text-slate-800">
                {p.brand}
              </span>
            ) : null}
            {p.warna ? (
              <span className="text-xs text-slate-700 sm:text-sm">{p.warna}</span>
            ) : null}
            <span
              className={`mt-auto pt-1 text-sm font-extrabold sm:text-base ${
                unavailable ? "text-slate-500" : "text-slate-950"
              }`}
            >
              {p.priceLabel}
            </span>
          </div>
        </div>
        );
      })}
    </div>
  );
}
