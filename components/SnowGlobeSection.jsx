"use client";

import FeatureCard from "@/components/FeatureCard";
import {
  playGlobeReactionSound,
  playGlobeShakeSound,
  unlockGuessSounds,
} from "@/lib/guessSounds";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Snowflake, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const REACTIONS = [
  {
    id: "love",
    label: "Love",
    icon: Heart,
    colorClass: "text-pink-500",
    btnFrom: "from-pink-50",
    btnTo: "to-pink-100",
    btnHoverFrom: "group-hover:from-pink-100",
    btnHoverTo: "group-hover:to-pink-200",
    countHover: "group-hover:text-pink-600",
    bounceBg: "rgba(236, 72, 153, 0.15)",
  },
  {
    id: "like",
    label: "Like",
    icon: ThumbsUp,
    colorClass: "text-amber-500",
    btnFrom: "from-amber-50",
    btnTo: "to-amber-100",
    btnHoverFrom: "group-hover:from-amber-100",
    btnHoverTo: "group-hover:to-amber-200",
    countHover: "group-hover:text-amber-600",
    bounceBg: "rgba(251, 146, 60, 0.15)",
  },
  {
    id: "snowflake",
    label: "Salju",
    icon: Snowflake,
    colorClass: "text-blue-400",
    btnFrom: "from-blue-50",
    btnTo: "to-blue-100",
    btnHoverFrom: "group-hover:from-blue-100",
    btnHoverTo: "group-hover:to-blue-200",
    countHover: "group-hover:text-blue-600",
    bounceBg: "rgba(59, 130, 246, 0.15)",
  },
];

const HOLD_INTERVAL_MS = 320;
const POLL_MS = 4000;
const GRAVITY = 0.006;
const DRAG = 0.992;
const LAYER_HEIGHT = 2.6;

/** Glass dome area within snow-globe.png (percent of image box) */
const GLASS = {
  left: "11%",
  top: "3%",
  width: "78%",
};

const GLOBE_CENTER = { x: 50, y: 50 };
const GLOBE_RADIUS = 46;
const COUNTS_STORAGE_KEY = "aira-snow-globe-counts";

function emptyCounts() {
  return { love: 0, like: 0, snowflake: 0 };
}

function readStoredCounts() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COUNTS_STORAGE_KEY);
    if (!raw) return null;
    return normalizeCounts(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeStoredCounts(counts) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COUNTS_STORAGE_KEY, JSON.stringify(counts));
  } catch {
    /* ignore */
  }
}

function normalizeCounts(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    love: Math.max(0, Number(raw.love) || 0),
    like: Math.max(0, Number(raw.like) || 0),
    snowflake: Math.max(0, Number(raw.snowflake) || 0),
  };
}

function mergeCounts(prev, next) {
  return {
    love: Math.max(prev.love, next.love),
    like: Math.max(prev.like, next.like),
    snowflake: Math.max(prev.snowflake, next.snowflake),
  };
}

function countsTotal(counts) {
  return counts.love + counts.like + counts.snowflake;
}

function formatCount(value) {
  const n = Number(value) || 0;
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(n);
}

function floorYAt(x) {
  const dx = x - GLOBE_CENTER.x;
  const rimY =
    GLOBE_CENTER.y +
    Math.sqrt(Math.max(0, GLOBE_RADIUS * GLOBE_RADIUS - dx * dx));
  const snowLift = 10;
  const t = 1 - Math.min(1, Math.abs(dx) / (GLOBE_RADIUS * 0.88));
  return rimY - snowLift * t;
}

function clampXInGlobeAtY(x, y) {
  const dy = y - GLOBE_CENTER.y;
  const maxDx = Math.sqrt(Math.max(0, GLOBE_RADIUS * GLOBE_RADIUS - dy * dy));
  const clampedDx = Math.max(-maxDx, Math.min(maxDx, x - GLOBE_CENTER.x));
  return { x: GLOBE_CENTER.x + clampedDx, y };
}

function minSeparation(size = 9) {
  return 3.4 + size * 0.14;
}

function settledParticles(list, excludeId) {
  return list.filter((p) => p.settled && !p.fading && p.id !== excludeId);
}

function overlapsAny(x, y, size, others, excludeId) {
  const reach = minSeparation(size) * 2.5;
  for (const p of settledParticles(others, excludeId)) {
    if (Math.abs(p.x - x) > reach || Math.abs(p.y - y) > reach) continue;
    const minDist = (minSeparation(size) + minSeparation(p.size)) / 2;
    if (Math.hypot(p.x - x, p.y - y) < minDist) return true;
  }
  return false;
}

