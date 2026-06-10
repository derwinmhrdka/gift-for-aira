"use client";

import FeatureCard from "@/components/FeatureCard";
import {
  FORTUNE_CATEGORIES,
  rollFortune,
} from "@/lib/fortuneData";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const SHAKE_MS = 1500;
const STICK_MS = 450;
const TICKER_MS = 500;

const OCTAGON_CLIP =
  "polygon(28% 0%, 72% 0%, 100% 28%, 100% 72%, 72% 100%, 28% 100%, 0% 72%, 0% 28%)";

function runLuckTicker(target, duration, onUpdate, signal) {
  const start = performance.now();

  const frame = (now) => {
    if (signal?.aborted) return;
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    if (progress < 1) {
      const ceiling = Math.max(
        target,
        Math.floor(target * progress + Math.random() * 35),
      );
      onUpdate(Math.min(99, Math.max(0, ceiling)));
      requestAnimationFrame(frame);
    } else {
      onUpdate(target);
    }
  };

  requestAnimationFrame(frame);
}

function FortuneScroll({
  categoryLabel,
  tier,
  percent,
  text,
  tickerActive,
}) {
  const [displayPercent, setDisplayPercent] = useState(0);
  const tickerRef = useRef(null);

  useEffect(() => {
    if (!tickerActive) {
      setDisplayPercent(0);
      return;
    }

    tickerRef.current?.abort();
    const controller = new AbortController();
    tickerRef.current = controller;

    runLuckTicker(
      percent,
      TICKER_MS,
      setDisplayPercent,
      controller.signal,
    );

    return () => controller.abort();
  }, [tickerActive, percent]);

  return (
    <motion.div
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: "top center" }}
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-sm shadow-2xl shadow-stone-900/25"
    >
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(120,53,15,0.03)_3px,rgba(120,53,15,0.03)_4px)]" />
      <div className="relative border border-amber-200/80 bg-gradient-to-b from-[#fffdf8] via-[#faf6ee] to-[#f3ebe0] px-5 py-6 sm:px-7 sm:py-8">
        <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-amber-300/70" />
        <p className="font-display text-center text-lg font-bold tracking-wide text-[#5c1a1a] sm:text-xl">
          {categoryLabel}
        </p>
        <div className="mt-4 flex justify-center">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 sm:text-sm ${tier.badgeClass}`}
          >
            {tier.label}
          </span>
        </div>
        <p className="mt-5 text-center font-mono text-2xl font-semibold tabular-nums tracking-tight text-[#3d2b1f] sm:text-3xl">
          Tingkat Hoki:{" "}
          <motion.span
            key={displayPercent}
            className="inline-block min-w-[3ch] text-[#7f1d1d]"
          >
            {displayPercent}%
          </motion.span>
        </p>
        <div className="mx-auto mt-5 h-px w-full max-w-[12rem] bg-gradient-to-r from-transparent via-amber-800/25 to-transparent" />
        <p className="mt-5 text-center text-sm leading-relaxed text-stone-700 sm:text-base">
          {text}
        </p>
        <div className="mx-auto mt-6 h-1 w-12 rounded-full bg-amber-300/60" />
      </div>
      <div className="h-2 bg-gradient-to-b from-[#e8dcc8] to-[#d4c4aa]" />
    </motion.div>
  );
}

function GachaBox({ phase, showStick }) {
  const isShaking = phase === "shaking";

  return (
    <div className="relative mx-auto h-48 w-40 sm:h-52 sm:w-44">
      <motion.div
        animate={
          isShaking
            ? {
                rotate: [0, -4, 5, -6, 4, -5, 3, -2, 0],
                x: [0, -3, 4, -5, 3, -4, 2, 0],
              }
            : { rotate: 0, x: 0 }
        }
        transition={
          isShaking
            ? { duration: SHAKE_MS / 1000, ease: "easeInOut" }
            : { duration: 0.2 }
        }
        className="relative h-full w-full"
      >
        <div
          className="absolute inset-x-2 bottom-2 top-6 shadow-[0_18px_40px_-12px_rgba(92,26,26,0.35),inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-6px_12px_rgba(120,53,15,0.12)]"
          style={{
            clipPath: OCTAGON_CLIP,
            background:
              "linear-gradient(145deg, #e8d4b8 0%, #d4b896 35%, #c9a882 65%, #b8956e 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "repeating-linear-gradient(92deg, transparent, transparent 8px, rgba(139,90,43,0.08) 8px, rgba(139,90,43,0.08) 9px)",
            }}
          />
          <div className="absolute inset-x-[18%] top-[6%] h-[10%] rounded-full bg-gradient-to-b from-stone-800/50 to-stone-900/70 shadow-inner" />
          <div className="absolute inset-x-[22%] top-[14%] flex justify-center gap-1 opacity-30">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-8 w-px bg-amber-900/40"
                style={{ transform: `rotate(${i * 4 - 4}deg)` }}
              />
            ))}
          </div>
          <p
            className="absolute inset-x-0 bottom-[18%] text-center font-display text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[#5c1a1a]/70 sm:text-xs"
            aria-hidden
          >
            Ramalan
          </p>
        </div>

        <div
          className="absolute inset-x-3 top-0 h-8 shadow-md"
          style={{
            clipPath: OCTAGON_CLIP,
            background:
              "linear-gradient(180deg, #f0e0c8 0%, #dcc4a4 55%, #c9a882 100%)",
          }}
        />

        <AnimatePresence>
          {showStick && (
            <motion.div
              key="stick"
              initial={{ y: 24, opacity: 0, scaleY: 0.2 }}
              animate={{ y: -72, opacity: 1, scaleY: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: STICK_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-[8%] z-10 -translate-x-1/2"
            >
              <div className="flex flex-col items-center">
                <div className="h-16 w-2 rounded-full bg-gradient-to-r from-[#e8dcc8] via-[#f5ead8] to-[#d4c4aa] shadow-sm ring-1 ring-amber-900/15 sm:h-20" />
                <div className="mt-1 h-3 w-7 rounded-sm bg-[#faf6ee] shadow ring-1 ring-amber-900/10" />
                <p className="mt-0.5 font-display text-[0.55rem] font-bold uppercase tracking-widest text-[#7f1d1d]/80">
                  hoki
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="absolute -bottom-1 left-1/2 h-3 w-3/4 -translate-x-1/2 rounded-full bg-stone-900/10 blur-md" />
    </div>
  );
}

export default function FortuneGachaSection() {
  const [categoryId, setCategoryId] = useState(FORTUNE_CATEGORIES[0].id);
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [showStick, setShowStick] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [tickerActive, setTickerActive] = useState(false);
  const [runId, setRunId] = useState(0);
  const runIdRef = useRef(0);

  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const activeCategory =
    FORTUNE_CATEGORIES.find((c) => c.id === categoryId) ??
    FORTUNE_CATEGORIES[0];

  const isAnimating = phase !== "idle" && phase !== "revealed";

  const handleDraw = useCallback(() => {
    clearTimers();
    setShowStick(false);
    setShowScroll(false);
    setTickerActive(false);

    const currentRun = runIdRef.current + 1;
    runIdRef.current = currentRun;
    setRunId(currentRun);

    const rolled = rollFortune(categoryId);
    setResult(rolled);
    setPhase("shaking");

    schedule(() => {
      if (runIdRef.current !== currentRun) return;
      setShowStick(true);
      setPhase("stick");

      schedule(() => {
        if (runIdRef.current !== currentRun) return;
        setPhase("revealing");
        setShowScroll(true);

        schedule(() => {
          if (runIdRef.current !== currentRun) return;
          setTickerActive(true);
          setPhase("revealed");
        }, 320);
      }, STICK_MS + 120);
    }, SHAKE_MS);
  }, [categoryId, clearTimers, schedule]);

  const closeScroll = useCallback(() => {
    clearTimers();
    runIdRef.current += 1;
    setShowScroll(false);
    setShowStick(false);
    setTickerActive(false);
    setPhase("idle");
    setResult(null);
  }, [clearTimers]);

  return (
    <section className="w-full" aria-labelledby="fortune-gacha-heading">
      <FeatureCard className="!border-amber-100/80 !bg-[#faf6f0]/95 !px-4 !py-5 text-left shadow-lg shadow-amber-900/10 sm:!px-6 sm:!py-7">
        <h2
          id="fortune-gacha-heading"
          className="font-display text-center text-xl font-bold text-[#5c1a1a] sm:text-2xl"
        >
          Kotak Ramalan Keberuntungan
        </h2>
        <p className="mt-1.5 text-center text-sm leading-relaxed text-stone-600">
          Pilih kategori, kocok kotaknya, dan ambil ramalan harianmu
        </p>

        <div
          className="mt-6 -mx-1 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Kategori ramalan"
        >
          {FORTUNE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={isAnimating}
                onClick={() => setCategoryId(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                  active
                    ? "border-[#7f1d1d]/30 bg-[#7f1d1d] text-[#faf6f0] shadow-md shadow-[#7f1d1d]/20"
                    : "border-amber-200/80 bg-white/70 text-stone-700 hover:border-amber-300 hover:bg-white"
                } ${isAnimating ? "pointer-events-none opacity-60" : ""}`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative mt-8 flex flex-col items-center">
          <GachaBox phase={phase} showStick={showStick} />

          <motion.button
            type="button"
            onClick={handleDraw}
            whileTap={{ scale: 0.94 }}
            animate={
              phase === "shaking"
                ? { scale: [1, 1.04, 0.97, 1] }
                : { scale: 1 }
            }
            transition={{ type: "spring", stiffness: 520, damping: 14 }}
            className="mt-8 rounded-full bg-gradient-to-b from-[#9b2c2c] to-[#7f1d1d] px-7 py-3.5 font-display text-sm font-bold tracking-wide text-[#faf6f0] shadow-lg shadow-[#7f1d1d]/30 ring-1 ring-[#5c1a1a]/20 transition hover:from-[#a83232] hover:to-[#8b2222] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7f1d1d]/50 focus-visible:ring-offset-2 sm:px-9 sm:text-base"
          >
            {isAnimating ? "Mengocok kotak..." : "Ambil Ramalan Hari Ini"}
          </motion.button>
        </div>
      </FeatureCard>

      <AnimatePresence>
        {showScroll && result && (
          <motion.div
            key={`overlay-${runId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fortune-result-title"
          >
            <button
              type="button"
              aria-label="Tutup ramalan"
              className="absolute inset-0 bg-stone-900/55 backdrop-blur-[2px]"
              onClick={closeScroll}
            />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative z-10 w-full max-w-md"
            >
              <h3 id="fortune-result-title" className="sr-only">
                Hasil ramalan {activeCategory.label}
              </h3>
              <FortuneScroll
                categoryLabel={activeCategory.label}
                tier={result.tier}
                percent={result.percent}
                text={result.text}
                tickerActive={tickerActive}
              />
              <button
                type="button"
                onClick={closeScroll}
                className="mx-auto mt-5 flex rounded-full border border-white/30 bg-white/90 px-5 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-white"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
