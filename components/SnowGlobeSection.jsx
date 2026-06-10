"use client";

import FeatureCard from "@/components/FeatureCard";
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
  const snowLift = 17;
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
  for (const p of settledParticles(others, excludeId)) {
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

function separateSettledParticles(list) {
  const next = list.map((p) => ({ ...p }));
  let moved = false;

  for (let iter = 0; iter < 4; iter += 1) {
    for (let i = 0; i < next.length; i += 1) {
      const p = next[i];
      if (!p.settled || p.fading) continue;

      let { x, y } = p;
      for (let j = 0; j < next.length; j += 1) {
        if (i === j) continue;
        const o = next[j];
        if (!o.settled || o.fading) continue;

        const dx = x - o.x;
        const dy = y - o.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        const minDist = (minSeparation(p.size) + minSeparation(o.size)) / 2;
        if (dist < minDist) {
          const push = ((minDist - dist) / dist) * 0.52;
          x += dx * push;
          y += dy * push;
          moved = true;
        }
      }

      const floor = floorYAt(x);
      if (y > floor) y = floor;
      const clamped = clampXInGlobeAtY(x, y);
      next[i] = { ...p, x: clamped.x, y: clamped.y, restX: clamped.x, restY: clamped.y };
    }
  }

  return { list: next, moved };
}

function hasSettledOverlap(list) {
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const a = list[i];
      const b = list[j];
      if (!a.settled || !b.settled || a.fading || b.fading) continue;
      const minDist = (minSeparation(a.size) + minSeparation(b.size)) / 2;
      if (Math.hypot(a.x - b.x, a.y - b.y) < minDist * 0.92) return true;
    }
  }
  return false;
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
    opacity: 0.75 + Math.random() * 0.2,
    fading: false,
    settled: false,
    size: 7 + Math.random() * 4,
    rotate: Math.random() * 360,
    restX: spawn.x,
    restY: floor,
  };
}