function maxXSpreadAtY(y) {
  const dy = y - GLOBE_CENTER.y;
  const maxDx = Math.sqrt(Math.max(0, GLOBE_RADIUS * GLOBE_RADIUS - dy * dy));
  return Math.max(0, maxDx - 2.5);
}

function findRestPosition(settledList, excludeId, size = 9) {
  const floorCenterY = floorYAt(GLOBE_CENTER.x);
  const step = minSeparation(size) * 0.92;

  for (let layer = 0; layer < 24; layer += 1) {
    const y = floorCenterY - layer * LAYER_HEIGHT;
    if (y < 14) break;

    const spread = maxXSpreadAtY(y);
    const cols = Math.max(1, Math.floor((spread * 2) / step));

    const order = [];
    for (let col = 0; col < cols; col += 1) order.push(col);
    order.sort(
      (a, b) =>
        Math.abs(a - (cols - 1) / 2) - Math.abs(b - (cols - 1) / 2),
    );

    for (const col of order) {
      const t = cols === 1 ? 0.5 : col / (cols - 1);
      const x = GLOBE_CENTER.x + (t - 0.5) * spread * 1.85;
      const pos = clampXInGlobeAtY(x, y);
      if (!overlapsAny(pos.x, pos.y, size, settledList, excludeId)) {
        return pos;
      }
    }
  }

  return clampXInGlobeAtY(
    GLOBE_CENTER.x + (Math.random() - 0.5) * 8,
    floorCenterY - Math.random() * 6,
  );
}

function nudgeFromNeighbors(x, y, size, others, excludeId) {
  let nx = x;
  let ny = y;
  const reach = minSeparation(size) * 2.5;

  for (const o of settledParticles(others, excludeId)) {
    if (Math.abs(o.x - nx) > reach || Math.abs(o.y - ny) > reach) continue;
    const dx = nx - o.x;
    const dy = ny - o.y;
    const dist = Math.hypot(dx, dy) || 0.01;
    const minDist = (minSeparation(size) + minSeparation(o.size)) / 2;
    if (dist < minDist) {
      nx += (dx / dist) * (minDist - dist);
      ny += (dy / dist) * (minDist - dist);
    }
  }

  const floor = floorYAt(nx);
  if (ny > floor) ny = floor;
  return clampXInGlobeAtY(nx, ny);
}

function spawnFromTop(xHint) {
  const x = xHint ?? 40 + Math.random() * 20;
  const clamped = clampToGlobe(x, 10);
  return { x: clamped.x, y: 6 + Math.random() * 10 };
}

function clampToGlobe(x, y, radius = GLOBE_RADIUS) {
  const dx = x - GLOBE_CENTER.x;
  const dy = y - GLOBE_CENTER.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= radius) return { x, y };
  const scale = radius / dist;
  return {
    x: GLOBE_CENTER.x + dx * scale,
    y: GLOBE_CENTER.y + dy * scale,
  };
}

function createParticle(type, xHint, id, velocity) {
  const spawn = spawnFromTop(xHint);
  const floor = floorYAt(spawn.x);

  return {
    id,
    type,
    x: spawn.x,
    y: spawn.y,
    vx: velocity?.vx ?? (Math.random() - 0.5) * 0.012,
    vy: velocity?.vy ?? 0.01 + Math.random() * 0.008,
    opacity: 0.42 + Math.random() * 0.18,
    fading: false,
    settled: false,
    size: 7 + Math.random() * 4,
    rotate: Math.random() * 360,
    restX: spawn.x,
    restY: floor,
  };
}

function needsPhysics(list) {
  return list.some(
    (p) =>
      p.fading ||
      !p.settled ||
      Math.abs(p.vx) > 0.001 ||
      Math.abs(p.vy) > 0.001,
  );
}

function ParticleIcon({ type, size }) {
  const reaction = REACTIONS.find((r) => r.id === type);
  const Icon = reaction?.icon ?? Snowflake;
  const filled = type !== "snowflake";
  return (
    <Icon
      size={size}
      className={reaction?.colorClass ?? "text-blue-400"}
      fill={filled ? "currentColor" : "none"}
      strokeWidth={filled ? 0 : 2}
    />
  );
}

