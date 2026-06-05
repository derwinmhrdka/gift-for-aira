"use client";

import { useAddSparkBurst } from "@/components/SparkBurstProvider";
import {
  createRevealState,
  evaluateGuessFeedback,
  revealedFromGuess,
  splitGuessInput,
} from "@/lib/nameGuess";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const POPUP_AUTO_CLOSE_MS = 2800;

function playShushSound() {
  try {
    const ctx = new AudioContext();
    const duration = 0.45;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.22;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 0.7;
    source.connect(filter);
    filter.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration);
  } catch {
    // Audio may be blocked until user gesture.
  }
}

function LetterBox({ char, open, onBurst }) {
  const ref = useRef(null);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open && !wasOpen.current && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      onBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    wasOpen.current = open;
  }, [open, onBurst]);

  return (
    <div
      ref={ref}
      className={`aira-letter-box h-7 w-6 shrink-0 rounded-lg sm:h-8 sm:w-7 sm:rounded-xl ${
        open ? "is-open" : ""
      }`}
    >
      <div className="aira-letter-flip">
        <div className="aira-letter-face aira-letter-front font-display text-sm font-extrabold sm:text-base">
          ?
        </div>
        <div className="aira-letter-face aira-letter-back font-display text-sm font-extrabold sm:text-base">
          {char.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

function LetterBoxes({ rowId, name, revealed, nowrap, onBurst }) {
  if (!name) return null;
  return (
    <div
      className={`flex justify-center gap-0.5 sm:gap-1 ${nowrap ? "flex-nowrap" : "flex-wrap"}`}
    >
      {name.split("").map((char, index) => (
        <LetterBox
          key={`${rowId}-${index}`}
          char={char}
          open={revealed[index]}
          onBurst={onBurst}
        />
      ))}
    </div>
  );
}

function GuessPopup({ type, onClose }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!type) return undefined;
    if (type === "success") playShushSound();
    timerRef.current = window.setTimeout(onClose, POPUP_AUTO_CLOSE_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [type, onClose]);

  if (!type || typeof document === "undefined") return null;

  const content =
    type === "success"
      ? { title: "Sstt... 🤫", desc: "Kamu benar, jangan bilang siapa-siapa ya!" }
      : type === "close"
        ? { title: "Hampir! :o", desc: "Sedikit lagi, coba lagi ya." }
        : { title: "Coba lagi 😂", desc: "Belum tepat, tebak sekali lagi." };

  return createPortal(
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guess-popup-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="Tutup"
      />
      <div className="relative w-full max-w-sm rounded-3xl border border-sky-100 bg-white px-8 py-8 text-center shadow-xl">
        <p className="text-4xl" aria-hidden>
          {type === "success" ? "🤫" : type === "close" ? "😮" : "😂"}
        </p>
        <h3
          id="guess-popup-title"
          className="font-display mt-3 text-2xl font-bold text-aira-navy sm:text-3xl"
        >
          {content.title}
        </h3>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">{content.desc}</p>
      </div>
    </div>,
    document.body,
  );
}

export default function GuessNameSection() {
  const firstName = process.env.NEXT_PUBLIC_BABY_FIRST_NAME?.trim() ?? "";
  const lastName = process.env.NEXT_PUBLIC_BABY_LAST_NAME?.trim() ?? "";

  const [revealedFirst, setRevealedFirst] = useState(() =>
    createRevealState(firstName.length),
  );
  const [revealedLast, setRevealedLast] = useState(() =>
    createRevealState(lastName.length),
  );
  const [guess, setGuess] = useState("");
  const [popup, setPopup] = useState(null);
  const [won, setWon] = useState(false);
  const addBurst = useAddSparkBurst();

  const closePopup = useCallback(() => setPopup(null), []);

  const handleInputChange = useCallback(
    (value) => {
      if (won) return;

      setGuess(value);
      const { first, last } = splitGuessInput(value);

      setRevealedFirst(revealedFromGuess(first, firstName));
      setRevealedLast(revealedFromGuess(last, lastName));

      const feedback = evaluateGuessFeedback(first, last, firstName, lastName);
      if (feedback === "success") {
        setWon(true);
        setPopup("success");
      } else {
        setPopup(feedback);
      }
    },
    [firstName, lastName, won],
  );

  if (!firstName || !lastName) return null;

  return (
    <>
      <section className="w-full" aria-labelledby="guess-name-heading">
        <div className="mx-auto max-w-xl rounded-3xl border border-white/55 bg-gradient-to-b from-white/80 via-white/70 to-sky-50/50 px-4 py-6 text-center shadow-md shadow-sky-200/25 backdrop-blur-md sm:px-7 sm:py-8">
          <h2
            id="guess-name-heading"
            className="font-display text-2xl font-bold text-aira-navy sm:text-3xl"
          >
            Guess my name?
          </h2>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            Ketik namaku yuk! Pisahkan dengan spasi.
          </p>

          <div className="mt-6 space-y-3 sm:space-y-4">
            <LetterBoxes
              rowId="first"
              name={firstName}
              revealed={revealedFirst}
              nowrap
              onBurst={addBurst}
            />
            <LetterBoxes
              rowId="last"
              name={lastName}
              revealed={revealedLast}
              onBurst={addBurst}
            />
          </div>

          {!won ? (
            <div className="mt-6">
              <label htmlFor="guess-name-input" className="sr-only">
                Tebak nama
              </label>
              <input
                id="guess-name-input"
                type="text"
                value={guess}
                onChange={(e) => handleInputChange(e.target.value)}
                autoComplete="off"
                placeholder="Contoh: Aira Mahardika"
                className="font-display w-full rounded-2xl border border-sky-200/80 bg-white/90 px-4 py-3 text-base font-semibold text-aira-navy shadow-inner placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/70"
              />
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-sky-200/80 bg-sky-50/80 px-4 py-3 text-sm font-semibold text-aira-navy">
              Nama sudah terbuka semua. Sstt... rahasia ya! 🤫
            </p>
          )}
        </div>
      </section>

      <GuessPopup type={popup} onClose={closePopup} />
    </>
  );
}
