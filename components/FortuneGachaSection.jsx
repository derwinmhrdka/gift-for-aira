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
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SHAKE_MS = 1500;
const STICK_MS = 450;
const PREMIUM_EASE = [0.16, 1, 0.3, 1];
const SPRING_SNAPPY = { type: "spring", stiffness: 420, damping: 30, mass: 0.82 };
const SCROLL_STAGGER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.14 },
  },
};
const SCROLL_ITEM = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING_SNAPPY },
  },
};

function LuckScoreTicker({ target, active, className }) {
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    if (!active) {
      motionVal.set(0);
      return undefined;
    }
    const controls = animate(motionVal, target, {
      type: "spring",
      stiffness: 200,
      damping: 26,
      mass: 0.65,
      duration: 0.5,
    });
    return () => controls.stop();
  }, [active, motionVal, target]);

  return (
    <motion.span className={`inline-block min-w-[3.5ch] tabular-nums ${className}`}>
      {display}
    </motion.span>
  );
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
      className="pointer-events-none fixed inset-0 z-[238] overflow-hidden"
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
  categoryIconClass,
  tier,
  percent,
  text,
  tickerActive,
  fromCache,
}) {
  const TierIcon = tier.icon;

  return (
    <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/80 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.18)] ring-1 ring-white/80 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.65),transparent_55%)]" />
      <motion.div
        className="relative px-6 py-7 sm:px-8 sm:py-9"
        variants={SCROLL_STAGGER}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={SCROLL_ITEM}
          className="mx-auto mb-5 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50/90"
        >
          <CategoryIcon
            className={`h-4 w-4 ${categoryIconClass}`}
            fill="currentColor"
            strokeWidth={0}
            aria-hidden
          />
        </motion.div>

        <motion.p
          variants={SCROLL_ITEM}
          className="text-center font-mono text-[0.7rem] font-medium uppercase tracking-[0.22em] text-zinc-500"
        >
          {categoryLabel}
        </motion.p>

        <motion.div variants={SCROLL_ITEM} className="mt-4 flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[0.65rem] font-medium uppercase tracking-wider ring-1 ${tier.badgeClass}`}
          >
            <TierIcon
              className="h-3 w-3"
              fill="currentColor"
              strokeWidth={0}
              aria-hidden
            />
            {tier.label}
          </span>
        </motion.div>

        <motion.p
          variants={SCROLL_ITEM}
          className="mt-6 text-center font-mono text-xs uppercase tracking-[0.18em] text-zinc-400"
        >
          Tingkat Hoki
        </motion.p>
        <motion.div variants={SCROLL_ITEM} className="mt-1 text-center">
          <LuckScoreTicker
            target={percent}
            active={tickerActive}
            className={`font-mono text-4xl font-semibold tracking-tight sm:text-5xl ${tier.scoreClass}`}
          />
        </motion.div>

        <motion.div
          variants={SCROLL_ITEM}
          className="mx-auto mt-6 h-px w-full max-w-[10rem] bg-gradient-to-r from-transparent via-zinc-300/60 to-transparent"
        />

        <motion.p
          variants={SCROLL_ITEM}
          className="mt-6 text-center text-sm leading-relaxed text-zinc-600 sm:text-[0.95rem]"
        >
          {text}
        </motion.p>

        {fromCache ? (
          <motion.p
            variants={SCROLL_ITEM}
            className="mt-5 text-center font-mono text-[0.62rem] uppercase tracking-widest text-zinc-400"
          >
            Ramalan harian
          </motion.p>
        ) : null}
      </motion.div>
    </div>
  );
}

const TUBE_SEGMENTS = ["22%", "44%", "66%"];

