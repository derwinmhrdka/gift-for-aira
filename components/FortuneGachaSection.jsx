"use client";

import { useAdminMode } from "@/components/AdminModeProvider";
import FeatureCard from "@/components/FeatureCard";
import { FORTUNE_CATEGORIES } from "@/lib/fortuneData";
import {
  playFortuneResultSound,
  playGachaShakeSound,
  unlockGuessSounds,
} from "@/lib/guessSounds";
import { resolveFortuneForVisitor } from "@/lib/fortunePersistence";
import { getVisitorId } from "@/lib/visitorId";
import { AnimatePresence, motion } from "framer-motion";
import { Box, ScrollText, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

function makeLuckSparkParticles(heavy = false) {
  const n = heavy ? 32 : 22;
  return Array.from({ length: n }, (_, i) => {
    const angle = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.55;
    const dist = heavy ? 34 + Math.random() * 72 : 26 + Math.random() * 58;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      delay: Math.floor(Math.random() * 160),
      size: heavy ? 3 + Math.random() * 5 : 2 + Math.random() * 4,
      kind: Math.random() > 0.72 ? "star" : "glow",
    };
  });
}

function FortuneLuckSparks({ tier, active }) {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    if (!active || !tier || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const ids = [];

    const spawn = (delay, heavy) => {
      const id = `${Date.now()}-${Math.random()}`;
      ids.push(id);
      window.setTimeout(() => {
        setBursts((prev) => [
          ...prev,
          {
            id,
            x: cx + (Math.random() - 0.5) * 80,
            y: cy + (Math.random() - 0.5) * 60,
            heavy,
            particles: makeLuckSparkParticles(heavy),
          },
        ]);
        window.setTimeout(() => {
          setBursts((prev) => prev.filter((b) => b.id !== id));
        }, 820);
      }, delay);
    };

    spawn(0, true);
    spawn(180, false);
    spawn(360, false);

    return () => {
      setBursts([]);
    };
  }, [active, tier]);

  if (typeof document === "undefined" || bursts.length === 0) return null;

  const spark = tier.spark;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[205] overflow-hidden"
      aria-hidden
    >
      {bursts.flatMap((b) =>
        b.particles.map((p, i) => {
          if (p.kind === "star") {
            return (
              <Sparkles
                key={`${b.id}-sp-${i}`}
                className={`aira-flake absolute motion-reduce:hidden ${spark.star}`}
                style={{
                  left: b.x,
                  top: b.y,
                  width: (b.heavy ? 11 : 9) + (i % 3),
                  height: (b.heavy ? 11 : 9) + (i % 3),
                  "--dx": `${p.dx * 0.9}px`,
                  "--dy": `${p.dy * 0.9}px`,
                  animation: `aira-flake 0.78s ease-out ${p.delay}ms forwards`,
                }}
              />
            );
          }
          return (
            <span
              key={`${b.id}-gl-${i}`}
              className={`aira-spark-dot absolute rounded-full motion-reduce:hidden ${spark.dot}`}
              style={{
                left: b.x,
                top: b.y,
                width: p.size,
                height: p.size,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                animation: `aira-spark 0.68s cubic-bezier(0.18, 0.9, 0.32, 1) ${p.delay}ms forwards`,
              }}
            />
          );
        }),
      )}
    </div>,
    document.body,
  );
}

