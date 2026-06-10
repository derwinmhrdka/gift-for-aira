"use client";

import FeatureCard from "@/components/FeatureCard";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const REACTIONS = [
  {
    id: "love",
    label: "Love",
    particleClass: "text-rose-400",
    btnFrom: "#f43f5e",
    btnTo: "#e11d48",
    burstClass: "text-rose-400",
  },
  {
    id: "like",
    label: "Like",
    particleClass: "text-amber-400",
    btnFrom: "#f59e0b",
    btnTo: "#d97706",
    burstClass: "text-amber-400",
  },
  {
    id: "snowflake",
    label: "Salju",
    particleClass: "text-sky-400",
    btnFrom: "#38bdf8",
    btnTo: "#0284c7",
    burstClass: "text-sky-400",
  },
];

const HOLD_INTERVAL_MS = 280;
const MAX_PARTICLES = 52;
const FADE_START = 38;
const POLL_MS = 2000;
const GRAVITY = 0.005;
const DRAG = 0.986;
const SETTLE_SPEED = 0.012;

const MAX_PREPOPULATE = 30;

function formatCount(value) {
  const n = Number(value) || 0;
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(n);
}

function randomVelocity(scale = 0.06) {
  return {
    vx: (Math.random() - 0.5) * scale,
    vy: (Math.random() - 0.5) * scale,
  };
}

function createParticle(type, x, y, id, velocity) {
  const base = randomVelocity();
  const spawnX = x ?? 22 + Math.random() * 56;
  const spawnY = y ?? 18 + Math.random() * 50;
  return {
    id,
    type,
    x: spawnX,
    y: spawnY,
    vx: velocity?.vx ?? base.vx,
    vy: velocity?.vy ?? base.vy,
    opacity: 0.7 + Math.random() * 0.25,
    fading: false,
    settled: false,
    size: 8 + Math.random() * 5,
    rotate: Math.random() * 360,
    restX: spawnX,
    restY: 60 + Math.random() * 14,
  };
}

function prePopulate(counts, idRef) {
  const total = (counts.love ?? 0) + (counts.like ?? 0) + (counts.snowflake ?? 0);
  if (total === 0) return [];

  const scale = Math.min(1, MAX_PREPOPULATE / total);
  const result = [];

  for (const { id } of REACTIONS) {
    const n = Math.round((counts[id] ?? 0) * scale);
    for (let i = 0; i < n; i += 1) {
      const x = 16 + Math.random() * 68;
      const restY = 57 + Math.random() * 16;
      result.push({
        ...createParticle(id, x, restY, `pre-${++idRef.current}`, { vx: 0, vy: 0 }),
        settled: true,
        vx: 0,
        vy: 0,
        y: restY,
      });
    }
  }

  return result;
}