function needsPhysics(list) {
  return (
    list.some(
      (p) =>
        p.fading ||
        !p.settled ||
        Math.abs(p.vx) > 0.002 ||
        Math.abs(p.vy) > 0.002 ||
        Math.abs(p.restX - p.x) > 0.05 ||
        Math.abs(p.restY - p.y) > 0.05,
    ) || hasSettledOverlap(list)
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

  const stopHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const fire = useCallback(
    () => onReact(reaction.id, buttonRef.current),
    [onReact, reaction.id],
  );

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
        className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br shadow-md transition-all duration-300 group-hover:shadow-lg sm:h-14 sm:w-14 ${reaction.btnFrom} ${reaction.btnTo} ${reaction.btnHoverFrom} ${reaction.btnHoverTo}`}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={
          isBouncing
            ? {
                scale: [1, 1.15, 0.95, 1.08, 1],
              }
            : {}
        }
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <motion.div
          animate={isBouncing ? { scale: [1, 1.3, 0.85, 1.15, 1] } : {}}
          transition={{ duration: 0.5, ease: "easeInOut" }}
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
  const [counts, setCounts] = useState({ love: 0, like: 0, snowflake: 0 });
  const [particles, setParticles] = useState([]);
  const [buttonBounce, setButtonBounce] = useState(null);
  const [floatingIcons, setFloatingIcons] = useState([]);

  const particlesRef = useRef([]);
  const seenEventIdsRef = useRef(new Set());
  const lastPollRef = useRef(Date.now());
  const rafRef = useRef(null);
  const physicsActiveRef = useRef(false);
  const localIdRef = useRef(0);
  const glassRef = useRef(null);
  const particleLayerRef = useRef(null);
  const particleElsRef = useRef(new Map());
  const containerRef = useRef(null);
  const [isShaking, setIsShaking] = useState(false);

  const syncParticleDom = useCallback((list) => {
    for (const p of list) {
      const el = particleElsRef.current.get(p.id);
      if (!el) continue;
      el.style.left = `${p.x}%`;
      el.style.top = `${p.y}%`;
      el.style.opacity = String(p.opacity);
      el.style.transform = `translate(-50%, -50%) rotate(${p.rotate}deg)`;
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
      let countChanged = false;

      for (const p of prev) {
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
                const rest = findRestPosition(next, p.id, p.size);
                restX = rest.x;
                restY = rest.y;
                x = rest.x;
                y = rest.y;
              }
            }
          } else if (
            Math.abs(restX - x) > 0.04 ||
            Math.abs(restY - y) > 0.04
          ) {
            x += (restX - x) * 0.22;
            y += (restY - y) * 0.22;
          } else {
            x = restX;
            y = restY;
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
        }
      }

      if (next.length !== prev.length) countChanged = true;

      const separated = separateSettledParticles(next);
      const finalList = separated.list;

      particlesRef.current = finalList;
      syncParticleDom(finalList);

      if (countChanged) {
        setParticles([...finalList]);
      }

      if (!needsPhysics(finalList)) {
        physicsActiveRef.current = false;
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [syncParticleDom]);

  const applyCounts = useCallback((nextCounts, source) => {
    if (!nextCounts) return;
    setCounts((prev) => {
      const next = {
        love: Number(nextCounts.love) || 0,
        like: Number(nextCounts.like) || 0,
        snowflake: Number(nextCounts.snowflake) || 0,
      };
      if (source === "airtable") return next;
      return {
        love: Math.max(prev.love, next.love),
        like: Math.max(prev.like, next.like),
        snowflake: Math.max(prev.snowflake, next.snowflake),
      };
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

  const addFloatingIcon = useCallback((type, buttonEl) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    const buttonRect = buttonEl?.getBoundingClientRect();
    if (!containerRect || !buttonRect) return;

    const id = `float-${Date.now()}-${Math.random()}`;
    const icon = {
      id,
      type,
      x: buttonRect.left - containerRect.left + buttonRect.width / 2,
      y: buttonRect.top - containerRect.top + buttonRect.height / 2,
    };
    setFloatingIcons((prev) => [...prev, icon]);
    window.setTimeout(() => {
      setFloatingIcons((prev) => prev.filter((item) => item.id !== id));
    }, 2500);
  }, []);

  const syncFromServer = useCallback(
    async (sinceMs, { includeEvents = true } = {}) => {
      try {
        const q = sinceMs > 0 ? `?since=${sinceMs}` : "";
        const res = await fetch(`/api/reactions${q}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        applyCounts(data.counts, data.source);
        if (includeEvents) {
          for (const ev of data.events ?? []) {
            spawnParticle(ev.type, ev.x, ev.y, ev.id);
          }
        }
      } catch {
        /* ignore */
      }
    },
    [applyCounts, spawnParticle],
  );

  useEffect(() => {
    lastPollRef.current = Date.now();

    async function loadInitial() {
      try {
        const res = await fetch("/api/reactions?events=0", {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        applyCounts(data.counts, data.source);
      } catch {
        /* ignore */
      }
    }

    loadInitial();

    const poll = setInterval(() => {
      const since = lastPollRef.current;
      lastPollRef.current = Date.now();
      syncFromServer(since, { includeEvents: true });
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
          opacity: Math.min(0.95, p.opacity + 0.08),
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
    async (type, x, y) => {
      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, x, y }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          applyCounts(data.counts, data.source);
          if (data.event?.id) seenEventIdsRef.current.add(data.event.id);
        }
      } catch {
        /* ignore */
      }
    },
    [applyCounts],
  );

  const handleReaction = useCallback(
    (type, buttonEl) => {
      const spawn = spawnFromTop(40 + Math.random() * 20);
      spawnParticle(type, spawn.x, undefined);
      postReaction(type, spawn.x, spawn.y);
      setButtonBounce(type);
      window.setTimeout(() => setButtonBounce(null), 500);
      addFloatingIcon(type, buttonEl);
    },
    [addFloatingIcon, postReaction, spawnParticle],
  );

  return (
    <section className="w-full" aria-labelledby="snow-globe-heading">
      <FeatureCard className="!px-4 !py-5 text-left sm:!px-6 sm:!py-7">
        <h2
          id="snow-globe-heading"
          className="font-display text-center text-xl font-bold text-aira-navy sm:text-2xl"
        >
          Kirim dukunganmu!
        </h2>
        <p className="mt-1.5 text-center text-sm leading-relaxed text-slate-500">
          Klik ikon — hati, like, atau salju melayang di bola kacanya
        </p>

        <div
          ref={containerRef}
          className="relative mt-7 flex flex-row items-center justify-center gap-5 sm:gap-7"
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

                    <div ref={particleLayerRef} className="absolute inset-0">
                      {particles.map((particle) => (
                        <div
                          key={particle.id}
                          ref={(el) => {
                            if (el) particleElsRef.current.set(particle.id, el);
                            else particleElsRef.current.delete(particle.id);
                          }}
                          className="pointer-events-none absolute will-change-[left,top,transform,opacity]"
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
                initial={{ x: icon.x, y: icon.y, opacity: 1, scale: 1 }}
                animate={{
                  x: icon.x + (Math.random() - 0.5) * 60,
                  y: icon.y - 160,
                  opacity: 0,
                  scale: 0.45,
                  rotate: Math.random() * 180,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, ease: "easeOut" }}
                className={`pointer-events-none absolute ${REACTIONS.find((r) => r.id === icon.type)?.colorClass ?? ""}`}
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
