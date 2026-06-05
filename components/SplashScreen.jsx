"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "aira-splash-done";
const MIN_MS = 1400;
const MAX_MS = 4500;
const FADE_MS = 500;

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

function waitForWindowLoad() {
  if (typeof document === "undefined") return Promise.resolve();
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener("load", resolve, { once: true });
  });
}

const SplashPreloadContext = createContext(null);

export function useSplashPreload() {
  const ctx = useContext(SplashPreloadContext);
  return ctx ?? { registerUrls: () => {} };
}

function SplashOverlay({ imageUrls, onDone }) {
  const [exiting, setExiting] = useState(false);
  const [settledUrls, setSettledUrls] = useState(imageUrls);

  useEffect(() => {
    const settle = window.setTimeout(() => setSettledUrls(imageUrls), 280);
    return () => window.clearTimeout(settle);
  }, [imageUrls]);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();
    let minTimer;
    let capTimer;
    let fadeTimer;

    const finish = () => {
      if (cancelled) return;
      setExiting(true);
      fadeTimer = window.setTimeout(() => {
        try {
          sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          // Private mode / blocked storage.
        }
        onDone();
      }, FADE_MS);
    };

    const run = async () => {
      const uniqueUrls = [...new Set(settledUrls.filter(Boolean))];

      await Promise.all([
        preloadImage("/snowman-90.gif"),
        document.fonts?.ready ?? Promise.resolve(),
        waitForWindowLoad(),
        ...uniqueUrls.map((url) => preloadImage(url)),
      ]);

      if (cancelled) return;

      const elapsed = performance.now() - started;
      const remaining = Math.max(0, MIN_MS - elapsed);
      minTimer = window.setTimeout(finish, remaining);
    };

    run();
    capTimer = window.setTimeout(finish, MAX_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(minTimer);
      window.clearTimeout(capTimer);
      window.clearTimeout(fadeTimer);
    };
  }, [settledUrls, onDone]);

  return (
    <div
      className={`fixed inset-0 z-[500] flex flex-col items-center justify-center bg-gradient-to-b from-aira-snow via-white to-aira-iceLight px-6 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={exiting}
      aria-busy="true"
      aria-label="Memuat halaman"
    >
      <img
        src="/snowman-90.gif"
        alt=""
        width={160}
        height={160}
        className="h-28 w-auto sm:h-36"
        decoding="sync"
        fetchPriority="high"
      />
      <p className="font-display mt-6 bg-gradient-to-r from-sky-500 to-aira-navy bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
        Baby Wishes!
      </p>
    </div>
  );
}

export function SplashScreenProvider({ children }) {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  });
  const [urls, setUrls] = useState([]);

  const registerUrls = useCallback((nextUrls) => {
    if (!Array.isArray(nextUrls) || !nextUrls.length) return;
    setUrls((prev) => [...new Set([...prev, ...nextUrls])]);
  }, []);

  const value = useMemo(() => ({ registerUrls }), [registerUrls]);

  return (
    <SplashPreloadContext.Provider value={value}>
      {show ? (
        <SplashOverlay imageUrls={urls} onDone={() => setShow(false)} />
      ) : null}
      {children}
    </SplashPreloadContext.Provider>
  );
}
