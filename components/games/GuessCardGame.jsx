"use client";

import { useAddSparkBurst } from "@/components/SparkBurstProvider";
import MiniGiftSpinWheel from "@/components/games/MiniGiftSpinWheel";
import {
  buildShuffledDeck,
  getMatchResult,
  vibrateMatch,
  vibrateMismatch,
} from "@/lib/babyMatch";
import {
  canOpenRoulette,
  isAdminMode,
  markRouletteUsed,
} from "@/lib/gameParticipation";
import {
  playCardCompleteSound,
  playCardMatchSound,
  playCardMismatchSound,
  unlockGuessSounds,
} from "@/lib/guessSounds";
import { useCallback, useEffect, useRef, useState } from "react";

const FLIP_BACK_MS = 1000;
const CARD_ASPECT = 5 / 7;
const BOARD_GAP = 8;

const BOARD_LAYOUTS = {
  mobile: {
    cols: 3,
    rows: 4,
    aspectClass: "aspect-[15/28]",
    gridClass: "grid-cols-3 grid-rows-4",
    maxWidth: 288,
  },
  desktop: {
    cols: 4,
    rows: 3,
    aspectClass: "aspect-[20/21]",
    gridClass: "grid-cols-4 grid-rows-3",
    maxWidth: 384,
  },
};

function computeBoardWidth(availW, availH, cols, rows, maxBoardW) {
  if (availW <= 0 || availH <= 0) return maxBoardW;

  const wFromContainer = Math.min(availW, maxBoardW);
  const cardH = (availH - (rows - 1) * BOARD_GAP) / rows;
  const cardW = cardH * CARD_ASPECT;
  const wFromHeight = cols * cardW + (cols - 1) * BOARD_GAP;

  return Math.floor(Math.min(wFromContainer, wFromHeight, maxBoardW));
}

function useBoardLayout() {
  const [layout, setLayout] = useState(BOARD_LAYOUTS.mobile);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => {
      setLayout(mq.matches ? BOARD_LAYOUTS.desktop : BOARD_LAYOUTS.mobile);
    };

    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return layout;
}

