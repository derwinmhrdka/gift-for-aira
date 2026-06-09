"use client";

import { useAddSparkBurst } from "@/components/SparkBurstProvider";
import {
  playGuessLetterRevealSound,
  playGuessSuccessSound,
  playGuessWrongSound,
  unlockGuessSounds,
} from "@/lib/guessSounds";
import { useAdminMode } from "@/components/AdminModeProvider";
import {
  allLettersRevealed,
  isExactNameMatch,
  mergeRevealedFromGuess,
  normalizeName,
  splitGuessInput,
} from "@/lib/nameGuess";
import { getVisitorId } from "@/lib/visitorId";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

const MAX_ATTEMPTS = 1;
const CHAR_STEP_MS = 480;
const SKIP_STEP_MS = 60;

function emptyMask(length) {
  return Array(length).fill(false);
}

function LetterBox({ state, letter, onBurst }) {
  const ref = useRef(null);
  const wasFlashing = useRef(false);

  useEffect(() => {
    const isFlash = state === "flash";
    if (isFlash && !wasFlashing.current && ref.current) {
      const el = ref.current;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        onBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, {
          snowHeavy: true,
        });
      });
    }
    wasFlashing.current = isFlash;
  }, [state, onBurst]);

  return (
    <div
      ref={ref}
      className={`aira-letter-box h-7 w-6 shrink-0 rounded-lg sm:h-8 sm:w-7 sm:rounded-xl ${
        state === "flash" || state === "correct" ? "is-open" : ""
      } ${state === "typed" ? "is-typing" : ""} ${
        state === "wrong-glow" ? "is-wrong-glow" : ""
      }`}
    >
      <div className="aira-letter-flip">
        <div className="aira-letter-face aira-letter-front font-display text-sm font-extrabold sm:text-base">
          ?
        </div>
        <div className="aira-letter-face aira-letter-back font-display text-sm font-extrabold sm:text-base">
          {(letter ?? "?").toUpperCase()}
        </div>
      </div>
    </div>
  );
}

function LetterBoxes({ rowId, boxes, nowrap, onBurst }) {
  if (!boxes.length) return null;
  return (
    <div
      className={`flex justify-center gap-0.5 sm:gap-1 ${nowrap ? "flex-nowrap" : "flex-wrap"}`}
    >
      {boxes.map((box, index) => (
        <LetterBox
          key={`${rowId}-${index}`}
          state={box.state}
          letter={box.letter}
          onBurst={onBurst}
        />
      ))}
    </div>
  );
}

function boxesFromDisplay(
  guessPart,
  targetName,
  { revealed, flashing, wrongAttempt, won, typingGlowActive },
) {
  return targetName.split("").map((char, index) => {
    if (won && revealed[index]) {
      return { state: "correct", letter: char };
    }
    if (flashing[index]) {
      return { state: "flash", letter: char };
    }
    if (wrongAttempt[index]) {
      return { state: "wrong-glow", letter: null };
    }
    if (typingGlowActive && index < guessPart.length && !revealed[index]) {
      return { state: "typed", letter: null };
    }
    return { state: "hidden", letter: null };
  });
}

function buildFullCharacterQueue(firstName, lastName) {
  const queue = [];
  firstName.split("").forEach((_, index) => {
    queue.push({ row: "first", index });
  });
  lastName.split("").forEach((_, index) => {
    queue.push({ row: "last", index });
  });
  return queue;
}

function evaluateCharacterStep(
  row,
  index,
  guessFirst,
  guessLast,
  firstName,
  lastName,
) {
  const guessPart = row === "first" ? guessFirst : guessLast;
  const targetName = row === "first" ? firstName : lastName;

  if (index >= guessPart.length) return "skip";

  const typed = guessPart[index] ?? guessPart.charAt(index);
  return normalizeName(typed) === normalizeName(targetName[index])
    ? "correct"
    : "wrong";
}

