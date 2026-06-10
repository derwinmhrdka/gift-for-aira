"use client";

import FeatureCard from "@/components/FeatureCard";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const REACTIONS = [
  {
    id: "love",
    label: "Love",
    emoji: "❤️",
    iconClass: "text-rose-400",
    particleClass: "text-rose-300",
    bgClass: "bg-rose-50 hover:bg-rose-100",
    ringClass: "focus-visible:ring-rose-300",
  },
  {
    id: "like",
    label: "Like",
    emoji: "👍",
    iconClass: "text-amber-400",
    particleClass: "text-amber-200",
    bgClass: "bg-amber-50 hover:bg-amber-100",
    ringClass: "focus-visible:ring-amber-300",
  },
  {
    id: "snowflake",
    label: "Snowflake",
    emoji: "❄️",
    iconClass: "text-sky-400",
    particleClass: "text-sky-300",
    bgClass: "bg-sky-50 hover:bg-sky-100",
    ringClass: "focus-visible:ring-sky-300",
  },
];

const MAX_PARTICLES = 48;
const FADE_START = 36;
const POLL_MS = 2000;
const GRAVITY = 0.0055;
const DRAG = 0.988;
const SETTLE_SPEED = 0.014;

function formatCount(value) {
  const n = Number(value) || 0;
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(n);
}

function randomVelocity() {
  return {
    vx: (Math.random() - 0.5) * 0.06,
    vy: (Math.random() - 0.5) * 0.06,
  };
}

function createParticle(type, x, y, id, velocity) {
  const base = randomVelocity();
  const spawnX = x ?? 20 + Math.random() * 60;
  const spawnY = y ?? 15 + Math.random() * 55;

  return {
    id,
    type,
    x: spawnX,
    y: spawnY,
    vx: velocity?.vx ?? base.vx,
    vy: velocity?.vy ?? base.vy,
    opacity: 0.55 + Math.random() * 0.35,
    fading: false,
    settled: false,
    size: 4 + Math.random() * 3,
    rotate: Math.random() * 360,
    restX: spawnX,
    restY: 58 + Math.random() * 16,
  };
}