function BambooStick({
  category,
  selected,
  dimmed,
  disabled,
  isShaking,
  isPopping,
  onSelect,
}) {
  const Icon = category.icon;

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(category.id)}
      aria-label={`Pilih ramalan ${category.label}`}
      aria-pressed={selected}
      className="group relative shrink-0 cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 focus-visible:ring-offset-2 disabled:cursor-wait"
      animate={{
        opacity: dimmed ? 0.38 : 1,
        scale: dimmed ? 0.96 : 1,
        rotate: isShaking
          ? selected
            ? [0, -3, 4, -4, 3, -2, 0]
            : [0, -1, 1, -1, 0]
          : 0,
        y: isShaking && selected ? [0, -1, 1, -2, 0] : 0,
      }}
      transition={
        isShaking
          ? { duration: SHAKE_MS / 1000, ease: PREMIUM_EASE }
          : { ...SPRING_SNAPPY }
      }
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      <motion.div
        animate={
          isPopping && selected
            ? { y: -68, scale: 1.04 }
            : { y: selected && !isPopping ? -4 : 0, scale: 1 }
        }
        transition={
          isPopping
            ? { duration: STICK_MS / 1000, ease: PREMIUM_EASE }
            : { ...SPRING_SNAPPY }
        }
        className={`relative h-[8.75rem] w-[2.15rem] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:h-[10.25rem] sm:w-[2.5rem] ${
          selected ? "z-10" : "z-0 group-hover:-translate-y-1"
        } ${category.hoverGlow}`}
      >
        <div
          className={`absolute inset-0 overflow-hidden rounded-[1.35rem] bg-gradient-to-b from-zinc-100 via-zinc-50 to-zinc-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-12px_20px_rgba(0,0,0,0.04),0_10px_32px_-12px_rgba(0,0,0,0.14)] ring-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            selected
              ? `${category.selectedRing} ring-2 ring-offset-2 ring-offset-white`
              : "ring-zinc-200/70 group-hover:ring-zinc-300/80"
          }`}
        >
          <div className="pointer-events-none absolute inset-x-3 top-2 h-4 rounded-full bg-gradient-to-b from-white/80 to-transparent" />
          {TUBE_SEGMENTS.map((top) => (
            <div
              key={top}
              className="pointer-events-none absolute inset-x-2 h-px bg-zinc-300/35"
              style={{ top }}
            />
          ))}
          <div className="absolute inset-x-0 top-[26%] bottom-[24%] flex items-center justify-center">
            <span
              className="font-mono text-[0.58rem] font-medium uppercase tracking-[0.2em] text-zinc-500 sm:text-[0.62rem]"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              {category.label}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-3 flex justify-center">
            <Icon
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${category.iconClass}`}
              fill="currentColor"
              strokeWidth={0}
              aria-hidden
            />
          </div>
          {selected ? (
            <div
              className={`pointer-events-none absolute inset-x-2 bottom-0 h-8 bg-gradient-to-t from-current/8 to-transparent ${category.accentClass}`}
              aria-hidden
            />
          ) : null}
        </div>
      </motion.div>
    </motion.button>
  );
}

function BambooFortuneSet({
  categories,
  selectedId,
  phase,
  showStick,
  disabled,
  onSelect,
}) {
  const isShaking = phase === "shaking";
  const isPopping = showStick && (phase === "stick" || phase === "revealing");
  const isBusy = isShaking || isPopping;

  return (
    <div className="relative mx-auto w-full max-w-lg px-1">
      <div
        className="pointer-events-none absolute inset-x-[8%] bottom-0 h-2 rounded-full bg-zinc-200/70 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]"
        aria-hidden
      />
      <div
        className="relative flex items-end justify-center gap-1.5 overflow-x-auto pb-6 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2.5 [&::-webkit-scrollbar]:hidden"
        role="listbox"
        aria-label="Pilih kategori ramalan"
      >
        {categories.map((cat) => (
          <BambooStick
            key={cat.id}
            category={cat}
            selected={cat.id === selectedId}
            dimmed={isBusy && cat.id !== selectedId}
            disabled={disabled}
            isShaking={isShaking}
            isPopping={isPopping}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function FortuneResultOverlay({ open, runId, onClose, children }) {
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!portalReady || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key={`fortune-overlay-${runId}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: PREMIUM_EASE }}
          className="fixed inset-0 z-[240] flex touch-manipulation items-center justify-center overscroll-none p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Tutup ramalan"
            className="absolute inset-0 z-0 cursor-pointer border-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.94 }}
            transition={SPRING_SNAPPY}
            className="relative z-10 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
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

  const ActiveCategoryIcon = activeCategory.icon;

  return (
    <section className="w-full" aria-labelledby="fortune-gacha-heading">
      <FeatureCard className="!px-4 !py-5 text-left sm:!px-6 sm:!py-7">
        <h2
          id="fortune-gacha-heading"
          className="font-display text-center text-xl font-bold text-aira-navy sm:text-2xl"
        >
          Bambu Ramalan Keberuntungan
        </h2>
        <p className="mt-1.5 text-center text-sm leading-relaxed text-slate-500">
          Pilih bambu ramalanmu, lalu kocok untuk lihat hoki hari ini
        </p>

        <div className="relative mt-8 flex flex-col items-center">
          <BambooFortuneSet
            categories={FORTUNE_CATEGORIES}
            selectedId={categoryId}
            phase={phase}
            showStick={showStick}
            disabled={isAnimating}
            onSelect={setCategoryId}
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
            className="mt-8 rounded-full border border-zinc-900/10 bg-zinc-900 px-7 py-3.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-zinc-50 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-zinc-800 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:ring-offset-2 sm:px-9"
          >
            {isAnimating ? "Mengocok bambu..." : "Ambil Ramalan Hari Ini"}
          </motion.button>
        </div>
      </FeatureCard>

      <FortuneLuckSparks
        tier={result?.tier}
        active={showScroll && tickerActive}
      />

      <FortuneResultOverlay
        open={showScroll && Boolean(result)}
        runId={runId}
        onClose={closeScroll}
      >
        <h3 id="fortune-result-title" className="sr-only">
          Hasil ramalan {activeCategory.label}
        </h3>
        {result ? (
          <>
            <FortuneScroll
              categoryLabel={activeCategory.label}
              CategoryIcon={ActiveCategoryIcon}
              categoryIconClass={activeCategory.iconClass}
              tier={result.tier}
              percent={result.percent}
              text={result.text}
              tickerActive={tickerActive}
              fromCache={isCachedResult}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeScroll();
              }}
              className="mx-auto mt-5 flex min-h-[44px] touch-manipulation items-center gap-2 rounded-full border border-zinc-200/80 bg-white/90 px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-zinc-700 shadow-sm backdrop-blur-sm transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-md active:scale-[0.98]"
            >
              <X className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              Tutup
            </button>
          </>
        ) : null}
      </FortuneResultOverlay>
    </section>
  );
}