function HeartSvg({ size, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.4 5.4 3 8.5 3C10.2 3 11.7 3.9 12 5C12.3 3.9 13.8 3 15.5 3C18.6 3 21 5.4 21 8.5C21 14.5 12 21 12 21Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

function ThumbSvg({ size, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M14 9V5.5C14 4.1 12.9 3 11.5 3L8 10v11h9.7c.9 0 1.7-.6 1.9-1.5L21 13c.2-1.1-.5-2-1.6-2H14z"
        fill="currentColor"
        opacity="0.9"
      />
      <path d="M6 21H4C3.4 21 3 20.6 3 20V11C3 10.4 3.4 10 4 10H6V21Z" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

function SnowflakeSvg({ size, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GlobeParticle({ type, size, className = "" }) {
  const reaction = REACTIONS.find((r) => r.id === type);
  const cls = `${reaction?.particleClass ?? "text-sky-300"} drop-shadow-[0_0_4px_rgba(255,255,255,0.9)] ${className}`;

  if (type === "love") return <HeartSvg size={size} className={cls} />;
  if (type === "like") return <ThumbSvg size={size} className={cls} />;
  return <SnowflakeSvg size={size} className={cls} />;
}

function ReactionUiIcon({ type, size = 24, className = "" }) {
  if (type === "love") return <HeartSvg size={size} className={className} />;
  if (type === "like") return <ThumbSvg size={size} className={className} />;
  return <SnowflakeSvg size={size} className={className} />;
}

function ReactionButton({ reaction, onReact }) {
  const [bursts, setBursts] = useState([]);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef(null);
  const burstIdRef = useRef(0);

  const stopHold = useCallback(() => {
    setIsHolding(false);
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const addBurst = useCallback(() => {
    const id = ++burstIdRef.current;
    setBursts((prev) => [...prev, { id }]);
    window.setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== id)), 560);
  }, []);

  const fire = useCallback(() => {
    addBurst();
    onReact(reaction.id);
  }, [addBurst, onReact, reaction.id]);

  const startHold = useCallback(
    (e) => {
      e.preventDefault();
      if (e.button !== undefined && e.button !== 0) return;
      if (holdTimerRef.current) { clearInterval(holdTimerRef.current); holdTimerRef.current = null; }
      setIsHolding(true);
      fire();
      holdTimerRef.current = window.setInterval(fire, HOLD_INTERVAL_MS);
    },
    [fire],
  );

  useEffect(() => () => stopHold(), [stopHold]);

  return (
    <button
      type="button"
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      aria-label={reaction.label}
      aria-pressed={isHolding}
      className="group relative touch-none select-none focus:outline-none"
    >
      {bursts.map((burst) => (
        <span
          key={burst.id}
          className={`aira-reaction-burst absolute left-1/2 bottom-[calc(100%+4px)] ${reaction.burstClass}`}
        >
          <ReactionUiIcon type={reaction.id} size={20} />
        </span>
      ))}
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-100 sm:h-16 sm:w-16 ${isHolding ? "scale-90" : "scale-100 group-hover:scale-105"}`}
        style={{
          background: `linear-gradient(145deg, ${reaction.btnFrom}, ${reaction.btnTo})`,
          boxShadow: isHolding
            ? `0 2px 6px ${reaction.btnTo}55, inset 0 2px 4px rgba(0,0,0,0.15)`
            : `0 4px 14px ${reaction.btnTo}55, 0 2px 4px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.35)`,
        }}
      >
        <ReactionUiIcon
          type={reaction.id}
          size={28}
          className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] sm:hidden"
        />
        <ReactionUiIcon
          type={reaction.id}
          size={32}
          className="hidden text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] sm:block"
        />
      </span>
    </button>
  );
}

export default function SnowGlobeSection() {
  const [counts, setCounts] = useState({ love: 0, like: 0, snowflake: 0 });
  const [particles, setParticles] = useState([]);

  const particlesRef = useRef([]);
  const seenEventIdsRef = useRef(new Set());
  const lastPollRef = useRef(Date.now());
  const rafRef = useRef(null);
  const localIdRef = useRef(0);
  const globeRef = useRef(null);
  const [isShaking, setIsShaking] = useState(false);

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
    if (next.length >= MAX_PARTICLES) {
      const n = Math.max(1, next.length - FADE_START + 1);
      for (let i = 0; i < n && i < next.length; i += 1) next[i].fading = true;
    }
    next.push(createParticle(type, x, y, key));
    particlesRef.current = next;
    setParticles([...next]);
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
      } catch { /* ignore */ }
    },
    [applyCounts, spawnParticle],
  );

  useEffect(() => {
    lastPollRef.current = Date.now();

    async function loadInitial() {
      try {
        const res = await fetch("/api/reactions", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;

        const initialCounts = data.counts ?? { love: 0, like: 0, snowflake: 0 };
        applyCounts(initialCounts, data.source);

        const pre = prePopulate(initialCounts, localIdRef);
        if (pre.length > 0) {
          particlesRef.current = pre;
          setParticles([...pre]);
        }

      } catch { /* ignore */ }
    }

    loadInitial();

    const poll = setInterval(() => {
      const since = lastPollRef.current;
      lastPollRef.current = Date.now();
      syncFromServer(since, { includeEvents: true });
    }, POLL_MS);

    return () => clearInterval(poll);
  }, [applyCounts, syncFromServer]);

  useEffect(() => {
    function tick() {
      const next = [];
      for (const p of particlesRef.current) {
        let { x, y, vx, vy, opacity, fading, rotate, settled, restX, restY } = p;

        if (!fading) {
          if (!settled) {
            vy += GRAVITY;
            vx *= DRAG;
            vy *= DRAG;
            x += vx;
            y += vy;
            rotate += 0.1;

            const dx = x - 50;
            const dy = y - 50;
            const dist = Math.hypot(dx, dy);
            const maxDist = 37;

            if (dist > maxDist) {
              const nx = dx / dist;
              const ny = dy / dist;
              x = 50 + nx * maxDist;
              y = 50 + ny * maxDist;
              const dot = vx * nx + vy * ny;
              vx = (vx - 2 * dot * nx) * 0.5;
              vy = (vy - 2 * dot * ny) * 0.5;
            }

            if (Math.hypot(vx, vy) < SETTLE_SPEED && y >= restY - 4) {
              settled = true;
              vx = 0;
              vy = 0;
            }
          } else {
            x += (restX - x) * 0.04;
            y += (restY - y) * 0.04;
            rotate += 0.015;
          }
        }

        if (fading) opacity -= 0.011;

        if (opacity > 0.03) {
          next.push({ ...p, x, y, vx, vy, opacity, fading, rotate, settled, restX, restY });
        }
      }

      particlesRef.current = next;
      setParticles([...next]);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const scatterParticles = useCallback((ox, oy) => {
    const cur = particlesRef.current;
    if (cur.length === 0) return;
    const next = cur.map((p) => {
      const dx = p.x - ox;
      const dy = p.y - oy;
      const dist = Math.hypot(dx, dy) || 1;
      const force = 0.25 + Math.random() * 0.35;
      return {
        ...p,
        settled: false,
        vx: p.vx + (dx / dist) * force + (Math.random() - 0.5) * 0.12,
        vy: p.vy + (dy / dist) * force + (Math.random() - 0.5) * 0.12 - 0.05,
        fading: false,
        opacity: Math.min(0.95, p.opacity + 0.1),
      };
    });
    particlesRef.current = next;
    setParticles([...next]);
  }, []);

  function handleGlobeClick(e) {
    e.stopPropagation();
    const globe = globeRef.current;
    if (!globe) return;
    const rect = globe.getBoundingClientRect();
    scatterParticles(
      ((e.clientX - rect.left) / rect.width) * 100,
      ((e.clientY - rect.top) / rect.height) * 100,
    );
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
      } catch { /* ignore */ }
    },
    [applyCounts],
  );

  const handleReaction = useCallback(
    (type) => {
      const x = 12 + Math.random() * 76;
      const y = 15 + Math.random() * 52;
      spawnParticle(type, x, y);
      postReaction(type, x, y);
    },
    [postReaction, spawnParticle],
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

        <div className="mt-7 flex flex-row items-center justify-center gap-5 sm:gap-6">
          <div className={`relative shrink-0 ${isShaking ? "aira-globe-shake" : ""}`}>
            <button
              type="button"
              onClick={handleGlobeClick}
              aria-label="Goyangkan bola kaca"
              className="relative block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              <Image
                src="/globe.png"
                alt="Bola kaca salju"
                width={240}
                height={320}
                className="h-auto w-[200px] sm:w-[230px]"
                priority
              />

              <div
                ref={globeRef}
                className="pointer-events-none absolute overflow-hidden rounded-full"
                style={{
                  left: "11%",
                  top: "2.5%",
                  width: "78%",
                  aspectRatio: "1",
                }}
              >
                {particles.map((particle) => (
                  <div
                    key={particle.id}
                    className="absolute will-change-transform"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      opacity: particle.opacity,
                      transform: `translate(-50%, -50%) rotate(${particle.rotate}deg)`,
                    }}
                  >
                    <GlobeParticle type={particle.type} size={particle.size} />
                  </div>
                ))}
              </div>
            </button>

            <div
              className="pointer-events-none absolute left-[16%] right-[16%]"
              style={{ bottom: "7%" }}
            >
              <div
                className="rounded-md px-2 py-1.5"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,251,235,0.92) 0%, rgba(255,247,220,0.88) 100%)",
                  boxShadow:
                    "inset 0 1px 2px rgba(255,255,255,0.85), inset 0 -1px 2px rgba(69,26,3,0.12)",
                }}
              >
                <div className="grid grid-cols-3 gap-0.5">
                  {REACTIONS.map((reaction) => (
                    <div key={reaction.id} className="flex flex-col items-center gap-0.5">
                      <ReactionUiIcon
                        type={reaction.id}
                        size={12}
                        className={reaction.particleClass}
                      />
                      <span className="font-display text-[10px] font-bold leading-none tabular-nums text-aira-navy">
                        {formatCount(counts[reaction.id])}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3.5 sm:gap-4">
            {REACTIONS.map((reaction) => (
              <ReactionButton
                key={reaction.id}
                reaction={reaction}
                onReact={handleReaction}
              />
            ))}
          </div>
        </div>
      </FeatureCard>
    </section>
  );
}
