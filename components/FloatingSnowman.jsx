"use client";

import AdminAccessModal from "@/components/AdminAccessModal";
import { useEffect, useRef, useState } from "react";

const IDLE_MESSAGES = [
  "Selamat datang ongkel onty ❄️",
  "Yuk coba gamesnya!",
  "Ada hadiah menarik lho 🎁",
  "Tapi kasih wish buat aku dulu yuk",
  "Terima kasih 🌈",
];

const IDLE_WAIT_MS = 5000;
const IDLE_VISIBLE_MS = 2500;

function SpeechBubble({
  children,
  interactive = false,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`absolute bottom-[calc(100%-10px)] left-0 z-[222] w-max max-w-[min(14rem,calc(100vw-2rem))] ${className}`}
    >
      <div className="relative pb-2 drop-shadow-[0_6px_20px_rgba(100,116,139,0.12)]">
        <div className="rounded-2xl border border-slate-200/70 bg-white/95 px-3.5 py-2.5">
          {interactive ? (
            <button
              type="button"
              onClick={onAction}
              className="pointer-events-auto text-left text-xs font-medium leading-relaxed text-slate-700 transition hover:text-sky-600 focus:outline-none focus-visible:underline"
            >
              {children}
            </button>
          ) : (
            <p className="text-xs font-medium leading-relaxed text-slate-700">
              {children}
            </p>
          )}
        </div>

        <svg
          aria-hidden
          className="pointer-events-none absolute left-[2.4rem] sm:left-[2.65rem]"
          style={{ top: "calc(100% - 2px)" }}
          width="14"
          height="9"
          viewBox="0 0 14 9"
        >
          <path d="M0 0 H14 L7 9 Z" fill="rgba(255,255,255,0.95)" />
        </svg>
      </div>
    </div>
  );
}

export default function FloatingSnowman() {
  const snowmanRef = useRef(null);
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
    let waitTimer;
    let hideTimer;
    let cancelled = false;

    function scheduleNextCycle() {
      waitTimer = setTimeout(() => {
        if (cancelled) return;

        setIdleMessage(IDLE_MESSAGES[messageIndex]);
        messageIndex = (messageIndex + 1) % IDLE_MESSAGES.length;
        setIdleBubbleVisible(true);

        hideTimer = setTimeout(() => {
          if (cancelled) return;
          setIdleBubbleVisible(false);
          scheduleNextCycle();
        }, IDLE_VISIBLE_MS);
      }, IDLE_WAIT_MS);
    }

    scheduleNextCycle();

    return () => {
      cancelled = true;
      clearTimeout(waitTimer);
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
          ref={snowmanRef}
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