export default forwardRef(function GuessNameGame(
  { embedded = false, inputId = "guess-name-input" },
  ref,
) {
  const isAdmin = useAdminMode();
  const firstName = process.env.NEXT_PUBLIC_BABY_FIRST_NAME?.trim() ?? "";
  const lastName = process.env.NEXT_PUBLIC_BABY_LAST_NAME?.trim() ?? "";

  const [guess, setGuess] = useState("");
  const [revealedFirst, setRevealedFirst] = useState([]);
  const [revealedLast, setRevealedLast] = useState([]);
  const [flashingFirst, setFlashingFirst] = useState([]);
  const [flashingLast, setFlashingLast] = useState([]);
  const [wrongFirst, setWrongFirst] = useState([]);
  const [wrongLast, setWrongLast] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [won, setWon] = useState(false);
  const [outOfAttempts, setOutOfAttempts] = useState(false);
  const [typingGlowActive, setTypingGlowActive] = useState(false);
  const [lastSubmittedGuess, setLastSubmittedGuess] = useState("");
  const [statusLoading, setStatusLoading] = useState(true);
  const [attemptError, setAttemptError] = useState("");
  const revealTimersRef = useRef([]);
  const addBurst = useAddSparkBurst();

  useImperativeHandle(
    ref,
    () => ({
      getAnswer() {
        const saved = lastSubmittedGuess.trim();
        if (saved) return saved;
        const current = guess.trim();
        return current || null;
      },
    }),
    [guess, lastSubmittedGuess],
  );

  const clearRevealTimers = useCallback(() => {
    revealTimersRef.current.forEach((id) => window.clearTimeout(id));
    revealTimersRef.current = [];
  }, []);

  const scheduleReveal = useCallback((fn, delay) => {
    const id = window.setTimeout(fn, delay);
    revealTimersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    const init = (name) => Array(name.length).fill(false);
    setRevealedFirst(init(firstName));
    setRevealedLast(init(lastName));
    setFlashingFirst(init(firstName));
    setFlashingLast(init(lastName));
    setWrongFirst(init(firstName));
    setWrongLast(init(lastName));
    setGuess("");
    setLastSubmittedGuess("");
    setAttempts(0);
    setIsRevealing(false);
    setWon(false);
    setOutOfAttempts(false);
    setTypingGlowActive(false);
    setAttemptError("");
  }, [firstName, lastName]);

  useEffect(() => {
    if (isAdmin) {
      setStatusLoading(false);
      return;
    }

    let cancelled = false;

    async function loadStatus() {
      try {
        const visitorId = await getVisitorId();
        if (!visitorId) return;
        const res = await fetch(
          `/api/name-guess/status?visitorId=${encodeURIComponent(visitorId)}`,
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) return;
        if (data.canAttempt === false) {
          setOutOfAttempts(true);
        }
      } catch {
        /* keep local state */
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    }

    loadStatus();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    return () => {
      clearRevealTimers();
    };
  }, [clearRevealTimers]);

  const { first, last } = splitGuessInput(guess, firstName);
  const firstBoxes = boxesFromDisplay(first, firstName, {
    revealed: revealedFirst,
    flashing: flashingFirst,
    wrongAttempt: wrongFirst,
    won,
    typingGlowActive,
  });
  const lastBoxes = boxesFromDisplay(last, lastName, {
    revealed: revealedLast,
    flashing: flashingLast,
    wrongAttempt: wrongLast,
    won,
    typingGlowActive,
  });
  const attemptsLeft = MAX_ATTEMPTS - attempts;
  const locked = won || outOfAttempts || isRevealing;

  const runGuessAnimation = useCallback((submittedGuess) => {
    unlockGuessSounds();
    clearRevealTimers();

    const { first: guessFirst, last: guessLast } = splitGuessInput(
      submittedGuess,
      firstName,
    );
    const nextFirst = mergeRevealedFromGuess(guessFirst, firstName, revealedFirst);
    const nextLast = mergeRevealedFromGuess(guessLast, lastName, revealedLast);
    const characterQueue = buildFullCharacterQueue(firstName, lastName);

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    const firstExact = isExactNameMatch(guessFirst, firstName);
    const lastExact = isExactNameMatch(guessLast, lastName);
    const fullWin =
      (firstExact && lastExact) ||
      (allLettersRevealed(nextFirst, firstName) &&
        allLettersRevealed(nextLast, lastName));

    function resetVisualState() {
      setFlashingFirst(emptyMask(firstName.length));
      setFlashingLast(emptyMask(lastName.length));
      setWrongFirst(emptyMask(firstName.length));
      setWrongLast(emptyMask(lastName.length));
      setTypingGlowActive(false);
    }

    function finishRound() {
      setRevealedFirst(nextFirst);
      setRevealedLast(nextLast);
      resetVisualState();
      setIsRevealing(false);

      if (fullWin) {
        playGuessSuccessSound();
        setWon(true);
      } else if (nextAttempts >= MAX_ATTEMPTS) {
        setOutOfAttempts(true);
      }
    }

    setIsRevealing(true);
    setTypingGlowActive(false);
    resetVisualState();

    let stepIndex = 0;

    function processStep() {
      if (stepIndex >= characterQueue.length) {
        finishRound();
        return;
      }

      const step = characterQueue[stepIndex];
      const outcome = evaluateCharacterStep(
        step.row,
        step.index,
        guessFirst,
        guessLast,
        firstName,
        lastName,
      );

      stepIndex += 1;

      if (outcome === "correct") {
        playGuessLetterRevealSound();
        if (step.row === "first") {
          setFlashingFirst((prev) => {
            const next = [...prev];
            next[step.index] = true;
            return next;
          });
        } else {
          setFlashingLast((prev) => {
            const next = [...prev];
            next[step.index] = true;
            return next;
          });
        }
      } else if (outcome === "wrong") {
        playGuessWrongSound();
        if (step.row === "first") {
          setWrongFirst((prev) => {
            const next = [...prev];
            next[step.index] = true;
            return next;
          });
        } else {
          setWrongLast((prev) => {
            const next = [...prev];
            next[step.index] = true;
            return next;
          });
        }
      }

      const delay = outcome === "skip" ? SKIP_STEP_MS : CHAR_STEP_MS;
      scheduleReveal(processStep, delay);
    }

    processStep();
  }, [
    firstName,
    lastName,
    revealedFirst,
    revealedLast,
    attempts,
    clearRevealTimers,
    scheduleReveal,
  ]);

  const handleGuess = useCallback(async () => {
    if (locked || !guess.trim() || statusLoading) return;

    const submittedGuess = guess.trim();
    setAttemptError("");

    if (!isAdmin) {
      try {
        const visitorId = await getVisitorId();
        const res = await fetch("/api/name-guess/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setOutOfAttempts(true);
          setAttemptError(data.error || "Kesempatan tebak nama sudah habis.");
          return;
        }
      } catch {
        setAttemptError("Gagal mencatat percobaan. Coba lagi ya.");
        return;
      }
    }

    setLastSubmittedGuess(submittedGuess);
    runGuessAnimation(submittedGuess);
  }, [locked, guess, statusLoading, runGuessAnimation]);

  function handleInputChange(value) {
    setGuess(value);
    setTypingGlowActive(true);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleGuess();
    }
  }

  if (!firstName || !lastName) {
    return (
      <p className="text-center text-sm text-slate-500">
        Game belum siap — nama bayi belum diset.
      </p>
    );
  }

  return (
    <>
      {!embedded ? (
        <p className="text-center text-sm text-slate-600 sm:text-base">
          Tebak namaku yuk — huruf benar terbuka setelah klik Tebak! ❄️
        </p>
      ) : null}

      <div className={`space-y-3 sm:space-y-4 ${embedded ? "" : "mt-5"}`}>
        <LetterBoxes rowId="first" boxes={firstBoxes} nowrap onBurst={addBurst} />
        <LetterBoxes rowId="last" boxes={lastBoxes} onBurst={addBurst} />
      </div>

      {!won && !outOfAttempts ? (
        <div className="mt-5 space-y-2.5">
          <p className="text-center text-xs font-semibold text-slate-500">
            Kesempatan: {attemptsLeft} / {MAX_ATTEMPTS}
          </p>
          <label htmlFor={inputId} className="sr-only">
            Tebak nama
          </label>
          <input
            id={inputId}
            type="text"
            value={guess}
            onFocus={unlockGuessSounds}
            onKeyDown={(e) => {
              unlockGuessSounds();
              handleKeyDown(e);
            }}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={isRevealing || statusLoading}
            autoComplete="off"
            placeholder="Ketik nama di sini..."
            className="font-display w-full rounded-2xl border border-sky-200/80 bg-white/90 px-4 py-3 text-base font-semibold text-aira-navy shadow-inner placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/70 disabled:opacity-60"
          />
          {attemptError ? (
            <p className="text-center text-xs text-red-600" role="alert">
              {attemptError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleGuess}
            disabled={!guess.trim() || isRevealing || statusLoading}
            className="font-display w-full rounded-xl bg-gradient-to-r from-sky-500 to-aira-navy px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50"
          >
            {isRevealing ? "..." : statusLoading ? "Memuat..." : "Tebak!"}
          </button>
        </div>
      ) : won ? (
        <p className="mt-5 rounded-2xl border border-sky-200/80 bg-white/85 px-4 py-3 text-center text-sm font-semibold text-aira-navy">
          Nama sudah terbuka semua. Sstt... rahasia ya! 🤫
        </p>
      ) : embedded ? (
        <div className="mt-5 space-y-2.5">
          <p className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900">
            Kesempatan tebak habis. Tulis tebakanmu untuk doorprize ya.
          </p>
          <label htmlFor={`${inputId}-manual`} className="sr-only">
            Tebakan nama untuk doorprize
          </label>
          <input
            id={`${inputId}-manual`}
            type="text"
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setLastSubmittedGuess(e.target.value.trim());
            }}
            autoComplete="off"
            placeholder="Tulis tebakan nama..."
            className="font-display w-full rounded-2xl border border-sky-200/80 bg-white/90 px-4 py-3 text-base font-semibold text-aira-navy shadow-inner placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/70"
          />
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-900">
          Kesempatan habis. Huruf yang belum terbuka tetap rahasia! 🤫
        </p>
      )}
    </>
  );
});
