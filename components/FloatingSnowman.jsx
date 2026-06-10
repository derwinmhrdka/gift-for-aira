"use client";

import AdminAccessModal from "@/components/AdminAccessModal";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const IDLE_MESSAGES = [
  "Selamat datang ongkel onty ❄️",
  "Yuk coba gamesnya!",
  "Ada hadiah menarik lho 🎁",
  "Tapi kasih wish buat aku dulu yuk",
  "Terima kasih 🌈",
];

const IDLE_WAIT_MS = 5000;
const IDLE_VISIBLE_MS = 2500;

const BUBBLE_RADIUS = 14;
const TAIL_LENGTH = 9;
const TAIL_LEFT = 26;
const TAIL_RIGHT = 42;
const TAIL_TIP = 34;

function createSpeechBubblePath(width, height) {
  const w = width;
  const h = height;
  const r = BUBBLE_RADIUS;

  return [
    `M ${r} 0.5`,
    `L ${w - r} 0.5`,
    `Q ${w - 0.5} 0.5 ${w - 0.5} ${r}`,
    `L ${w - 0.5} ${h - r}`,
    `Q ${w - 0.5} ${h - 0.5} ${w - r} ${h - 0.5}`,
    `L ${TAIL_RIGHT} ${h - 0.5}`,
    `L ${TAIL_TIP} ${h + TAIL_LENGTH}`,
    `L ${TAIL_LEFT} ${h - 0.5}`,
    `L ${r} ${h - 0.5}`,
    `Q 0.5 ${h - 0.5} 0.5 ${h - r}`,
    `L 0.5 ${r}`,
    `Q 0.5 0.5 ${r} 0.5`,
    "Z",
  ].join(" ");
}

function SpeechBubble({
  children,
  interactive = false,
  onAction,
  className = "",
}) {
  const contentRef = useRef(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return undefined;

    function measure() {
      const rect = node.getBoundingClientRect();
      setDims({
        w: Math.ceil(rect.width),
        h: Math.ceil(rect.height),
      });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [children]);

  const path =
    dims.w > 0 && dims.h > 0 ? createSpeechBubblePath(dims.w, dims.h) : "";

  return (
    <div
      className={`absolute bottom-[calc(100%-10px)] left-0 z-[222] w-max max-w-[min(14rem,calc(100vw-2rem))] ${className}`}
    >
      <div className="relative" style={{ paddingBottom: TAIL_LENGTH }}>
        {path ? (
          <svg
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 overflow-visible drop-shadow-[0_6px_20px_rgba(100,116,139,0.12)]"
            width={dims.w}
            height={dims.h + TAIL_LENGTH}
          >
            <path
              d={path}
              fill="rgba(255,255,255,0.95)"
              stroke="rgba(203,213,225,0.7)"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}

        <div ref={contentRef} className="relative px-3.5 py-2.5">
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
