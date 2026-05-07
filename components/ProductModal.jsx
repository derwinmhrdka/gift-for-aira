"use client";

import ProductImageCarousel from "@/components/ProductImageCarousel";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ANIM_MS = 300;

export default function ProductModal({ product, onClose }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const closeTimerRef = useRef(null);
  const rafRef = useRef(null);

  const closeModal = useCallback(() => {
    setPanelOpen(false);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, ANIM_MS);
  }, [onClose]);

  useLayoutEffect(() => {
    if (!product) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return undefined;
    }
    setPanelOpen(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setPanelOpen(true);
      });
    });
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [product]);

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
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, closeModal]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!product || typeof document === "undefined") return null;

  const backdropClass = panelOpen ? "opacity-100" : "opacity-0";

  const panelClass = panelOpen
    ? "translate-y-0 opacity-100 sm:translate-y-0 sm:scale-100 motion-reduce:translate-y-0 motion-reduce:scale-100"
    : "translate-y-[min(100%,5.5rem)] opacity-0 sm:translate-y-6 sm:scale-[0.96] motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-0";
  const similarKeyword = [product.name, product.brand].filter(Boolean).join(" ");
  const similarSearchUrl = `https://shopee.co.id/search?keyword=${encodeURIComponent(similarKeyword)}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className={`absolute inset-0 z-0 bg-gradient-to-b from-slate-600/25 via-sky-900/20 to-white/35 backdrop-blur-md transition-opacity ease-out motion-reduce:from-slate-700/35 motion-reduce:via-slate-700/30 motion-reduce:to-slate-700/35 motion-reduce:backdrop-blur-none motion-reduce:transition-opacity motion-reduce:duration-150 ${backdropClass}`}
        style={{ transitionDuration: `${ANIM_MS}ms` }}
        onClick={closeModal}
        aria-label="Tutup"
      />
      <div
        className={`relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/70 bg-gradient-to-b from-white/96 via-white/94 to-sky-50/88 p-6 text-slate-800 shadow-[0_25px_60px_-15px_rgba(56,189,248,0.18),0_0_0_1px_rgba(255,255,255,0.65)_inset] shadow-sky-200/35 backdrop-blur-2xl subpixel-antialiased ring-1 ring-white/80 transition-[opacity,transform] ease-out motion-reduce:from-white motion-reduce:via-white motion-reduce:to-white motion-reduce:shadow-xl motion-reduce:ring-0 motion-reduce:transition-opacity motion-reduce:duration-150 ${panelClass}`}
        style={{ transitionDuration: `${ANIM_MS}ms` }}
      >
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 z-[60] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/95 text-lg font-semibold text-slate-700 shadow-md shadow-sky-200/30 backdrop-blur-sm transition hover:bg-white hover:text-aira-navy focus:outline-none focus:ring-2 focus:ring-sky-400/80 motion-reduce:bg-white"
          aria-label="Tutup"
        >
          ✕
        </button>

        <div className="relative z-0 overflow-hidden rounded-3xl border border-white/70 bg-white/75 shadow-inner shadow-white/40 backdrop-blur-md motion-reduce:bg-white motion-reduce:backdrop-blur-none">
          <ProductImageCarousel
            images={
              product.imageUrls?.length
                ? product.imageUrls
                : product.imageUrl
                  ? [product.imageUrl]
                  : []
            }
            alt={product.name}
            sizes="(max-width: 768px) 100vw, 512px"
            aspectClassName="aspect-[4/3] w-full"
          />
        </div>

        <h2
          id="modal-title"
          className="font-display mt-5 text-3xl font-bold tracking-tight text-aira-navy sm:text-4xl"
        >
          {product.name}
        </h2>
        {product.brand ? (
          <p className="mt-2 text-base font-semibold text-sky-900 sm:text-lg">
            {product.brand}
          </p>
        ) : null}
        {product.warna ? (
          <p className="mt-1.5 text-sm text-slate-700 sm:text-base">
            <span className="font-semibold text-sky-950">Warna: </span>
            {product.warna}
          </p>
        ) : null}
        <p className="mt-3 text-xl font-extrabold text-aira-navy sm:text-2xl">
          {product.priceLabel}
        </p>
        {product.categories?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {product.categories.map((c) => (
              <span
                key={c}
                className="rounded-full border border-sky-200/60 bg-white/90 px-3 py-1.5 text-sm font-semibold text-aira-navy shadow-sm backdrop-blur-sm motion-reduce:bg-white motion-reduce:backdrop-blur-none"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}

        {product.summary ? (
          <p className="mt-5 rounded-2xl border border-sky-100/80 bg-gradient-to-br from-white/95 to-sky-50/90 px-4 py-3 text-base font-medium leading-relaxed text-slate-800 shadow-sm backdrop-blur-sm sm:text-lg motion-reduce:from-white motion-reduce:to-sky-50 motion-reduce:backdrop-blur-none">
            {product.summary}
          </p>
        ) : null}
        {product.description ? (
          <p className="mt-5 whitespace-pre-wrap text-base leading-relaxed text-slate-700 sm:text-lg">
            {product.description}
          </p>
        ) : !product.summary ? (
          <p className="mt-5 text-base italic text-slate-600/95">
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
                className="font-display inline-flex min-w-0 flex-1 items-center justify-center rounded-3xl bg-aira-navySoft px-5 py-3.5 text-center text-base font-bold text-white shadow-md transition hover:bg-aira-navy focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
              >
                {label}
              </a>
            );
          })}
        </div>
        <a
          href={similarSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display mt-3 inline-flex w-full items-center justify-center rounded-3xl border border-orange-300 bg-white/85 px-5 py-3 text-center text-sm font-bold text-orange-600 shadow-sm transition hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
        >
          Cari Produk Serupa
        </a>
      </div>
    </div>,
    document.body,
  );
}
