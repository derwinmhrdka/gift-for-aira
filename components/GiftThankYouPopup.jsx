"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const AUTO_CLOSE_MS = 3000;

function CongratsIcon() {
  return (
    <svg
      className="mx-auto h-24 w-24 sm:h-28 sm:w-28"
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden
    >
      <circle cx="48" cy="48" r="44" fill="#E0F2FE" />
      <path
        d="M28 52c4-14 18-22 32-18 6 2 10 6 12 12"
        stroke="#F59E0B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M48 28v8M40 32l6 6M56 32l-6 6"
        stroke="#38BDF8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="24" cy="28" r="4" fill="#F472B6" />
      <circle cx="72" cy="30" r="3.5" fill="#34D399" />
      <circle cx="68" cy="58" r="4" fill="#FBBF24" />
      <circle cx="26" cy="62" r="3" fill="#A78BFA" />
      <rect x="34" y="44" width="28" height="22" rx="4" fill="#1E3A5F" />
      <path
        d="M40 50h16M40 56h12"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M48 20l-4 8h8l-4 8 6-10h-8l6-6z"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M18 44l6 4-6 4V44z" fill="#38BDF8" />
      <path d="M72 44l6 4-6 4V44z" fill="#34D399" />
      <path
        d="M30 72l4-6 4 4 6-8 4 10"
        stroke="#F472B6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function GiftThankYouPopup({ open, onClose }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      onClose();
    }, AUTO_CLOSE_MS);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gift-thanks-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Tutup"
      />
      <div
        className="relative w-full max-w-sm rounded-3xl border border-sky-100 bg-white px-8 py-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CongratsIcon />
        <h3
          id="gift-thanks-title"
          className="font-display text-2xl font-bold text-aira-navy sm:text-3xl"
        >
          Yeay, terima kasih !
        </h3>
      </div>
    </div>,
    document.body,
  );
}
