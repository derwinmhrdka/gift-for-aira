"use client";

import { forwardRef, useImperativeHandle, useState } from "react";

/** Jawaban tebak gender — hardcoded. */
const BABY_GENDER = "girl";

const OPTIONS = [
  { id: "girl", label: "Girl", emoji: "👧", accent: "from-pink-400 to-rose-500" },
  { id: "boy", label: "Boy", emoji: "👦", accent: "from-sky-400 to-blue-600" },
];

const GuessGenderGame = forwardRef(function GuessGenderGame(
  { embedded = false },
  ref,
) {
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);

  useImperativeHandle(
    ref,
    () => ({
      getAnswer() {
        const opt = OPTIONS.find((o) => o.id === picked);
        return opt?.label ?? null;
      },
    }),
    [picked],
  );

  function handlePick(id) {
    setPicked(id);
    if (!embedded) {
      setResult(id === BABY_GENDER ? "win" : "lose");
    }
  }

  function reset() {
    setPicked(null);
    setResult(null);
  }

  return (
    <div className="text-center">
      {!embedded ? (
        <p className="text-sm text-slate-600 sm:text-base">
          Tebak gender si kecil! Pilih salah satu ya 🎀
        </p>
      ) : null}

      <div className={`grid grid-cols-2 gap-3 ${embedded ? "" : "mt-5"}`}>
        {OPTIONS.map(({ id, label, emoji, accent }) => {
          const isPicked = picked === id;
          const isCorrect = !embedded && result && id === BABY_GENDER;
          const isWrong = !embedded && result === "lose" && isPicked;

          return (
            <button
              key={id}
              type="button"
              disabled={!embedded && !!result}
              onClick={() => handlePick(id)}
              className={`rounded-2xl border px-3 py-5 transition focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-default ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-300"
                  : isWrong
                    ? "border-red-200 bg-red-50 opacity-80"
                    : isPicked
                      ? "border-sky-300 bg-sky-50 ring-2 ring-sky-300"
                      : "border-sky-200/80 bg-white/90 hover:border-sky-300 hover:bg-sky-50/80"
              }`}
            >
              <span className="text-4xl" aria-hidden="true">
                {emoji}
              </span>
              <span
                className={`font-display mt-2 block text-sm font-bold sm:text-base ${
                  isCorrect ? "text-emerald-800" : "text-aira-navy"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {!embedded && result === "win" ? (
        <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          Yeay, benar! 🤫 Sstt... jangan bilang siapa-siapa ya!
        </p>
      ) : null}

      {!embedded && result === "lose" ? (
        <div className="mt-5 space-y-3">
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            Belum tepat nih 😄 Coba lagi yuk!
          </p>
          <button
            type="button"
            onClick={reset}
            className="font-display rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-aira-navy hover:bg-sky-50"
          >
            Tebak lagi
          </button>
        </div>
      ) : null}
    </div>
  );
});

export default GuessGenderGame;
