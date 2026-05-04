"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function ProductModal({ product, onClose }) {
  useEffect(() => {
    if (!product) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [product]);

  useEffect(() => {
    if (!product) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-stone-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-label="Tutup"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/60 bg-aira-pink/95 p-6 shadow-2xl shadow-violet-200/50 transition duration-300 ease-out sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-[60] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white text-stone-600 shadow-lg ring-1 ring-stone-200/80 transition hover:bg-stone-50 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
          aria-label="Tutup"
        >
          ✕
        </button>

        <div className="relative z-0 overflow-hidden rounded-3xl bg-white/60 ring-1 ring-white/80">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={800}
              height={600}
              className="aspect-[4/3] w-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-aira-lavender/50 text-base text-stone-400">
              No image
            </div>
          )}
        </div>

        <h2
          id="modal-title"
          className="font-display mt-5 text-3xl font-bold tracking-tight text-stone-800 sm:text-4xl"
        >
          {product.name}
        </h2>
        {product.brand ? (
          <p className="mt-2 text-base font-medium text-violet-700 sm:text-lg">
            {product.brand}
          </p>
        ) : null}
        {product.warna ? (
          <p className="mt-1.5 text-sm text-stone-500 sm:text-base">
            <span className="font-semibold text-stone-600">Warna: </span>
            {product.warna}
          </p>
        ) : null}
        <p className="mt-3 text-xl font-bold text-emerald-800 sm:text-2xl">
          {product.priceLabel}
        </p>
        {product.categories?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {product.categories.map((c) => (
              <span
                key={c}
                className="rounded-full bg-aira-mint/80 px-3 py-1.5 text-sm font-semibold text-emerald-900"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}

        {product.summary ? (
          <p className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-3 text-base font-medium leading-relaxed text-stone-700 sm:text-lg">
            {product.summary}
          </p>
        ) : null}
        {product.description ? (
          <p className="mt-5 whitespace-pre-wrap text-base leading-relaxed text-stone-600 sm:text-lg">
            {product.description}
          </p>
        ) : !product.summary ? (
          <p className="mt-5 text-base italic text-stone-400">
            Belum ada deskripsi.
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {product.shopeeUrl ? (
            <a
              href={product.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display inline-flex flex-1 items-center justify-center rounded-3xl bg-orange-400 px-5 py-3.5 text-center text-base font-bold text-white shadow-md transition hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
            >
              Beli di Shopee
            </a>
          ) : null}
          {product.tokopediaUrl ? (
            <a
              href={product.tokopediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display inline-flex flex-1 items-center justify-center rounded-3xl bg-green-500 px-5 py-3.5 text-center text-base font-bold text-white shadow-md transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
            >
              Beli di Tokped
            </a>
          ) : null}
          {product.marketplaceOtherUrls?.map((href, i) => {
            let label = "Buka link";
            try {
              label = new URL(href).hostname.replace(/^www\./, "");
            } catch {
              /* keep label */
            }
            return (
              <a
                key={href + String(i)}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display inline-flex min-w-0 flex-1 items-center justify-center rounded-3xl bg-stone-600 px-5 py-3.5 text-center text-base font-bold text-white shadow-md transition hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
              >
                {label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
