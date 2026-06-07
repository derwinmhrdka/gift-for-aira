"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

/** Jawaban tebak waktu — hardcoded (periode). */
const BABY_TIME = "pagi";

const PERIOD_INFO = {
  pagi: {
    label: "Pagi",
    emoji: "🌅",
    face: "from-emerald-200 via-green-100 to-lime-100",
    ring: "border-emerald-300/80",
  },
  siang: {
    label: "Siang",
    emoji: "☀️",
    face: "from-yellow-200 via-amber-100 to-yellow-300",
    ring: "border-yellow-400/80",
  },
  sore: {
    label: "Sore",
    emoji: "🌇",
    face: "from-orange-300 via-pink-200 to-rose-300",
    ring: "border-orange-300/80",
  },
  malam: {
    label: "Malam",
    emoji: "🌙",
    face: "from-indigo-950 via-slate-900 to-indigo-900",
    ring: "border-indigo-700/80",
  },
};

function periodFromTime(hour24, minute) {
  const h = hour24 + minute / 60;
  if (h >= 19 || h < 5) return "malam";
  if (h >= 5 && h < 11) return "pagi";
  if (h >= 11 && h < 15) return "siang";
  return "sore";
}

function formatTime(hour24, minute) {
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function angleFromPoint(clientX, clientY, rect) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const x = clientX - cx;
  const y = clientY - cy;
  return (Math.atan2(y, x) * 180) / Math.PI + 90;
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function angleToMinute(angle) {
  return Math.round(normalizeAngle(angle) / 6) % 60;
}

function snapHour24(angle, prevHour24) {
  const a = normalizeAngle(angle);
  const h12 = Math.round(a / 30) % 12;
  const display = h12 === 0 ? 12 : h12;
  const candA = display === 12 ? 0 : display;
  const candB = display === 12 ? 12 : display + 12;
  return [candA, candB].reduce((best, h) =>
    Math.abs(h - prevHour24) < Math.abs(best - prevHour24) ? h : best,
  );
}

function AnalogClock({ hour24, minute, onChange, disabled }) {
  const faceRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const period = periodFromTime(hour24, minute);
  const info = PERIOD_INFO[period];
  const isNight = period === "malam";

  const hourAngle = normalizeAngle((hour24 % 12) * 30 + minute * 0.5);
  const minuteAngle = normalizeAngle(minute * 6);

  const updateFromPointer = useCallback(
    (clientX, clientY, hand) => {
      if (!faceRef.current) return;
      const rect = faceRef.current.getBoundingClientRect();
      const angle = angleFromPoint(clientX, clientY, rect);
      if (hand === "minute") {
        onChange(hour24, angleToMinute(angle));
      } else {
        onChange(snapHour24(angle, hour24), minute);
      }
    },
    [hour24, minute, onChange],
  );

  useEffect(() => {
    if (!dragging) return undefined;

    function onMove(e) {
      updateFromPointer(e.clientX, e.clientY, dragging);
    }

    function onUp() {
      setDragging(null);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragging, updateFromPointer]);

  function startDrag(hand) {
    if (disabled) return;
    setDragging(hand);
  }

  return (
    <div className="mx-auto w-full max-w-[13rem]">
      <div
        ref={faceRef}
        className={`relative mx-auto aspect-square w-full rounded-full border-[3px] bg-gradient-to-br shadow-lg ${info.face} ${info.ring} ${dragging ? "cursor-grabbing" : ""}`}
      >
        {/* Angka jam */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
          const rad = ((i * 30 - 90) * Math.PI) / 180;
          const left = 50 + 38 * Math.cos(rad);
          const top = 50 + 38 * Math.sin(rad);
          return (
            <span
              key={n}
              className={`absolute -translate-x-1/2 -translate-y-1/2 text-[11px] font-bold ${
                isNight ? "text-sky-100" : "text-aira-navy/70"
              }`}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {n}
            </span>
          );
        })}

        {/* Center — periode & jam digital */}
        <div
          className={`absolute left-1/2 top-1/2 z-10 flex w-[42%] min-w-[4.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border px-1 py-2 shadow-inner ${
            isNight
              ? "border-indigo-600/50 bg-indigo-950/75 text-white"
              : "border-white/70 bg-white/75 text-aira-navy"
          }`}
        >
          <span className="text-lg leading-none" aria-hidden="true">
            {info.emoji}
          </span>
          <span className="font-display mt-0.5 text-[10px] font-extrabold uppercase tracking-wide">
            {info.label}
          </span>
          <span className="mt-0.5 text-[11px] font-bold tabular-nums opacity-90">
            {formatTime(hour24, minute)}
          </span>
        </div>

        {/* Minute hand */}
        <button
          type="button"
          aria-label="Jarum menit"
          disabled={disabled}
          onPointerDown={(e) => {
            e.preventDefault();
            startDrag("minute");
            updateFromPointer(e.clientX, e.clientY, "minute");
          }}
          className="absolute left-1/2 top-1/2 z-20 h-[44%] w-7 cursor-grab touch-none border-0 bg-transparent p-0 disabled:cursor-default"
          style={{
            transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          <span className="mx-auto block h-full w-1 rounded-full bg-sky-500 shadow-sm" />
        </button>

        {/* Hour hand */}
        <button
          type="button"
          aria-label="Jarum jam"
          disabled={disabled}
          onPointerDown={(e) => {
            e.preventDefault();
            startDrag("hour");
            updateFromPointer(e.clientX, e.clientY, "hour");
          }}
          className="absolute left-1/2 top-1/2 z-30 h-[30%] w-9 cursor-grab touch-none border-0 bg-transparent p-0 disabled:cursor-default"
          style={{
            transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          <span className="mx-auto block h-full w-1.5 rounded-full bg-aira-navy shadow-sm" />
        </button>

        {/* Center pin */}
        <span
          className={`absolute left-1/2 top-1/2 z-40 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
            isNight ? "border-sky-200 bg-rose-400" : "border-white bg-rose-500"
          }`}
          aria-hidden="true"
        />
      </div>

      <p className="mt-2 text-[10px] text-slate-500">
        Putar jarum jam untuk menebak waktu lahir si kecil
      </p>
    </div>
  );
}

export default forwardRef(function GuessTimeGame({ embedded = false }, ref) {
  const [hour24, setHour24] = useState(8);
  const [minute, setMinute] = useState(0);
  const [result, setResult] = useState(null);

  const period = periodFromTime(hour24, minute);
  const periodInfo = PERIOD_INFO[period];

  useImperativeHandle(
    ref,
    () => ({
      getAnswer() {
        return `${periodInfo.label} (${formatTime(hour24, minute)})`;
      },
    }),
    [hour24, minute, periodInfo.label],
  );

  const handleChange = useCallback((h, m) => {
    setHour24(h);
    setMinute(m);
  }, []);

  function submit() {
    setResult(period === BABY_TIME ? "win" : "lose");
  }

  function reset() {
    setHour24(8);
    setMinute(0);
    setResult(null);
  }

  return (
    <div className="text-center">
      {!embedded ? (
        <p className="text-sm text-slate-600 sm:text-base">
          Putar jarum jam untuk menebak waktu lahir si kecil! 🕐
        </p>
      ) : null}

      <div className={embedded ? "mt-0" : "mt-5"}>
        <AnalogClock
          hour24={hour24}
          minute={minute}
          onChange={handleChange}
          disabled={!embedded && !!result}
        />
      </div>

      {!embedded && !result ? (
        <button
          type="button"
          onClick={submit}
          className="font-display mt-4 w-full rounded-xl bg-gradient-to-r from-sky-500 to-aira-navy px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          Kirim tebakan
        </button>
      ) : null}

      {!embedded && result === "win" ? (
        <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Benar! Waktu rahasia tercatat — 🤫 shhh!
        </p>
      ) : null}

      {!embedded && result === "lose" ? (
        <div className="mt-4 space-y-3">
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            Belum tepat nih 😄 Putar jamnya lagi!
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