function useBoardWidth(boardWrapRef, layout) {
  const [boardWidth, setBoardWidth] = useState(layout.maxWidth);

  useEffect(() => {
    const node = boardWrapRef.current;
    if (!node) return undefined;

    const update = () => {
      setBoardWidth(
        computeBoardWidth(
          node.clientWidth,
          node.clientHeight,
          layout.cols,
          layout.rows,
          layout.maxWidth,
        ),
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [boardWrapRef, layout]);

  return boardWidth;
}

function MatchCard({ card, isFlipped, isMatched, isGlowing, onClick, disabled }) {
  const ref = useRef(null);

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || isMatched}
      onClick={onClick}
      aria-label={
        isFlipped || isMatched ? `${card.label} ${card.emoji}` : "Kartu tertutup"
      }
      className={`baby-match-card h-full w-full max-h-full max-w-full justify-self-center [perspective:900px] focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-1 disabled:cursor-default ${
        isGlowing ? "baby-match-card-glow" : ""
      }`}
    >
      <span
        className={`relative block h-full w-full rounded-2xl border-2 shadow-[0_3px_10px_rgba(15,39,68,0.14)] transition-transform duration-300 [transform-style:preserve-3d] ${
          isFlipped || isMatched ? "[transform:rotateY(180deg)]" : ""
        } ${
          isMatched
            ? "border-emerald-300/90"
            : "border-white/90 ring-1 ring-sky-200/70 hover:border-sky-200 hover:ring-sky-300/80"
        }`}
      >
        <span className="baby-match-face baby-match-back absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 via-white to-sky-50 shadow-inner">
          <img
            src="/baby.png"
            alt=""
            className="h-[68%] w-auto max-w-[82%] object-contain"
            decoding="async"
          />
        </span>
        <span
          className={`baby-match-face baby-match-front absolute inset-0 flex flex-col items-center justify-center rounded-2xl px-1 shadow-inner ${
            isMatched
              ? "bg-gradient-to-br from-emerald-50 via-mint-50 to-sky-50"
              : "bg-gradient-to-br from-white via-sky-50/90 to-rose-50/80"
          }`}
        >
          <span className="text-xl leading-none sm:text-2xl" aria-hidden="true">
            {card.emoji}
          </span>
          <span className="font-display mt-0.5 text-[8px] font-bold leading-tight text-aira-navy sm:mt-1 sm:text-[9px]">
            {card.label}
          </span>
        </span>
      </span>
    </button>
  );
}

export default function GuessCardGame({ onFinished, allowReplay = false, wishName = "" }) {
  const addBurst = useAddSparkBurst();
  const finishedRef = useRef(false);
  const boardWrapRef = useRef(null);
  const layout = useBoardLayout();
  const boardWidth = useBoardWidth(boardWrapRef, layout);

  const [deck, setDeck] = useState(() => buildShuffledDeck());
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [flippedIndexes, setFlippedIndexes] = useState([]);
  const [glowPairId, setGlowPairId] = useState(null);
  const [locked, setLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [lastMatchedPairId, setLastMatchedPairId] = useState(null);
  const [phase, setPhase] = useState("playing");
  const [showRoulette, setShowRoulette] = useState(false);
  const [showSoldOutPopup, setShowSoldOutPopup] = useState(false);
  const [checkingPrizes, setCheckingPrizes] = useState(false);
  const [rouletteAvailable, setRouletteAvailable] = useState(true);

  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  const resetGame = useCallback(() => {
    finishedRef.current = false;
    setDeck(buildShuffledDeck());
    setMatchedPairs([]);
    setFlippedIndexes([]);
    setGlowPairId(null);
    setLocked(false);
    setAttempts(0);
    setElapsedSec(0);
    setLastMatchedPairId(null);
    setPhase("playing");
    setShowRoulette(false);
    setRouletteAvailable(canOpenRoulette());
    startTimeRef.current = null;
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    resetGame();
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [resetGame]);

  useEffect(() => {
    if (phase !== "playing") return undefined;

    timerRef.current = window.setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSec(
          Math.floor((Date.now() - startTimeRef.current) / 1000),
        );
      }
    }, 500);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase]);

  const finishGame = useCallback(
    (finalSeconds, finalAttempts) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setPhase("complete");
      setElapsedSec(finalSeconds);
      playCardCompleteSound();
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      onFinished?.();
    },
    [onFinished],
  );

  useEffect(() => {
    if (matchedPairs.length === 6 && phase === "playing") {
      const finalSec = startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : elapsedSec;
      finishGame(finalSec, attempts);
    }
  }, [matchedPairs.length, phase, attempts, elapsedSec, finishGame]);

  function handleCardClick(index) {
    if (locked || phase !== "playing") return;
    if (flippedIndexes.includes(index)) return;
    if (matchedPairs.includes(deck[index]?.pairId)) return;

    unlockGuessSounds();

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const nextFlipped = [...flippedIndexes, index];

    if (nextFlipped.length < 2) {
      setFlippedIndexes(nextFlipped);
      return;
    }

    setFlippedIndexes(nextFlipped);
    setLocked(true);
    setAttempts((a) => a + 1);

    const [firstIdx, secondIdx] = nextFlipped;
    const first = deck[firstIdx];
    const second = deck[secondIdx];

    if (first.pairId === second.pairId) {
      vibrateMatch();
      playCardMatchSound();
      setGlowPairId(first.pairId);
      setLastMatchedPairId(first.pairId);
      setMatchedPairs((prev) => [...prev, first.pairId]);

      const midX = window.innerWidth / 2;
      const midY = window.innerHeight / 2;
      addBurst(midX, midY, { snowHeavy: false });

      window.setTimeout(() => {
        setGlowPairId(null);
        setFlippedIndexes([]);
        setLocked(false);
      }, 450);
      return;
    }

    vibrateMismatch();
    playCardMismatchSound();
    window.setTimeout(() => {
      setFlippedIndexes([]);
      setLocked(false);
    }, FLIP_BACK_MS);
  }

  useEffect(() => {
    if (phase === "complete") {
      setRouletteAvailable(canOpenRoulette());
    }
  }, [phase]);

  function openRoulette() {
    if (!canOpenRoulette() || checkingPrizes) {
      if (!canOpenRoulette()) setRouletteAvailable(false);
      return;
    }

    setCheckingPrizes(true);
    fetch("/api/presents")
      .then((res) => res.json().then((data) => ({ res, data })))
      .then(({ res, data }) => {
        if (!res.ok) {
          throw new Error(data.error || "Gagal memuat hadiah.");
        }
        if (!data.hasAvailablePrizes) {
          setShowSoldOutPopup(true);
          return;
        }
        setShowRoulette(true);
      })
      .catch(() => {
        /* biarkan user coba lagi */
      })
      .finally(() => {
        setCheckingPrizes(false);
      });
  }

  function skipGame() {
    if (!isAdminMode()) return;
    const finalSec = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;
    finishGame(finalSec, attempts);
  }

  function handleRouletteFinished(result) {
    if (result && !result.canSpinAgain) {
      markRouletteUsed();
      setRouletteAvailable(false);
    }
  }

  function handleRouletteClose() {
    setShowRoulette(false);
    if (!canOpenRoulette()) {
      setRouletteAvailable(false);
    }
  }

  const result =
    phase === "complete"
      ? getMatchResult({
          seconds: elapsedSec,
          attempts,
          lastPairId: lastMatchedPairId,
        })
      : null;

  if (phase === "complete" && result) {
    return (
      <div className="flex min-h-0 flex-1 flex-col text-center">
        <div className="shrink-0">
          <p className="text-3xl md:text-4xl" aria-hidden="true">
            🎉
          </p>
          <h3 className="font-display mt-1 text-base font-extrabold text-aira-navy md:mt-2 md:text-xl">
            HASILMU
          </h3>
        </div>

        <div className="mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-white to-rose-50/80 px-3 py-3 text-left text-sm md:mt-3 md:px-4 md:py-4">
          <div className="space-y-2 border-b border-sky-100 pb-3 text-center text-xs">
            <p className="flex justify-between gap-3">
              <span className="text-slate-500">⏱️ Waktu</span>
              <span className="font-bold tabular-nums text-aira-navy">
                {elapsedSec} detik
              </span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-slate-500">🎯 Percobaan</span>
              <span className="font-bold tabular-nums text-aira-navy">
                {attempts} kali
              </span>
            </p>
            {result.bonusRank ? (
              <p className="flex justify-between gap-3">
                <span className="text-slate-500">🃏 Pasangan terakhir</span>
                <span className="text-right text-[11px] font-semibold text-aira-navy">
                  {result.bonusRank.pairLabel}
                </span>
              </p>
            ) : null}
          </div>

          <div>
            <p className="font-display text-base font-extrabold text-aira-navy">
              {result.mainRank.emoji} {result.mainRank.title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              {result.mainRank.description}
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
              {result.mainRank.predictions.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          {result.bonusRank ? (
            <div className="border-t border-sky-100 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Bonus Analisis Rahasia
              </p>
              <p className="font-display mt-1.5 text-base font-extrabold text-aira-navy">
                {result.bonusRank.emoji} {result.bonusRank.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                {result.bonusRank.description}
              </p>
            </div>
          ) : null}

          <div className="border-t border-sky-100 pt-3">
            <p className="text-xs leading-relaxed text-slate-600">
              {result.narrative}
            </p>
          </div>

          <div className="border-t border-sky-100 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              📊 Statistik Rahasia
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
              {result.secretStats.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="border-t border-sky-100 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              🏅 Kesimpulan Resmi
            </p>
            <p className="mt-1.5 text-xs italic leading-relaxed text-slate-600">
              &ldquo;{result.conclusion}&rdquo;
            </p>
          </div>
        </div>

        <div className="mt-3 shrink-0 space-y-2 pb-0.5 md:mt-4">
          {rouletteAvailable ? (
            <button
              type="button"
              onClick={openRoulette}
              disabled={checkingPrizes}
              className="font-display w-full rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-60"
            >
              {checkingPrizes ? "Memuat…" : "🎁 Buka Mini Gift Roulette"}
            </button>
          ) : (
            <p className="rounded-2xl border border-sky-200/80 bg-sky-50/80 px-4 py-3 text-xs text-slate-600">
              Mini gift roulette sudah dibuka sebelumnya. Tunggu hadiahnya ya! 🎁
            </p>
          )}
          {allowReplay ? (
            <button
              type="button"
              onClick={resetGame}
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              Main lagi
            </button>
          ) : null}
        </div>

        <MiniGiftSpinWheel
          open={showRoulette}
          onClose={handleRouletteClose}
          onFinished={handleRouletteFinished}
          wishName={wishName}
        />

        {showSoldOutPopup ? (
          <div
            className="fixed inset-0 z-[280] flex items-center justify-center bg-slate-900/55 p-4"
            role="presentation"
            onClick={() => setShowSoldOutPopup(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="sold-out-title"
              className="w-full max-w-sm rounded-2xl border border-rose-200/80 bg-white p-6 text-center shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-4xl" aria-hidden="true">
                😢
              </p>
              <h4
                id="sold-out-title"
                className="font-display mt-3 text-base font-bold text-aira-navy sm:text-lg"
              >
                Yah hadiahnya sudah habis
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                Semua hadiah mini gift sudah diambil. Terima kasih sudah main!
              </p>
              <button
                type="button"
                onClick={() => setShowSoldOutPopup(false)}
                className="font-display mt-5 w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                OK
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 text-center">
        <p className="font-display text-sm font-extrabold text-aira-navy">
          Baby Match Challenge
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500 sm:text-[11px]">
          Temukan 6 pasangan kartu bayi — ketuk untuk buka!
        </p>
        <p className="mt-1 text-[10px] font-semibold tabular-nums text-sky-600">
          {elapsedSec}s · {attempts} percobaan · {matchedPairs.length}/6 pasang
        </p>
      </div>

      <div
        ref={boardWrapRef}
        className="baby-match-board-wrap mt-1 min-h-0 flex-1 sm:mt-2"
      >
        <div
          className={`baby-match-board grid ${layout.aspectClass} ${layout.gridClass}`}
          style={{ width: boardWidth, gap: BOARD_GAP }}
        >
          {deck.map((card, index) => {
            const isMatched = matchedPairs.includes(card.pairId);
            const isFlipped = flippedIndexes.includes(index);
            const isGlowing = glowPairId === card.pairId;

            return (
              <MatchCard
                key={card.uid}
                card={card}
                isFlipped={isFlipped}
                isMatched={isMatched}
                isGlowing={isGlowing}
                disabled={locked && !isFlipped && !isMatched}
                onClick={() => handleCardClick(index)}
              />
            );
          })}
        </div>
      </div>

      {isAdminMode() ? (
        <button
          type="button"
          onClick={skipGame}
          className="mt-1 shrink-0 w-full rounded-xl border border-dashed border-amber-300/90 bg-amber-50/70 px-3 py-1.5 text-[10px] font-semibold text-amber-800 transition hover:bg-amber-100/80 focus:outline-none focus:ring-2 focus:ring-amber-300 sm:mt-2"
        >
          Skip
        </button>
      ) : null}
    </div>
  );
}