function ReactionButton({ reaction, count, onReact, isBouncing }) {
  const Icon = reaction.icon;
  const filled = reaction.id !== "snowflake";
  const buttonRef = useRef(null);
  const holdTimerRef = useRef(null);
  const [bursts, setBursts] = useState([]);

  const stopHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const addBurst = useCallback(() => {
    const id = `${Date.now()}-${Math.random()}`;
    setBursts((prev) => [...prev, { id, angle: Math.random() * 360 }]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 600);
  }, []);

  const fire = useCallback(() => {
    addBurst();
    onReact(reaction.id, buttonRef.current);
  }, [addBurst, onReact, reaction.id]);

  const startHold = useCallback(
    (e) => {
      e.preventDefault();
      if (e.button !== undefined && e.button !== 0) return;
      stopHold();
      fire();
      holdTimerRef.current = window.setInterval(fire, HOLD_INTERVAL_MS);
    },
    [fire, stopHold],
  );

  useEffect(() => () => stopHold(), [stopHold]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      aria-label={reaction.label}
      className="group flex touch-none select-none flex-col items-center gap-1.5 focus:outline-none"
    >
      <motion.div
        className={`relative flex h-12 w-12 cursor-pointer items-center justify-center overflow-visible rounded-full bg-gradient-to-br shadow-md transition-all duration-300 group-hover:shadow-lg sm:h-14 sm:w-14 ${reaction.btnFrom} ${reaction.btnTo} ${reaction.btnHoverFrom} ${reaction.btnHoverTo}`}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={
          isBouncing
            ? {
                scale: [1, 1.15, 0.95, 1.08, 1],
              }
            : {}
        }
        transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
      >
        {bursts.map((burst) => (
          <span
            key={burst.id}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2"
            style={{ transform: `rotate(${burst.angle}deg)` }}
          >
            <span
              className={`aira-reaction-burst block h-2 w-2 rounded-full ${reaction.colorClass}`}
              style={{ backgroundColor: "currentColor" }}
            />
          </span>
        ))}
        <motion.div
          animate={isBouncing ? { scale: [1, 1.3, 0.85, 1.15, 1] } : {}}
          transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
        >
          <Icon
            className={`h-6 w-6 sm:h-7 sm:w-7 ${reaction.colorClass}`}
            fill={filled ? "currentColor" : "none"}
            strokeWidth={filled ? 0 : 2}
          />
        </motion.div>
      </motion.div>
      <motion.span
        key={`${reaction.id}-${count}`}
        initial={{ scale: 1.2, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className={`font-display text-xs font-semibold tabular-nums text-slate-700 transition-colors sm:text-sm ${reaction.countHover}`}
      >
        {formatCount(count)}
      </motion.span>
    </button>
  );
}

export default function SnowGlobeSection() {
  const [counts, setCounts] = useState(
    () => readStoredCounts() ?? emptyCounts(),
  );
  const [particles, setParticles] = useState([]);
  const [buttonBounce, setButtonBounce] = useState(null);
  const [floatingIcons, setFloatingIcons] = useState([]);

  const particlesRef = useRef([]);
  const seenEventIdsRef = useRef(new Set());
  const spawnBaselineRef = useRef(null);
  const rafRef = useRef(null);
  const physicsActiveRef = useRef(false);
  const localIdRef = useRef(0);
  const glassRef = useRef(null);
  const particleLayerRef = useRef(null);
  const particleElsRef = useRef(new Map());
  const containerRef = useRef(null);
  const [isShaking, setIsShaking] = useState(false);

  const syncParticleDom = useCallback((list, dirtyIds) => {
    const byId = new Map(list.map((p) => [p.id, p]));
    const ids = dirtyIds ?? list.map((p) => p.id);
    for (const id of ids) {
      const p = byId.get(id);
      const el = particleElsRef.current.get(id);
      if (!p || !el) continue;
      el.style.transform = `translate3d(-50%,-50%,0) rotate(${p.rotate}deg)`;
      el.style.left = `${p.x}%`;
      el.style.top = `${p.y}%`;
      el.style.opacity = String(p.opacity);
    }
  }, []);

  const startPhysics = useCallback(() => {
    if (physicsActiveRef.current) return;
    physicsActiveRef.current = true;

    let lastTime = 0;

    function tick(now) {
      if (document.hidden) {
        physicsActiveRef.current = false;
        rafRef.current = null;
        return;
      }

      const dt = lastTime ? Math.min((now - lastTime) / 16.67, 2) : 1;
      lastTime = now;

      const prev = particlesRef.current;
      const next = [];
      const dirtyIds = [];
      let countChanged = false;

      for (const p of prev) {
        if (p.settled && !p.fading) {
          next.push(p);
          continue;
        }

        let { x, y, vx, vy, opacity, fading, rotate, settled, restX, restY } =
          p;

        if (!fading) {
          if (!settled) {
            vy += GRAVITY * dt;
            vx *= DRAG ** dt;
            vy *= DRAG ** dt;
            x += vx * dt;
            y += vy * dt;
            rotate += 0.04 * dt;

            const dx = x - GLOBE_CENTER.x;
            const dy = y - GLOBE_CENTER.y;
            const dist = Math.hypot(dx, dy);

            if (dist > GLOBE_RADIUS) {
              const nx = dx / dist;
              const ny = dy / dist;
              x = GLOBE_CENTER.x + nx * GLOBE_RADIUS;
              y = GLOBE_CENTER.y + ny * GLOBE_RADIUS;
              const dot = vx * nx + vy * ny;
              if (dot > 0) {
                vx -= dot * nx;
                vy -= dot * ny;
              }
              vx *= 0.5;
              vy *= 0.5;
            }

            const floor = floorYAt(x);
            if (y >= floor) {
              y = floor;
              if (vy > 0) vy = 0;
              vx *= 0.65;
              if (Math.abs(vx) < 0.012) {
                settled = true;
                vx = 0;
                vy = 0;
                const raw = findRestPosition(next, p.id, p.size);
                const rest = nudgeFromNeighbors(
                  raw.x,
                  raw.y,
                  p.size,
                  next,
                  p.id,
                );
                restX = rest.x;
                restY = rest.y;
                x = rest.x;
                y = rest.y;
              }
            }
          }
        }

        if (fading) opacity -= 0.009 * dt;

        if (opacity > 0.03) {
          next.push({
            ...p,
            x,
            y,
            vx,
            vy,
            opacity,
            fading,
            rotate,
            settled,
            restX,
            restY,
          });
          dirtyIds.push(p.id);
        }
      }

      if (next.length !== prev.length) countChanged = true;

      particlesRef.current = next;
      syncParticleDom(next, countChanged ? undefined : dirtyIds);

      if (countChanged) {
        setParticles([...next]);
      }

      if (!needsPhysics(next)) {
        physicsActiveRef.current = false;
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [syncParticleDom]);

  const applyCounts = useCallback((nextCounts) => {
    const next = normalizeCounts(nextCounts);
    if (!next) return;

    setCounts((prev) => {
      const prevTotal = countsTotal(prev);
      const nextTotal = countsTotal(next);

      if (nextTotal === 0 && prevTotal > 0) return prev;

      const merged = mergeCounts(prev, next);
      if (
        merged.love !== prev.love ||
        merged.like !== prev.like ||
        merged.snowflake !== prev.snowflake
      ) {
        writeStoredCounts(merged);
      }
      return merged;
    });
  }, []);

  const spawnParticle = useCallback((type, x, y, eventId) => {
    const key = eventId ?? `local-${++localIdRef.current}`;
    if (eventId && seenEventIdsRef.current.has(eventId)) return;
    if (eventId) seenEventIdsRef.current.add(eventId);

    const next = [...particlesRef.current];
    next.push(createParticle(type, x, key));
    particlesRef.current = next;
    setParticles([...next]);
    startPhysics();
  }, [startPhysics]);

  const spawnFromCountDelta = useCallback(
    (serverCounts) => {
      const next = normalizeCounts(serverCounts);
      if (!next) return;

      if (!spawnBaselineRef.current) {
        spawnBaselineRef.current = { ...next };
        return;
      }

      const base = spawnBaselineRef.current;
      const types = ["love", "like", "snowflake"];

      for (const type of types) {
        const delta = Math.max(0, (next[type] ?? 0) - (base[type] ?? 0));
        const capped = Math.min(delta, 5);
        for (let i = 0; i < capped; i += 1) {
          const spawn = spawnFromTop(40 + Math.random() * 20);
          spawnParticle(
            type,
            spawn.x,
            undefined,
            `remote-${type}-${base[type] + i}-${Date.now()}`,
          );
        }
      }

      spawnBaselineRef.current = { ...next };
    },
    [spawnParticle],
  );

  const addFloatingIcon = useCallback((type, buttonEl) => {
    const container = containerRef.current;
    const globe = glassRef.current;
    if (!container || !buttonEl || !globe) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = buttonEl.getBoundingClientRect();
    const globeRect = globe.getBoundingClientRect();

    const id = `float-${Date.now()}-${Math.random()}`;
    const icon = {
      id,
      type,
      startX: buttonRect.left - containerRect.left + buttonRect.width / 2,
      startY: buttonRect.top - containerRect.top + buttonRect.height / 2,
      endX:
        globeRect.left -
        containerRect.left +
        globeRect.width * (0.32 + Math.random() * 0.36),
      endY:
        globeRect.top -
        containerRect.top +
        globeRect.height * (0.22 + Math.random() * 0.28),
      rotate: (Math.random() - 0.5) * 48,
    };
    setFloatingIcons((prev) => [...prev, icon]);
    window.setTimeout(() => {
      setFloatingIcons((prev) => prev.filter((item) => item.id !== id));
    }, 1100);
  }, []);

  const syncFromServer = useCallback(async () => {
    try {
      const res = await fetch("/api/reactions?events=0", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      spawnFromCountDelta(data.counts);
      applyCounts(data.counts);
    } catch {
      /* ignore */
    }
  }, [applyCounts, spawnFromCountDelta]);

  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch("/api/reactions?events=0", {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        applyCounts(data.counts);
        const baseline = normalizeCounts(data.counts);
        if (baseline) spawnBaselineRef.current = { ...baseline };
      } catch {
        /* ignore */
      }
    }

    loadInitial();

    const poll = setInterval(() => {
      syncFromServer();
    }, POLL_MS);

    return () => {
      clearInterval(poll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [applyCounts, syncFromServer]);

  const scatterParticles = useCallback(
    (ox, oy) => {
      const cur = particlesRef.current;
      if (cur.length === 0) return;
      const next = cur.map((p) => {
        const dx = p.x - ox;
        const dy = p.y - oy;
        const dist = Math.hypot(dx, dy) || 1;
        const force = 0.1 + Math.random() * 0.14;
        const clamped = clampToGlobe(p.x, p.y);
        return {
          ...p,
          x: clamped.x,
          y: clamped.y,
          settled: false,
          vx:
            (dx / dist) * force * 0.6 + (Math.random() - 0.5) * 0.05,
          vy:
            (dy / dist) * force * 0.6 -
            0.08 -
            Math.random() * 0.06,
          fading: false,
          opacity: Math.min(0.62, p.opacity + 0.06),
        };
      });
      particlesRef.current = next;
      syncParticleDom(next);
      startPhysics();
    },
    [startPhysics, syncParticleDom],
  );

  useEffect(() => {
    syncParticleDom(particlesRef.current);
  }, [particles, syncParticleDom]);

  function handleGlobeClick(e) {
    e.stopPropagation();
    unlockGuessSounds();
    playGlobeShakeSound();
    const glass = glassRef.current;
    if (!glass) return;
    const rect = glass.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const origin = clampToGlobe(rawX, rawY);
    scatterParticles(origin.x, origin.y);
    setIsShaking(true);
    window.setTimeout(() => setIsShaking(false), 480);
  }

  const postReaction = useCallback(
    async (type) => {
      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          applyCounts(data.counts);
          const baseline = normalizeCounts(data.counts);
          if (baseline) {
            spawnBaselineRef.current = mergeCounts(
              spawnBaselineRef.current ?? emptyCounts(),
              baseline,
            );
          }
        }
      } catch {
        /* ignore */
      }
    },
    [applyCounts],
  );

  const bumpLocalCount = useCallback((type) => {
    setCounts((prev) => {
      const merged = { ...prev, [type]: prev[type] + 1 };
      writeStoredCounts(merged);
      spawnBaselineRef.current = { ...merged };
      return merged;
    });
  }, []);

  const handleReaction = useCallback(
    (type, buttonEl) => {
      unlockGuessSounds();
      playGlobeReactionSound(type);
      const spawn = spawnFromTop(40 + Math.random() * 20);
      spawnParticle(type, spawn.x, undefined);
      bumpLocalCount(type);
      postReaction(type);
      setButtonBounce(type);
      window.setTimeout(() => setButtonBounce(null), 500);
      addFloatingIcon(type, buttonEl);
    },
    [addFloatingIcon, bumpLocalCount, postReaction, spawnParticle],
  );

  return (
    <section className="w-full" aria-labelledby="snow-globe-heading">
      <FeatureCard className="overflow-visible !px-4 !py-5 text-left sm:!px-6 sm:!py-7">
        <h2
          id="snow-globe-heading"
          className="font-display text-center text-xl font-bold text-aira-navy sm:text-2xl"
        >
          Kirim dukunganmu!
        </h2>
        <p className="mt-1.5 text-center text-sm leading-relaxed text-slate-500">
          Klik ikon love, like, atau salju melayang di bola kacanya
        </p>

        <div
          ref={containerRef}
          className="relative isolate mt-7 flex flex-row items-center justify-center gap-5 overflow-visible sm:gap-7"
        >
          <div
            className={`relative w-[min(100%,14rem)] shrink-0 sm:w-60 ${isShaking ? "aira-globe-shake" : ""}`}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="relative aspect-square w-full"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-200 shadow-2xl" />
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-100 via-slate-50 to-slate-100 opacity-40" />

              <button
                type="button"
                onClick={handleGlobeClick}
                aria-label="Goyangkan bola kaca"
                className="absolute inset-0 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
              >
                <div className="absolute inset-0">
                  <Image
                    src="/snow-globe.png"
                    alt=""
                    width={400}
                    height={400}
                    className="h-full w-full object-contain drop-shadow-lg"
                    priority
                  />

                  <div
                    ref={glassRef}
                    className="pointer-events-none absolute overflow-hidden rounded-full"
                    style={{
                      left: GLASS.left,
                      top: GLASS.top,
                      width: GLASS.width,
                      aspectRatio: "1",
                    }}
                  >
                    {[18, 38, 58, 74].map((left, i) => (
                      <span
                        key={`snow-${left}`}
                        className="aira-globe-snow absolute h-0.5 w-0.5 rounded-full bg-white"
                        style={{
                          left: `${left}%`,
                          top: "4%",
                          animationDuration: `${5.5 + i}s`,
                          animationDelay: `${i * 0.8}s`,
                        }}
                      />
                    ))}

                    <div
                      ref={particleLayerRef}
                      className="absolute inset-0 [contain:layout_paint]"
                      style={{ transform: "translateZ(0)" }}
                    >
                      {particles.map((particle) => (
                        <div
                          key={particle.id}
                          ref={(el) => {
                            if (el) particleElsRef.current.set(particle.id, el);
                            else particleElsRef.current.delete(particle.id);
                          }}
                          className="pointer-events-none absolute left-0 top-0 will-change-transform"
                          style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            opacity: particle.opacity,
                            transform: `translate(-50%, -50%) rotate(${particle.rotate}deg)`,
                          }}
                        >
                          <ParticleIcon
                            type={particle.type}
                            size={particle.size}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pointer-events-none absolute left-2 top-2 h-1/3 w-1/3 rounded-full bg-white opacity-20 blur-xl" />
                </div>
              </button>
            </motion.div>

            <div className="absolute bottom-0 left-1/2 h-6 w-3/4 -translate-x-1/2 translate-y-full rounded-full bg-gradient-to-b from-slate-300 to-transparent opacity-25 blur-xl" />
          </div>

          <motion.div
            initial={{ x: 16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="flex flex-col gap-3.5 sm:gap-4"
          >
            {REACTIONS.map((reaction) => (
              <ReactionButton
                key={reaction.id}
                reaction={reaction}
                count={counts[reaction.id]}
                isBouncing={buttonBounce === reaction.id}
                onReact={handleReaction}
              />
            ))}
          </motion.div>

          <AnimatePresence>
            {floatingIcons.map((icon) => (
              <motion.div
                key={icon.id}
                className={`pointer-events-none absolute z-20 ${REACTIONS.find((r) => r.id === icon.type)?.colorClass ?? ""}`}
                style={{ width: 22, height: 22, marginLeft: -11, marginTop: -11 }}
                initial={{
                  left: icon.startX,
                  top: icon.startY,
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                }}
                animate={{
                  left: icon.endX,
                  top: icon.endY,
                  opacity: 0,
                  scale: 0.38,
                  rotate: icon.rotate,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeIn" }}
              >
                <ParticleIcon type={icon.type} size={22} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </FeatureCard>
    </section>
  );
}
