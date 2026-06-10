"use client";

import AdminAccessModal from "@/components/AdminAccessModal";
import { useEffect, useState } from "react";

const IDLE_MESSAGES = [
  "Selamat datang ongkel onty",
  "Yuk coba gamesnya",
  "Ada hadiah menarik lho",
  "Tapi kasih wish buat aku dulu yuk",
  "Terima kasih",
];

const IDLE_INTERVAL_MS = 5000;
const IDLE_VISIBLE_MS = 1000;

function SpeechBubbleTail() {
  return (
    <svg
      aria-hidden
      className="absolute -bottom-[10px] left-5"
      width="24"
      height="14"
      viewBox="0 0 24 14"
      fill="none"
    >
      <path
        d="M3 1.5C7.5 1.5 11.5 2.5 16 1.5C13.5 5 10 8.5 4.5 12.5C6.5 9.5 6 4.5 3 1.5Z"
        fill="rgba(255,255,255,0.95)"
        stroke="rgba(203,213,225,0.7)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpeechBubble({ children, interactive = false, onAction, className = "" }) {
  return (
    <div
      className={`absolute bottom-full left-0 z-[222] mb-1 w-max max-w-[min(14rem,calc(100vw-2rem))] ${className}`}
    >
      <div className="relative rounded-[1.25rem] border border-slate-300/70 bg-white/95 px-3.5 py-2 shadow-[0_6px_20px_rgba(100,116,139,0.12)] backdrop-blur-[2px]">
        {interactive ? (
          <button
            type="button"
            onClick={onAction}
            className="pointer-events-auto text-left text-xs font-medium leading-snug text-slate-700 transition hover:text-sky-600 focus:outline-none focus-visible:underline"
          >
            {children}
          </button>
        ) : (
          <p className="text-xs font-medium leading-snug text-slate-700">{children}</p>
        )}
        <SpeechBubbleTail />
      </div>
    </div>
  );
}

export default function FloatingSnowman() {
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [idleBubbleVisible, setIdleBubbleVisible] = useState(false);
  const [idleMessage, setIdleMessage] = useState(IDLE_MESSAGES[0]);

  const isInteractive = bubbleOpen || modalOpen;

  useEffect(() => {
    if (isInteractive) {
      setIdleBubbleVisible(false);
      return undefined;
    }

    let messageIndex = 0;
    let hideTimer;

    function showNextIdleBubble() {
      setIdleMessage(IDLE_MESSAGES[messageIndex]);
      messageIndex = (messageIndex + 1) % IDLE_MESSAGES.length;
      setIdleBubbleVisible(true);

      hideTimer = setTimeout(() => {
        setIdleBubbleVisible(false);
      }, IDLE_VISIBLE_MS);
    }

    const interval = setInterval(showNextIdleBubble, IDLE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, [isInteractive]);

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
        {bubbleOpen ? (
          <SpeechBubble interactive onAction={openAdminModal}>
            Masuk ke mode admin?
          </SpeechBubble>
        ) : null}

        {!bubbleOpen && !modalOpen && idleBubbleVisible ? (
          <SpeechBubble className="pointer-events-none">
            {idleMessage}
          </SpeechBubble>
        ) : null}

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
