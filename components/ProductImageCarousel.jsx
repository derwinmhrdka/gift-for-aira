"use client";

import AirtableImage from "@/components/AirtableImage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Satu atau beberapa foto produk — geser tombol, dot, atau swipe (touch).
 * `stopCarouselClick`: untuk kartu grid — hentikan bubbling ke `<button>` kartu.
 */
export default function ProductImageCarousel({
  images,
  alt,
  sizes,
  className = "",
  aspectClassName = "aspect-square w-full",
  stopCarouselClick = false,
}) {
  const urls = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []).filter(Boolean),
    [images],
  );
  const n = urls.length;
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    setIndex(0);
  }, [urls]);

  const clampedIndex = n ? ((index % n) + n) % n : 0;

  const prev = useCallback(() => {
    if (n <= 1) return;
    setIndex((i) => (i - 1 + n) % n);
  }, [n]);

  const next = useCallback(() => {
    if (n <= 1) return;
    setIndex((i) => (i + 1) % n);
  }, [n]);

  const wrapClick = (e) => {
    if (stopCarouselClick) e.stopPropagation();
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 48) return;
    if (dx > 0) prev();
    else next();
  };

  if (n === 0) {
    return (
      <div
        className={`relative flex items-center justify-center bg-gradient-to-b from-sky-50/40 to-white/25 text-sm font-medium text-slate-600 ${aspectClassName} ${className}`}
      >
        No photo
      </div>
    );
  }

  if (n === 1) {
    return (
      <div className={`relative overflow-hidden ${aspectClassName} ${className}`}>
        <AirtableImage
          src={urls[0]}
          alt={alt}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes={sizes}
          fallbackText="No photo"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${aspectClassName} ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{
          width: `${n * 100}%`,
          transform: `translateX(-${(clampedIndex * 100) / n}%)`,
        }}
      >
        {urls.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative h-full shrink-0 overflow-hidden"
            style={{ width: `${100 / n}%` }}
          >
            <AirtableImage
              src={url}
              alt={`${alt} (${i + 1}/${n})`}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes={sizes}
              fallbackText="No photo"
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={(e) => {
            wrapClick(e);
            prev();
          }}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-lg font-bold text-aira-navy shadow-md ring-1 ring-sky-100/80 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
          aria-label="Foto sebelumnya"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={(e) => {
            wrapClick(e);
            next();
          }}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-lg font-bold text-aira-navy shadow-md ring-1 ring-sky-100/80 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
          aria-label="Foto berikutnya"
        >
          ›
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {urls.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              wrapClick(e);
              setIndex(i);
            }}
            className={`pointer-events-auto h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/90 ${
              i === clampedIndex
                ? "w-6 bg-white shadow-sm"
                : "w-2 bg-white/55 hover:bg-white/80"
            }`}
            aria-label={`Foto ${i + 1} dari ${n}`}
            aria-current={i === clampedIndex}
          />
        ))}
      </div>
    </div>
  );
}