function FortuneScroll({
  categoryLabel,
  CategoryIcon,
  tier,
  percent,
  text,
  tickerActive,
  fromCache,
}) {
  const TierIcon = tier.icon;
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
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl shadow-sky-200/40 ring-1 ring-white/60"
    >
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(147,197,253,0.04)_3px,rgba(147,197,253,0.04)_4px)]" />
      <div className="relative border border-sky-100/90 bg-gradient-to-b from-white via-aira-iceLight to-aira-snow px-5 py-6 backdrop-blur-sm sm:px-7 sm:py-8">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-sky-100/80 ring-1 ring-sky-200/70">
          <CategoryIcon
            className="h-5 w-5 text-aira-navy"
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <p className="font-display text-center text-lg font-bold tracking-wide text-aira-navy sm:text-xl">
          {categoryLabel}
        </p>
        <div className="mt-4 flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 sm:text-sm ${tier.badgeClass}`}
          >
            <TierIcon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            {tier.label}
          </span>
        </div>
        <p className="mt-5 text-center font-mono text-2xl font-semibold tabular-nums tracking-tight text-aira-navy sm:text-3xl">
          Tingkat Hoki:{" "}
          <motion.span
            key={displayPercent}
            className={`inline-block min-w-[3ch] ${tier.scoreClass}`}
          >
            {displayPercent}%
          </motion.span>
        </p>
        <div className="mx-auto mt-5 h-px w-full max-w-[12rem] bg-gradient-to-r from-transparent via-sky-300/50 to-transparent" />
        <p className="mt-5 text-center text-sm leading-relaxed text-slate-600 sm:text-base">
          {text}
        </p>
        {fromCache && (
          <p className="mt-5 text-center text-xs text-slate-400">
            Ramalan harianmu untuk kategori ini
          </p>
        )}
        <div className="mx-auto mt-6 h-1 w-12 rounded-full bg-sky-200/80" />
      </div>
      <div className="h-2 bg-gradient-to-b from-aira-frost to-aira-ice" />
    </motion.div>
  );
}

