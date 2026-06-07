"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";

/** Jawaban tebak tanggal — hardcoded. */
const BABY_DAY = 15;
const BABY_MONTH = "Jul";
const CALENDAR_YEAR = 2026;

const MONTHS = ["Jun", "Jul"];
const DAYS_IN_MONTH = { Jun: 30, Jul: 31 };

function clampDay(day, month) {
  return Math.min(Math.max(1, day), DAYS_IN_MONTH[month]);
}

function useSwipe(onPrev, onNext) {
  const startX = useRef(null);

  return {
    onTouchStart: (e) => {
      startX.current = e.touches[0]?.clientX ?? null;
    },
    onTouchEnd: (e) => {
      if (startX.current == null) return;
      const endX = e.changedTouches[0]?.clientX ?? startX.current;
      const diff = endX - startX.current;
      if (Math.abs(diff) >= 36) {
        if (diff < 0) onNext();
        else onPrev();
      }
      startX.current = null;
    },
  };
}

function CalendarRings() {
  return (
    <div className="pointer-events-none relative z-10 flex justify-center gap-12" aria-hidden="true">
      {[0, 1].map((i) => (
        <span
          key={i}
          className="block h-4 w-4 rounded-full border-2 border-slate-300 bg-gradient-to-br from-slate-100 to-slate-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.12)]"
        />
      ))}
    </div>
  );
}

const GuessDateGame = forwardRef(function GuessDateGame(
  { embedded = false },
  ref,
) {
  const [monthIndex, setMonthIndex] = useState(1);
  const [day, setDay] = useState(15);
  const [result, setResult] = useState(null);

  const month = MONTHS[monthIndex];
  const totalDays = DAYS_IN_MONTH[month];
  const answerRef = useRef({ day, month, year: CALENDAR_YEAR });

  answerRef.current = { day, month, year: CALENDAR_YEAR };

  useImperativeHandle(
    ref,
    () => ({
      getAnswer() {
        const { day: d, month: m, year } = answerRef.current;
        return `${d} ${m} ${year}`;
      },
    }),
    [],
  );

  const setDaySafe = useCallback(
    (next) => {
      setDay(clampDay(next, month));
    },
    [month],
  );

  const prevDay = useCallback(() => {
    setDaySafe(day <= 1 ? totalDays : day - 1);
  }, [day, totalDays, setDaySafe]);

  const nextDay = useCallback(() => {
    setDaySafe(day >= totalDays ? 1 : day + 1);
  }, [day, totalDays, setDaySafe]);

  const prevMonth = useCallback(() => {
    setMonthIndex((i) => {
      const next = i <= 0 ? MONTHS.length - 1 : i - 1;
      const m = MONTHS[next];
      setDay((d) => clampDay(d, m));
      return next;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setMonthIndex((i) => {
      const next = i >= MONTHS.length - 1 ? 0 : i + 1;
      const m = MONTHS[next];
      setDay((d) => clampDay(d, m));
      return next;
    });
  }, []);

  const daySwipe = useSwipe(prevDay, nextDay);
  const monthSwipe = useSwipe(prevMonth, nextMonth);
  const locked = !embedded && !!result;

  function submit() {
    const win = day === BABY_DAY && month === BABY_MONTH;
    setResult(win ? "win" : "lose");
  }

  function reset() {
    setDay(15);
    setMonthIndex(1);
    setResult(null);
  }

  return (
    <div className="text-center">
      {!embedded ? (
        <p className="text-sm text-slate-600 sm:text-base">
          Tebak tanggal lahir si kecil! 📅
        </p>
      ) : null}

      <div className={`mx-auto max-w-[18rem] ${embedded ? "mt-0" : "mt-5"}`}>
        <CalendarRings />

        <div className="relative -mt-2 overflow-hidden rounded-b-xl rounded-t-lg border-2 border-sky-200/90 bg-white shadow-[0_8px_24px_rgba(147,197,253,0.35)]">
          <div className="bg-gradient-to-r from-rose-500 via-rose-400 to-pink-500 px-3 py-2.5 text-white shadow-inner">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-90">
              Kalender
            </p>
            <p className="font-display text-lg font-extrabold leading-tight">
              {CALENDAR_YEAR}
            </p>
          </div>

          <div className="flex bg-gradient-to-b from-sky-50/80 to-white">
            <div
              className="flex flex-1 flex-col items-center border-r border-sky-200/70 px-2 py-4 touch-pan-y"
              {...daySwipe}
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Tanggal
              </p>
              <div className="mt-1 flex w-full items-center justify-center gap-0.5">
                <button
                  type="button"
                  onClick={prevDay}
                  disabled={locked}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-600 hover:bg-sky-100 disabled:opacity-40"
                  aria-label="Tanggal sebelumnya"
                >
                  ‹
                </button>
                <span className="font-display w-14 text-center text-5xl font-extrabold leading-none tabular-nums text-aira-navy">
                  {day}
                </span>
                <button
                  type="button"
                  onClick={nextDay}
                  disabled={locked}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-600 hover:bg-sky-100 disabled:opacity-40"
                  aria-label="Tanggal berikutnya"
                >
                  ›
                </button>
              </div>
            </div>

            <div
              className="flex flex-1 flex-col items-center px-2 py-4 touch-pan-y"
              {...monthSwipe}
            >
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Bulan
              </p>
              <div className="mt-1 flex w-full items-center justify-center gap-0.5">
                <button
                  type="button"
                  onClick={prevMonth}
                  disabled={locked}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-600 hover:bg-sky-100 disabled:opacity-40"
                  aria-label="Bulan sebelumnya"
                >
                  ‹
                </button>
                <span className="font-display w-14 text-center text-3xl font-extrabold text-sky-700">
                  {month}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  disabled={locked}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sky-600 hover:bg-sky-100 disabled:opacity-40"
                  aria-label="Bulan berikutnya"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          <p className="border-t border-sky-100 bg-sky-50/50 py-1.5 text-[9px] text-slate-400">
            Geser atau tap panah ‹ ›
          </p>
        </div>
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
          Tepat! {BABY_DAY} {BABY_MONTH} — sstt rahasia ya! 🤫
        </p>
      ) : null}

      {!embedded && result === "lose" ? (
        <div className="mt-4 space-y-3">
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            Belum pas 😄 Coba tanggal lain!
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

export default GuessDateGame;
