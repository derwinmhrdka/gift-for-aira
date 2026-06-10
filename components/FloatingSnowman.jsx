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
const TAIL_LENGTH = 11;
const TAIL_ATTACH_LEFT = 12;
const TAIL_ATTACH_RIGHT = 24;

function createSpeechBubblePath(width, height, tailTipX) {
  const w = width;
  const h = height;
  const r = BUBBLE_RADIUS;
  const tipX = tailTipX;
  const tipY = h + TAIL_LENGTH;

  return [
    `M ${r} 1`,
    `L ${w - r} 1`,
    `Q ${w - 1} 1 ${w - 1} ${r}`,
    `L ${w - 1} ${h - r}`,
    `Q ${w - 1} ${h - 1} ${w - r} ${h - 1}`,
    `L ${TAIL_ATTACH_RIGHT} ${h - 1}`,
    `C ${TAIL_ATTACH_RIGHT + 16} ${h + 1} ${tipX + 12} ${h + 6} ${tipX} ${tipY}`,
    `C ${tipX - 2} ${h + 7} ${TAIL_ATTACH_LEFT - 2} ${h + 1} ${TAIL_ATTACH_LEFT} ${h - 1}`,
    `L ${r} ${h - 1}`,
    `Q 1 ${h - 1} 1 ${h - r}`,
    `L 1 ${r}`,
    `Q 1 1 ${r} 1`,
    "Z",
  ].join(" ");
}

function SpeechBubble({
  children,
  interactive = false,
  onAction,
  className = "",
  tailCenterX,
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
    dims.w > 0 && dims.h > 0
      ? createSpeechBubblePath(dims.w, dims.h, tailCenterX)
      : "";

  return (
    <div
      className={`absolute bottom-[calc(100%-10px)] left-0 z-[222] w-max max-w-[min(14rem,calc(100vw-2rem))] ${className}`}
    >
      <div
        className="relative"
        style={{ paddingBottom: TAIL_LENGTH }}
      >
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
              strokeLinecap="round"
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
  const [tailCenterX, setTailCenterX] = useState(36);

  const isInteractive = bubbleOpen || modalOpen;

  useLayoutEffect(() => {
    const node = snowmanRef.current;
    if (!node) return undefined;

    function measureSnowman() {
      const img = node.querySelector("img");
      if (!img) return;
      setTailCenterX(Math.round(img.getBoundingClientRect().width / 2));
    }

    measureSnowman();
    const observer = new ResizeObserver(measureSnowman);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
          <SpeechBubble
            interactive
            onAction={openAdminModal}
            tailCenterX={tailCenterX}
          >
            Masuk ke mode admin?
          </SpeechBubble>
        ) : null}

        {!bubbleOpen && !modalOpen && idleBubbleVisible ? (
          <SpeechBubble className="pointer-events-none" tailCenterX={tailCenterX}>
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
