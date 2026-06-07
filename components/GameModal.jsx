"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function GameModal({ open, title, onClose, wide, compact, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Tutup"
      />
      <div
        className={`relative flex w-full flex-col overflow-hidden rounded-3xl border border-sky-100/90 bg-gradient-to-b from-white via-aira-snow to-aira-iceLight shadow-xl shadow-sky-200/40 ${
          compact
            ? "h-[calc(90dvh-2rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] max-h-[calc(90dvh-2rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))]"
            : "max-h-[calc(90dvh-2rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))]"
        } ${wide ? "max-w-lg" : compact ? "max-w-md md:max-w-xl" : "max-w-md"}`}
      >
        <div
          className={`flex shrink-0 items-start justify-between gap-3 border-b border-sky-100/80 bg-white/70 ${
            compact ? "px-4 py-2.5" : "px-5 py-4"
          }`}
        >
          <h2
            id="game-modal-title"
            className={`font-display font-bold text-aira-navy ${
              compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
            }`}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sky-200/80 bg-white text-lg font-semibold text-slate-600 transition hover:bg-sky-50 hover:text-aira-navy focus:outline-none focus:ring-2 focus:ring-sky-300"
            aria-label="Tutup game"
          >
            ×
          </button>
        </div>
        <div
          className={`flex min-h-0 flex-1 flex-col ${
            compact
              ? "overflow-hidden px-3 py-2 sm:px-4 sm:py-2.5"
              : "overflow-y-auto overscroll-contain px-5 py-5"
          }`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
