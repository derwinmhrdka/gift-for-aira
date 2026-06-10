"use client";

import FeatureCard from "@/components/FeatureCard";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const REACTIONS = [
  {
    id: "love",
    label: "Love",
    emoji: "❤️",
    iconClass: "text-rose-500",
    bgClass: "bg-rose-50 hover:bg-rose-100",
    ringClass: "focus-visible:ring-rose-300",
  },
  {
    id: "like",
    label: "Like",
    emoji: "👍",
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50 hover:bg-amber-100",
    ringClass: "focus-visible:ring-amber-300",
  },
  {
    id: "snowflake",
    label: "Snowflake",
    emoji: "❄️",
    iconClass: "text-sky-500",
    bgClass: "bg-sky-50 hover:bg-sky-100",
    ringClass: "focus-visible:ring-sky-300",
  },
];

const MAX_PARTICLES = 42;
const FADE_START = 34;
const POLL_MS = 2500;

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
    vx: (Math.random() - 0.5) * 0.08,
    vy: (Math.random() - 0.5) * 0.08,
  };
}

function createParticle(type, x, y, id, velocity) {
  const base = randomVelocity();
  return {
    id,
    type,
    x,
    y,
    vx: velocity?.vx ?? base.vx,
    vy: velocity?.vy ?? base.vy,
    opacity: 1,
    fading: false,
  };
}

function ReactionGlyph({ type, className = "" }) {
  const reaction = REACTIONS.find((item) => item.id === type);
  return (
    <span className={`select-none ${reaction?.iconClass ?? ""} ${className}`}>
      {reaction?.emoji ?? "✨"}
    </span>
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
    async (sinceMs) => {
      try {
        const query = sinceMs > 0 ? `?since=${sinceMs}` : "";
        const res = await fetch(`/api/reactions${query}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;

        if (data.counts) {
          setCounts(data.counts);
        }

        for (const event of data.events ?? []) {
          spawnParticle(event.type, event.x, event.y, event.id);
        }
      } catch {
        /* ignore polling errors */
      }
    },
    [spawnParticle],
  );

  useEffect(() => {
    lastPollRef.current = Date.now();

    async function loadInitial() {
      try {
        const res = await fetch("/api/reactions", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.counts) {
          setCounts(data.counts);
        }
      } catch {
        /* ignore */
      }
    }

    loadInitial();

    const poll = setInterval(() => {
      const since = lastPollRef.current;
      lastPollRef.current = Date.now();
      syncFromServer(since);
    }, POLL_MS);

    return () => clearInterval(poll);
  }, [syncFromServer]);

  useEffect(() => {
    function tick() {
      const next = [];
      for (const particle of particlesRef.current) {
        let { x, y, vx, vy, opacity, fading } = particle;

        vx += (Math.random() - 0.5) * 0.004;
        vy += (Math.random() - 0.5) * 0.004;
        x += vx;
        y += vy;

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
          vx -= 2 * dot * nx;
          vy -= 2 * dot * ny;
        }

        if (fading) {
          opacity -= 0.018;
        }

        if (opacity > 0.05) {
          next.push({ ...particle, x, y, vx, vy, opacity, fading });
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

    if (current.length === 0) {
      const burstCount = 8;
      const next = [];
      for (let i = 0; i < burstCount; i += 1) {
        const type = REACTIONS[i % REACTIONS.length].id;
        const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.4;
        const speed = 0.35 + Math.random() * 0.35;
        next.push(
          createParticle(
            type,
            originX + (Math.random() - 0.5) * 8,
            originY + (Math.random() - 0.5) * 8,
            `burst-${++localParticleIdRef.current}`,
            { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed },
          ),
        );
      }
      particlesRef.current = next;
      setParticles(next);
      return;
    }

    const next = current.map((particle) => {
      const dx = particle.x - originX;
      const dy = particle.y - originY;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;
      const force = 0.28 + Math.random() * 0.42;

      return {
        ...particle,
        vx: particle.vx + nx * force + (Math.random() - 0.5) * 0.18,
        vy: particle.vy + ny * force + (Math.random() - 0.5) * 0.18,
        fading: false,
        opacity: 1,
      };
    });

    particlesRef.current = next;
    setParticles(next);
  }, []);

  function handleGlobeClick(event) {
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
      if (res.ok && data.counts) {
        setCounts(data.counts);
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
          Kirim doa &amp; semangat
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
          Pilih ikon di samping — hati, like, atau salju akan melayang di dalam
          bola kaca. Klik bolanya untuk menggoyangkannya!
        </p>

        <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:justify-center sm:gap-6">
          <div className="flex w-full max-w-[17rem] flex-col items-center sm:max-w-[18rem]">
            <div className="relative w-full">
              <button
                type="button"
                ref={globeRef}
                onClick={handleGlobeClick}
                aria-label="Goyangkan bola kaca"
                className={`relative mx-auto block aspect-square w-full max-w-[15rem] cursor-pointer rounded-full border border-white/70 bg-gradient-to-b from-sky-100/80 via-white/40 to-sky-200/50 shadow-[inset_0_0_30px_rgba(255,255,255,0.85),0_10px_30px_rgba(56,189,248,0.18)] backdrop-blur-sm transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 ${isShaking ? "aira-globe-shake" : ""}`}
              >
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.85),transparent_45%),radial-gradient(circle_at_70%_75%,rgba(186,230,253,0.45),transparent_50%)]" />

                  <div className="pointer-events-none absolute bottom-[18%] left-[12%] h-10 w-6 rounded-full bg-emerald-700/70 blur-[0.5px]" />
                  <div className="pointer-events-none absolute bottom-[20%] right-[16%] h-8 w-5 rounded-full bg-emerald-700/60 blur-[0.5px]" />
                  <div className="pointer-events-none absolute bottom-[24%] left-[28%] h-12 w-7 rounded-full bg-emerald-800/65 blur-[0.5px]" />

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
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 will-change-transform"
                      style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        opacity: particle.opacity,
                      }}
                    >
                      <ReactionGlyph type={particle.type} className="text-base sm:text-lg" />
                    </div>
                  ))}

                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_115%,rgba(255,255,255,0.35),transparent_55%)]" />
                </div>

                <div className="pointer-events-none absolute inset-2 rounded-full border border-white/50" />
                <div className="pointer-events-none absolute left-[12%] top-[10%] h-8 w-12 rotate-[-24deg] rounded-full bg-white/35 blur-[1px]" />
              </button>

              <div className="relative z-10 -mt-3 mx-auto w-[88%] rounded-2xl border border-amber-900/15 bg-gradient-to-b from-amber-800 to-amber-950 px-3 py-3 shadow-lg shadow-amber-950/20">
                <div className="rounded-xl bg-white/95 px-2 py-2.5">
                  <div className="grid grid-cols-3 gap-1">
                    {REACTIONS.map((reaction) => (
                      <div
                        key={reaction.id}
                        className="flex flex-col items-center gap-0.5 rounded-lg px-1 py-1"
                      >
                        <ReactionGlyph type={reaction.id} className="text-lg" />
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
