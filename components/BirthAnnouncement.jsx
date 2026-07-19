"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Snowflake } from "lucide-react";
import { useEffect, useState } from "react";

const DATE_CHARS = ["2", "6", ".", "0", "6", ".", "2", "0", "2", "6"];
const DIGIT_STRIP = Array.from({ length: 100 }, (_, i) => String(i % 10));

const FLAKES = [
  { top: "10%", left: "8%", size: 14, rotate: -12, opacity: 0.45, duration: 5.2 },
  { top: "18%", right: "10%", size: 18, rotate: 18, opacity: 0.55, duration: 6.4 },
  { top: "62%", left: "6%", size: 12, rotate: 8, opacity: 0.35, duration: 4.8 },
  { top: "70%", right: "8%", size: 16, rotate: -20, opacity: 0.5, duration: 5.8 },
  { top: "42%", left: "4%", size: 10, rotate: 25, opacity: 0.3, duration: 7.1 },
  { top: "48%", right: "5%", size: 11, rotate: -8, opacity: 0.35, duration: 6.0 },
];

function CounterDot() {
  return (
    <span
      className="flex h-9 items-end justify-center px-0.5 pb-1.5 sm:h-11 sm:pb-2"
      aria-hidden="true"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-sky-700/70 sm:h-2 sm:w-2" />
    </span>
  );
}

function CounterDigit({ char, delayMs, animate }) {
  const target = Number(char);
  const [offset, setOffset] = useState(target);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (!animate) {
      setMoving(false);
      setOffset(target);
      return undefined;
    }

    const spinCount = 2 + Math.floor(delayMs / 120);
    const finalOffset = spinCount * 10 + target;
    setMoving(false);
    setOffset(0);

    const startTimer = window.setTimeout(() => {
      setMoving(true);
      setOffset(finalOffset);
    }, delayMs);

    return () => window.clearTimeout(startTimer);
  }, [animate, delayMs, target]);

  return (
    <span
      className="relative flex h-9 w-6 overflow-hidden rounded-md border border-sky-200/90 bg-gradient-to-b from-white via-sky-50 to-sky-100/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_8px_-2px_rgba(56,189,248,0.35)] sm:h-11 sm:w-7 sm:rounded-lg [--slot:2.25rem] sm:[--slot:2.75rem]"
      aria-hidden="true"
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px -translate-y-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent"
        aria-hidden="true"
      />
      <span
        className={`absolute left-0 top-0 w-full ${
          moving
            ? "transition-transform duration-[1100ms] ease-[cubic-bezier(0.12,0.75,0.18,1)]"
            : ""
        }`}
        style={{
          transform: `translate3d(0, calc(var(--slot) * ${-offset}), 0)`,
        }}
      >
        {DIGIT_STRIP.map((digit, index) => (
          <span
            key={`${digit}-${index}`}
            className="font-display flex h-[var(--slot)] w-full shrink-0 items-center justify-center text-lg font-extrabold tabular-nums leading-none text-aira-navy sm:text-xl"
          >
            {digit}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function BirthAnnouncement() {
  const reduceMotion = useReducedMotion();
  const [counterReady, setCounterReady] = useState(false);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const id = window.setTimeout(() => setCounterReady(true), 420);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  let digitIndex = 0;

  return (
    <motion.div
      className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-sky-100/80 bg-gradient-to-b from-white/90 via-sky-50/75 to-aira-iceLight/80 px-4 py-6 text-center shadow-[0_12px_40px_-16px_rgba(56,189,248,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md sm:px-7 sm:py-8"
      aria-label="Pengumuman kelahiran Airanayuki Mahardika"
      initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.85),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(186,230,253,0.35),transparent_50%)]"
        aria-hidden="true"
      />

      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent"
        aria-hidden="true"
        initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.8, ease: "easeOut" }}
      />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {FLAKES.map((flake, i) => (
          <motion.span
            key={i}
            className="absolute text-sky-300"
            style={{
              top: flake.top,
              left: flake.left,
              right: flake.right,
              width: flake.size,
              height: flake.size,
              opacity: flake.opacity,
            }}
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={
              reduceMotion
                ? { opacity: flake.opacity, rotate: flake.rotate }
                : {
                    opacity: [flake.opacity * 0.55, flake.opacity, flake.opacity * 0.55],
                    y: [0, 10, 0],
                    rotate: [flake.rotate - 8, flake.rotate + 8, flake.rotate - 8],
                  }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    delay: 0.35 + i * 0.08,
                    duration: flake.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            <Snowflake className="h-full w-full" strokeWidth={1.5} />
          </motion.span>
        ))}
      </div>

      <div className="relative z-10">
        <motion.p
          className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.35em] text-sky-600 sm:text-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            animate={reduceMotion ? undefined : { rotate: [0, 14, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Snowflake className="h-3.5 w-3.5 text-sky-400" strokeWidth={2} aria-hidden />
          </motion.span>
          Just Born
          <motion.span
            animate={reduceMotion ? undefined : { rotate: [0, -12, 10, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            <Snowflake className="h-3.5 w-3.5 text-sky-400" strokeWidth={2} aria-hidden />
          </motion.span>
        </motion.p>

        <div className="mt-4 flex flex-col items-center gap-4 sm:mt-5 sm:gap-5">
          <motion.time
            dateTime="2026-06-26"
            className="inline-flex items-center gap-0.5 rounded-2xl border border-sky-100/90 bg-gradient-to-b from-white/80 to-sky-50/50 px-2.5 py-2 shadow-[0_6px_24px_-10px_rgba(56,189,248,0.5),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-sm sm:gap-1 sm:px-3 sm:py-2.5"
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.32, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="sr-only">26.06.2026</span>
            {DATE_CHARS.map((char, index) => {
              if (char === ".") {
                return <CounterDot key={`dot-${index}`} />;
              }

              const delayMs = digitIndex * 100;
              digitIndex += 1;

              return (
                <CounterDigit
                  key={`digit-${index}`}
                  char={char}
                  delayMs={delayMs}
                  animate={counterReady}
                />
              );
            })}
          </motion.time>

          <motion.p
            className="font-elegant max-w-full whitespace-nowrap px-1 text-lg font-medium uppercase tracking-[0.14em] text-aira-navy/90 sm:text-xl sm:tracking-[0.16em]"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Airanayuki Mahardika
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