function SoftSnowflake({ size, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M6.8 6.8l2.8 2.8M14.4 14.4l2.8 2.8M17.2 6.8l-2.8 2.8M9.6 14.4l-2.8 2.8" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GlobeParticle({ type, size, rotate, className = "" }) {
  const reaction = REACTIONS.find((item) => item.id === type);
  const glow = "drop-shadow-[0_0_3px_rgba(255,255,255,0.85)]";

  if (type === "snowflake") {
    return (
      <SoftSnowflake
        size={size}
        className={`${reaction?.particleClass ?? "text-sky-300"} ${glow} ${className}`}
      />
    );
  }

  if (type === "love") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 12 12"
        className={`${reaction?.particleClass ?? "text-rose-300"} ${glow} ${className}`}
        aria-hidden
      >
        <circle cx="6" cy="6" r="2.2" fill="currentColor" opacity="0.75" />
        <circle cx="6" cy="6" r="1" fill="white" opacity="0.45" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      className={`${reaction?.particleClass ?? "text-amber-200"} ${glow} ${className}`}
      aria-hidden
    >
      <circle cx="6" cy="6" r="2.4" fill="currentColor" opacity="0.7" />
      <path
        d="M6 3.5v5M4 5.5l2-1.5 2 1.5"
        stroke="white"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function CounterIcon({ type, className = "" }) {
  const reaction = REACTIONS.find((item) => item.id === type);
  return (
    <GlobeParticle
      type={type}
      size={14}
      rotate={0}
      className={`${reaction?.iconClass ?? ""} ${className}`}
    />
  );
}

export default function SnowGlobeSection() {
  const [counts, setCounts] = useState({ love: 0, like: 0, snowflake: 0 });
  const [particles, setParticles] = useState([]);
  const [sending, setSending] = useState(null);

  const particlesRef = useRef([]);
  const seenEventIdsRef = useRef(new Set());
  const lastPollRef = useRef(Date.now());
  const rafRef = useRef(null);
  const localParticleIdRef = useRef(0);
  const globeRef = useRef(null);
  const [isShaking, setIsShaking] = useState(false);

  const applyCounts = useCallback((nextCounts) => {
    if (!nextCounts) return;
    setCounts({
      love: Number(nextCounts.love) || 0,
      like: Number(nextCounts.like) || 0,
      snowflake: Number(nextCounts.snowflake) || 0,
    });
  }, []);

  const spawnParticle = useCallback((type, x, y, eventId) => {
    const dedupeKey = eventId ?? `local-${++localParticleIdRef.current}`;
    if (eventId && seenEventIdsRef.current.has(eventId)) return;
    if (eventId) seenEventIdsRef.current.add(eventId);

    const next = [...particlesRef.current];
    if (next.length >= MAX_PARTICLES) {
      const fadeCount = Math.max(1, next.length - FADE_START + 1);
      for (let i = 0; i < fadeCount && i < next.length; i += 1) {
        next[i].fading = true;
      }
    }

    next.push(createParticle(type, x, y, dedupeKey));
    particlesRef.current = next;
    setParticles(next);
  }, []);

  const syncFromServer = useCallback(
    async (sinceMs, { includeEvents = true } = {}) => {
      try {
        const query = sinceMs > 0 ? `?since=${sinceMs}` : "";
        const res = await fetch(`/api/reactions${query}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;

        applyCounts(data.counts);

        if (includeEvents) {
          for (const event of data.events ?? []) {
            spawnParticle(event.type, event.x, event.y, event.id);
          }
        }
      } catch {
        /* ignore polling errors */
      }
    },
    [applyCounts, spawnParticle],
  );

  useEffect(() => {
    lastPollRef.current = Date.now();
    syncFromServer(0, { includeEvents: false });

    const poll = setInterval(() => {
      const since = lastPollRef.current;
      lastPollRef.current = Date.now();
      syncFromServer(since, { includeEvents: true });
    }, POLL_MS);

    return () => clearInterval(poll);
  }, [syncFromServer]);

  useEffect(() => {
    function tick() {
      const next = [];
      for (const particle of particlesRef.current) {
        let {
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
        } = particle;

        if (!fading) {
          if (!settled) {
            vy += GRAVITY;
            vx *= DRAG;
            vy *= DRAG;
            x += vx;
            y += vy;
            rotate += 0.12;

            const dx = x - 50;
            const dy = y - 50;
            const dist = Math.hypot(dx, dy);
            const maxDist = 38;

            if (dist > maxDist) {
              const nx = dx / dist;
              const ny = dy / dist;
              x = 50 + nx * maxDist;
              y = 50 + ny * maxDist;
              const dot = vx * nx + vy * ny;
              vx = (vx - 2 * dot * nx) * 0.55;
              vy = (vy - 2 * dot * ny) * 0.55;
            }

            const speed = Math.hypot(vx, vy);
            if (speed < SETTLE_SPEED && y >= restY - 5) {
              settled = true;
              vx = 0;
              vy = 0;
            }
          } else {
            x += (restX - x) * 0.04;
            y += (restY - y) * 0.04;
            rotate += 0.02;
          }
        }

        if (fading) {
          opacity -= 0.012;
        }

        if (opacity > 0.04) {
          next.push({
            ...particle,
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

      particlesRef.current = next;
      setParticles(next);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scatterParticles = useCallback((originX, originY) => {
    const current = particlesRef.current;
    if (current.length === 0) return;

    const next = current.map((particle) => {
      const dx = particle.x - originX;
      const dy = particle.y - originY;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;
      const force = 0.22 + Math.random() * 0.32;

      return {
        ...particle,
        settled: false,
        vx: particle.vx + nx * force + (Math.random() - 0.5) * 0.14,
        vy: particle.vy + ny * force + (Math.random() - 0.5) * 0.14 - 0.06,
        fading: false,
      };
    });

    particlesRef.current = next;
    setParticles(next);
  }, []);

  function handleGlobeClick(event) {
    event.stopPropagation();

    const globe = globeRef.current;
    if (!globe) return;

    const rect = globe.getBoundingClientRect();
    const originX = ((event.clientX - rect.left) / rect.width) * 100;
    const originY = ((event.clientY - rect.top) / rect.height) * 100;

    scatterParticles(originX, originY);
    setIsShaking(true);
    window.setTimeout(() => setIsShaking(false), 480);
  }

  async function handleReaction(type) {
    if (sending) return;

    const x = 10 + Math.random() * 80;
    const y = 15 + Math.random() * 55;
    spawnParticle(type, x, y);

    setSending(type);
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, x, y }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        applyCounts(data.counts);
        if (data.event?.id) {
          seenEventIdsRef.current.add(data.event.id);
        }
      }
    } catch {
      /* local particle already shown */
    } finally {
      setSending(null);
    }
  }

  return (
    <section className="w-full" aria-labelledby="snow-globe-heading">
      <FeatureCard className="!px-4 !py-5 text-left sm:!px-6 sm:!py-7">
        <h2
          id="snow-globe-heading"
          className="font-display text-center text-xl font-bold text-aira-navy sm:text-2xl"
        >
          berikan dukunganmu!
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
          Spread the love!
        </p>

        <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:justify-center sm:gap-6">
          <div className="flex w-full max-w-[17rem] flex-col items-center sm:max-w-[18rem]">
            <div className="relative w-full">
              <button
                type="button"
                ref={globeRef}
                onClick={handleGlobeClick}
                aria-label="Goyangkan bola kaca"
                className={`relative mx-auto block aspect-square w-full max-w-[15rem] cursor-pointer rounded-full transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${isShaking ? "aira-globe-shake" : ""}`}
                style={{
                  background:
                    "radial-gradient(circle at 32% 24%, rgba(255,255,255,0.98) 0%, rgba(224,242,254,0.72) 18%, rgba(186,230,253,0.45) 38%, rgba(125,211,252,0.28) 58%, rgba(56,189,248,0.18) 78%, rgba(14,116,144,0.12) 100%)",
                  boxShadow:
                    "0 10px 28px rgba(56,189,248,0.22), 0 4px 12px rgba(15,23,42,0.08), inset 0 10px 24px rgba(255,255,255,0.85), inset 0 -14px 28px rgba(56,189,248,0.14), inset 0 0 0 1px rgba(255,255,255,0.55)",
                }}
              >
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_78%,rgba(186,230,253,0.35),transparent_52%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.25),transparent_45%)]" />

                  <div className="pointer-events-none absolute bottom-[18%] left-[12%] h-10 w-6 rounded-full bg-emerald-700/55 blur-[1px]" />
                  <div className="pointer-events-none absolute bottom-[20%] right-[16%] h-8 w-5 rounded-full bg-emerald-700/45 blur-[1px]" />
                  <div className="pointer-events-none absolute bottom-[24%] left-[28%] h-12 w-7 rounded-full bg-emerald-800/50 blur-[1px]" />

                  <div className="pointer-events-none absolute inset-x-[18%] bottom-[8%] flex justify-center">
                    <Image
                      src="/baby.png"
                      alt=""
                      width={120}
                      height={120}
                      className="h-auto w-[42%] max-w-[5.5rem] object-contain drop-shadow-[0_4px_10px_rgba(15,23,42,0.12)]"
                    />
                  </div>

                  {particles.map((particle) => (
                    <div
                      key={particle.id}
                      className="pointer-events-none absolute will-change-transform"
                      style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        opacity: particle.opacity,
                        transform: `translate(-50%, -50%) rotate(${particle.rotate}deg)`,
                      }}
                    >
                      <GlobeParticle
                        type={particle.type}
                        size={particle.size}
                        rotate={particle.rotate}
                      />
                    </div>
                  ))}

                  <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent_50%)]" />
                </div>

                <div className="pointer-events-none absolute inset-[3%] rounded-full border border-white/35" />
                <div className="pointer-events-none absolute inset-[8%] rounded-full border border-sky-100/20" />
                <div className="pointer-events-none absolute left-[10%] top-[8%] h-[36%] w-[42%] rounded-full bg-gradient-to-br from-white/75 via-white/25 to-transparent blur-[2px]" />
                <div className="pointer-events-none absolute bottom-[12%] right-[14%] h-4 w-6 rounded-full bg-white/20 blur-[2px]" />
              </button>

              <div className="relative z-10 -mt-3 mx-auto w-[88%] rounded-[1.35rem] border border-amber-950/20 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 px-3 py-3 shadow-[0_8px_20px_rgba(69,26,3,0.22)]">
                <div className="rounded-xl bg-white/96 px-2 py-2.5 shadow-inner shadow-amber-950/5">
                  <div className="grid grid-cols-3 gap-1">
                    {REACTIONS.map((reaction) => (
                      <div
                        key={reaction.id}
                        className="flex flex-col items-center gap-1 rounded-lg px-1 py-1"
                      >
                        <CounterIcon type={reaction.id} />
                        <span className="font-display text-xs font-bold tabular-nums text-aira-navy">
                          {formatCount(counts[reaction.id])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-3 sm:flex-col sm:gap-3.5">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.id}
                type="button"
                onClick={() => handleReaction(reaction.id)}
                disabled={Boolean(sending)}
                aria-label={reaction.label}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 text-2xl shadow-md shadow-sky-200/30 transition active:scale-95 disabled:opacity-60 sm:h-14 sm:w-14 ${reaction.bgClass} ${reaction.ringClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        </div>
      </FeatureCard>
    </section>
  );
}
