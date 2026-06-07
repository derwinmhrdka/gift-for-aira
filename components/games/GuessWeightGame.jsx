"use client";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";

/** Berat bayi (gram) — hardcoded. */
const BABY_WEIGHT_G = 3200;
const TOLERANCE_G = 120;
const MIN_G = 2500;
const MAX_G = 4000;
const STEP_G = 25;

function formatKg(grams) {
  return (grams / 1000).toFixed(2);
}

const GuessWeightGame = forwardRef(function GuessWeightGame(
  { embedded = false },
  ref,
) {
  const [guess, setGuess] = useState(3200);
  const [result, setResult] = useState(null);

  useImperativeHandle(
    ref,
    () => ({
      getAnswer() {
        return `${formatKg(guess)} kg`;
      },
    }),
    [guess],
  );

  const ticks = useMemo(() => {
    const items = [];
    for (let g = MIN_G; g <= MAX_G; g += 100) {
      items.push(g);
    }
    return items;
  }, []);

  const pct = ((guess - MIN_G) / (MAX_G - MIN_G)) * 100;
  const locked = !embedded && !!result;

  function submit() {
    const diff = Math.abs(guess - BABY_WEIGHT_G);
    setResult(diff <= TOLERANCE_G ? "win" : "lose");
  }

  function reset() {
    setGuess(3200);
    setResult(null);
  }

  return (
    <div>
      {!embedded ? (
        <p className="text-center text-sm text-slate-600 sm:text-base">
          Geser ruler Kahoot-style — tebak berat lahir si kecil! ⚖️
        </p>
      ) : null}

      <div className={`rounded-2xl border border-sky-200/80 bg-white/90 px-4 py-5 ${embedded ? "" : "mt-6"}`}>
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          Tebakan kamu
        </p>
        <p className="font-display mt-1 text-center text-4xl font-extrabold tabular-nums text-aira-navy">
          {formatKg(guess)}
          <span className="ml-1 text-lg font-bold text-sky-600">kg</span>
        </p>

        <div className="relative mt-8 h-14 select-none">
          <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full bg-gradient-to-r from-sky-200 via-sky-400 to-aira-navy shadow-inner">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-sky-300/50"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="absolute inset-x-0 top-[calc(50%+0.4rem)] flex justify-between px-0.5">
            {ticks.map((g) => {
              const left = ((g - MIN_G) / (MAX_G - MIN_G)) * 100;
              const major = g % 500 === 0;
              return (
                <span
                  key={g}
                  className="absolute bottom-0 -translate-x-1/2"
                  style={{ left: `${left}%` }}
                  aria-hidden="true"
                >
                  <span
                    className={`block w-px ${major ? "h-3 bg-sky-500" : "h-1.5 bg-sky-300"}`}
                  />
                  {major ? (
                    <span className="mt-0.5 block text-[9px] font-bold text-slate-500">
                      {formatKg(g)}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>

          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 transition-[left] duration-75"
            style={{ left: `${pct}%` }}
            aria-hidden="true"
          >
            <span className="block h-0 w-0 border-x-[10px] border-t-[14px] border-x-transparent border-t-rose-500 drop-shadow-sm" />
          </div>

          <input
            type="range"
            min={MIN_G}
            max={MAX_G}
            step={STEP_G}
            value={guess}
            disabled={locked}
            onChange={(e) => setGuess(Number(e.target.value))}
            aria-label="Tebak berat bayi dalam kilogram"
            className="kahoot-ruler-input absolute inset-x-0 top-1/2 z-20 h-10 w-full -translate-y-1/2 cursor-pointer opacity-0"
          />
        </div>
      </div>

      {!embedded && !result ? (
        <button
          type="button"
          onClick={submit}
          className="font-display mt-5 w-full rounded-xl bg-gradient-to-r from-sky-500 to-aira-navy px-4 py-3 text-sm font-bold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          Kirim tebakan
        </button>
      ) : null}

      {!embedded && result === "win" ? (
        <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">
          Mantap! Tebakanmu hampir tepat — {formatKg(BABY_WEIGHT_G)} kg 🤫
        </p>
      ) : null}

      {!embedded && result === "lose" ? (
        <div className="mt-5 space-y-3">
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900">
            Belum pas nih 😄 Geser ruler & coba lagi!
          </p>
          <button
            type="button"
            onClick={reset}
            className="font-display w-full rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-aira-navy hover:bg-sky-50"
          >
            Tebak lagi
          </button>
        </div>
      ) : null}
    </div>
  );
});

export default GuessWeightGame;
