"use client";

import { createPortal } from "react-dom";

/** Partikel cahaya + sedikit “salju” — di atas konten sebentar (z tinggi). */
export default function SparkBurstPortal({ bursts }) {
  if (typeof document === "undefined" || bursts.length === 0) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[220] overflow-hidden"
      aria-hidden
    >
      {bursts.flatMap((b) =>
        b.particles.map((p, i) => {
          if (p.kind === "snow") {
            return (
              <span
                key={`${b.id}-sn-${i}`}
                className="aira-flake absolute select-none text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.95)] motion-reduce:hidden"
                style={{
                  left: b.x,
                  top: b.y,
                  fontSize: `${6 + (i % 3)}px`,
                  lineHeight: 1,
                  "--dx": `${p.dx * 0.85}px`,
                  "--dy": `${p.dy * 0.85}px`,
                  animation: `aira-flake 0.72s ease-out ${p.delay}ms forwards`,
                }}
              >
                ❄
              </span>
            );
          }
          return (
            <span
              key={`${b.id}-gl-${i}`}
              className="aira-spark-dot absolute rounded-full bg-white shadow-[0_0_12px_4px_rgba(255,255,255,0.85)] motion-reduce:hidden"
              style={{
                left: b.x,
                top: b.y,
                width: p.size,
                height: p.size,
                "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                animation: `aira-spark 0.62s cubic-bezier(0.18, 0.9, 0.32, 1) ${p.delay}ms forwards`,
              }}
            />
          );
        }),
      )}
    </div>,
    document.body,
  );
}
