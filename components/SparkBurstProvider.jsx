"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import SparkBurstPortal from "@/components/SparkBurstPortal";

function makeParticles({ snowHeavy = false } = {}) {
  const n = snowHeavy ? 28 : 20;
  return Array.from({ length: n }, (_, i) => {
    const angle = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.5;
    const dist = snowHeavy ? 28 + Math.random() * 58 : 22 + Math.random() * 50;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      delay: Math.floor(Math.random() * 130),
      size: snowHeavy ? 3 + Math.random() * 5 : 2 + Math.random() * 4,
      kind: snowHeavy
        ? Math.random() > 0.2
          ? "snow"
          : "glow"
        : Math.random() > 0.78
          ? "snow"
          : "glow",
    };
  });
}

const SparkBurstContext = createContext(null);

export function SparkBurstProvider({ children }) {
  const [bursts, setBursts] = useState([]);

  const addBurst = useCallback((clientX, clientY, options = {}) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    setBursts((s) => [
      ...s,
      {
        id,
        x: clientX,
        y: clientY,
        snowHeavy: Boolean(options.snowHeavy),
        particles: makeParticles(options),
      },
    ]);

    window.setTimeout(() => {
      setBursts((s) => s.filter((b) => b.id !== id));
    }, 780);
  }, []);

  const value = useMemo(() => ({ addBurst }), [addBurst]);

  return (
    <SparkBurstContext.Provider value={value}>
      {children}
      <SparkBurstPortal bursts={bursts} />
    </SparkBurstContext.Provider>
  );
}

/** No-op jika di luar provider (aman untuk uji / potongan UI). */
export function useAddSparkBurst() {
  const ctx = useContext(SparkBurstContext);
  return ctx?.addBurst ?? (() => {});
}
