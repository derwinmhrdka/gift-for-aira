"use client";

import AdminAccessModal from "@/components/AdminAccessModal";
import { useState } from "react";

function AdminSpeechBubble({ onOpenModal }) {
  return (
    <div className="pointer-events-auto absolute bottom-full left-0 z-[222] mb-2 w-max max-w-[min(14rem,calc(100vw-2rem))]">
      <div className="relative rounded-2xl border-2 border-slate-900 bg-white px-3.5 py-2.5 shadow-[3px_4px_0_rgba(15,23,42,0.18)]">
        <button
          type="button"
          onClick={onOpenModal}
          className="text-left text-xs font-semibold leading-snug text-slate-900 transition hover:text-sky-700 focus:outline-none focus-visible:underline"
        >
          Masuk ke mode admin?
        </button>
        <span
          aria-hidden
          className="absolute -bottom-[11px] left-5 h-0 w-0 border-l-[11px] border-r-[7px] border-t-[12px] border-l-transparent border-r-transparent border-t-slate-900"
        />
        <span
          aria-hidden
          className="absolute -bottom-[7px] left-[23px] h-0 w-0 border-l-[8px] border-r-[5px] border-t-[9px] border-l-transparent border-r-transparent border-t-white"
        />
      </div>
    </div>
  );
}

export default function FloatingSnowman() {
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  function toggleBubble() {
    setBubbleOpen((prev) => !prev);
  }

  function closeBubble() {
    setBubbleOpen(false);
  }

  function openAdminModal() {
    setBubbleOpen(false);
    setModalOpen(true);
  }

  function closeAdminModal() {
    setModalOpen(false);
  }

  return (
    <>
      {bubbleOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[219] cursor-default bg-transparent"
          onClick={closeBubble}
          aria-label="Tutup bubble admin"
        />
      ) : null}

      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-[220]">
        {bubbleOpen ? <AdminSpeechBubble onOpenModal={openAdminModal} /> : null}

        <button
          type="button"
          onClick={toggleBubble}
          className="relative block cursor-pointer bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
          aria-label="Snowman"
          aria-expanded={bubbleOpen}
        >
          <img
            src="/snowman-90.gif"
            alt=""
            width={90}
            height={90}
            className="pointer-events-none h-[4.5rem] w-auto sm:h-24"
            decoding="async"
          />
        </button>
      </div>

      <AdminAccessModal open={modalOpen} onClose={closeAdminModal} />
    </>
  );
}