function GachaBox({ phase, showStick, CategoryIcon }) {
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
          className="absolute inset-x-2 bottom-2 top-6 shadow-[0_18px_40px_-12px_rgba(56,189,248,0.28),inset_0_2px_0_rgba(255,255,255,0.75),inset_0_-6px_12px_rgba(147,197,253,0.15)]"
          style={{
            clipPath: OCTAGON_CLIP,
            background:
              "linear-gradient(145deg, #F4FAFF 0%, #EAF3FB 30%, #C5DDF0 65%, #B8D4EB 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "repeating-linear-gradient(92deg, transparent, transparent 8px, rgba(255,255,255,0.35) 8px, rgba(255,255,255,0.35) 9px)",
            }}
          />
          <div className="absolute inset-x-[18%] top-[6%] h-[10%] rounded-full bg-gradient-to-b from-aira-navy/35 to-aira-navy/55 shadow-inner" />
          <div className="absolute inset-x-[22%] top-[14%] flex justify-center gap-2 opacity-40">
            {[0, 1, 2].map((i) => (
              <ScrollText
                key={i}
                className="h-4 w-4 text-sky-400/70"
                strokeWidth={1.75}
                style={{ transform: `rotate(${i * 6 - 6}deg)` }}
                aria-hidden
              />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-[16%] flex flex-col items-center gap-1">
            <Box
              className="h-5 w-5 text-sky-500/50 sm:h-6 sm:w-6"
              strokeWidth={1.75}
              aria-hidden
            />
            <CategoryIcon
              className="h-7 w-7 text-aira-navy/60 sm:h-8 sm:w-8"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </div>

        <div
          className="absolute inset-x-3 top-0 h-8 shadow-md shadow-sky-200/40"
          style={{
            clipPath: OCTAGON_CLIP,
            background:
              "linear-gradient(180deg, #ffffff 0%, #EAF3FB 55%, #C5DDF0 100%)",
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
                <div className="h-16 w-2 rounded-full bg-gradient-to-r from-white via-aira-iceLight to-aira-ice shadow-sm ring-1 ring-sky-200/50 sm:h-20" />
                <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-md bg-white/95 shadow ring-1 ring-sky-200/60">
                  <ScrollText
                    className="h-4 w-4 text-aira-navy/75"
                    strokeWidth={2}
                    aria-hidden
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="absolute -bottom-1 left-1/2 h-3 w-3/4 -translate-x-1/2 rounded-full bg-sky-300/25 blur-md" />
    </div>
  );
}

export default function FortuneGachaSection() {
  const isAdmin = useAdminMode();
  const [categoryId, setCategoryId] = useState(FORTUNE_CATEGORIES[0].id);
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [isCachedResult, setIsCachedResult] = useState(false);
  const [showStick, setShowStick] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [tickerActive, setTickerActive] = useState(false);
  const [runId, setRunId] = useState(0);
  const runIdRef = useRef(0);

  const timersRef = useRef([]);
  const closeScrollRef = useRef(() => {});

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

  useEffect(() => {
    if (!showScroll) return undefined;

    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeScrollRef.current();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showScroll]);

  const activeCategory =
    FORTUNE_CATEGORIES.find((c) => c.id === categoryId) ??
    FORTUNE_CATEGORIES[0];

  const isAnimating = phase !== "idle" && phase !== "revealed";

  const handleDraw = useCallback(async () => {
    clearTimers();
    setShowStick(false);
    setShowScroll(false);
    setTickerActive(false);
    setIsCachedResult(false);

    const currentRun = runIdRef.current + 1;
    runIdRef.current = currentRun;
    setRunId(currentRun);

    const visitorId = isAdmin ? "" : await getVisitorId();
    const rolled = await resolveFortuneForVisitor(categoryId, {
      isAdmin,
      visitorId,
    });

    if (runIdRef.current !== currentRun) return;

    unlockGuessSounds();
    playGachaShakeSound();

    setResult(rolled);
    setIsCachedResult(Boolean(rolled.cached));
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
          playFortuneResultSound(rolled.tierKey);
        }, 320);
      }, STICK_MS + 120);
    }, SHAKE_MS);
  }, [categoryId, clearTimers, isAdmin, schedule]);

  const closeScroll = useCallback(() => {
    clearTimers();
    runIdRef.current += 1;
    setShowScroll(false);
    setShowStick(false);
    setTickerActive(false);
    setPhase("idle");
    setResult(null);
    setIsCachedResult(false);
  }, [clearTimers]);

  closeScrollRef.current = closeScroll;

  const ActiveCategoryIcon = activeCategory.icon;

  return (
    <section className="w-full" aria-labelledby="fortune-gacha-heading">
      <FeatureCard className="!px-4 !py-5 text-left sm:!px-6 sm:!py-7">
        <h2
          id="fortune-gacha-heading"
          className="font-display text-center text-xl font-bold text-aira-navy sm:text-2xl"
        >
          Kotak Ramalan Keberuntungan
        </h2>
        <p className="mt-1.5 text-center text-sm leading-relaxed text-slate-500">
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
                    ? "border-sky-300/50 bg-gradient-to-r from-sky-500 to-aira-navy text-white shadow-md shadow-sky-200/40"
                    : "border-sky-200/80 bg-white/70 text-slate-600 hover:border-sky-300 hover:bg-white/90"
                } ${isAnimating ? "pointer-events-none opacity-60" : ""}`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative mt-8 flex flex-col items-center">
          <GachaBox
            phase={phase}
            showStick={showStick}
            CategoryIcon={ActiveCategoryIcon}
          />

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
            className="mt-8 rounded-full bg-gradient-to-r from-sky-500 to-aira-navy px-7 py-3.5 font-display text-sm font-bold tracking-wide text-white shadow-lg shadow-sky-200/40 ring-1 ring-sky-300/30 transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-aira-snow sm:px-9 sm:text-base"
          >
            {isAnimating ? "Mengocok kotak..." : "Ambil Ramalan Hari Ini"}
          </motion.button>
        </div>
      </FeatureCard>

      <FortuneLuckSparks
        tier={result?.tier}
        active={showScroll && tickerActive}
      />

      <AnimatePresence>
        {showScroll && result && (
          <motion.div
            key={`overlay-${runId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-[200] flex items-center justify-center overscroll-none p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fortune-result-title"
            onClick={closeScroll}
          >
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-aira-navy/65 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ y: 28, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="fortune-result-title" className="sr-only">
                Hasil ramalan {activeCategory.label}
              </h3>
              <FortuneScroll
                categoryLabel={activeCategory.label}
                CategoryIcon={ActiveCategoryIcon}
                tier={result.tier}
                percent={result.percent}
                text={result.text}
                tickerActive={tickerActive}
                fromCache={isCachedResult}
              />
              <button
                type="button"
                onClick={closeScroll}
                className="mx-auto mt-5 flex items-center gap-2 rounded-full border border-sky-200/60 bg-white/95 px-5 py-2.5 text-sm font-semibold text-aira-navy shadow-md shadow-sky-200/25 transition hover:bg-white"
              >
                <X className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
