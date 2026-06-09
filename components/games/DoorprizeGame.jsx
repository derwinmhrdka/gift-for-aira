"use client";

import GuessDateGame from "@/components/games/GuessDateGame";
import GuessGenderGame from "@/components/games/GuessGenderGame";
import GuessNameGame from "@/components/games/GuessNameGame";
import GuessTimeGame from "@/components/games/GuessTimeGame";
import GuessWeightGame from "@/components/games/GuessWeightGame";
import { useAdminMode } from "@/components/AdminModeProvider";
import { markParticipatedIn } from "@/lib/gameParticipation";
import { getVisitorId } from "@/lib/visitorId";
import { useRef, useState } from "react";

const STEPS = [
  { key: "gender", title: "Guess Me", emoji: "👶🏻" },
  { key: "date", title: "Guess My Date", emoji: "📅" },
  { key: "time", title: "Guess My Time", emoji: "🕐" },
  { key: "weight", title: "Guess My Weight", emoji: "⚖️" },
  { key: "name", title: "Guess My Name", emoji: "🔤" },
];

function StepSection({ step, title, emoji, children }) {
  return (
    <section className="rounded-2xl border border-sky-200/70 bg-white/60 px-4 py-4">
      <div className="mb-4 flex items-center gap-2.5 border-b border-sky-100/80 pb-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-extrabold text-sky-700">
          {step}
        </span>
        <span className="text-lg" aria-hidden="true">
          {emoji}
        </span>
        <h3 className="font-display text-sm font-bold text-aira-navy sm:text-base">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

export default function DoorprizeGame({ wishId, onComplete }) {
  const isAdmin = useAdminMode();
  const genderRef = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);
  const weightRef = useRef(null);
  const nameRef = useRef(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function collectAnswers() {
    return {
      answer1: genderRef.current?.getAnswer?.() ?? null,
      answer2: dateRef.current?.getAnswer?.() ?? null,
      answer3: timeRef.current?.getAnswer?.() ?? null,
      answer4: weightRef.current?.getAnswer?.() ?? null,
      answer5: nameRef.current?.getAnswer?.() ?? null,
    };
  }

  function openConfirm() {
    if (!wishId) {
      setError("Ucapan belum tersimpan. Kirim ucapan dulu ya.");
      return;
    }
    setError("");
    setPreview(collectAnswers());
    setShowConfirm(true);
  }

  async function submitAnswers() {
    if (!wishId || !preview) return;

    setStatus("sending");
    setError("");

    try {
      const visitorId = await getVisitorId();
      const res = await fetch("/api/wishes/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishId, answers: preview, visitorId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal mengirim jawaban.");

      markParticipatedIn("doorprize");
      setShowConfirm(false);
      setStatus("sent");
      setShowThanks(true);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Gagal mengirim jawaban.");
    }
  }

  function closeThanks() {
    setShowThanks(false);
    onComplete?.();
  }

  function skipDoorprize() {
    if (!isAdmin) return;
    markParticipatedIn("doorprize");
    onComplete?.();
  }

  const previewRows = preview
    ? [
        { label: STEPS[0].title, value: preview.answer1 },
        { label: STEPS[1].title, value: preview.answer2 },
        { label: STEPS[2].title, value: preview.answer3 },
        { label: STEPS[3].title, value: preview.answer4 },
        { label: STEPS[4].title, value: preview.answer5 },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-2xl" aria-hidden="true">
          🎁
        </p>
        <p className="font-display mt-1 text-base font-bold text-aira-navy sm:text-lg">
          Doorprize Challenge
        </p>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Selesaikan {STEPS.length} tebakan berikut. Good luck!
        </p>
        {isAdmin ? (
          <button
            type="button"
            onClick={skipDoorprize}
            className="mt-3 rounded-lg border border-dashed border-amber-300/90 bg-amber-50/70 px-3 py-1.5 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-100/80 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            Skip
          </button>
        ) : null}
      </div>

      <StepSection step={1} title={STEPS[0].title} emoji={STEPS[0].emoji}>
        <GuessGenderGame ref={genderRef} embedded />
      </StepSection>

      <StepSection step={2} title={STEPS[1].title} emoji={STEPS[1].emoji}>
        <GuessDateGame ref={dateRef} embedded />
      </StepSection>

      <StepSection step={3} title={STEPS[2].title} emoji={STEPS[2].emoji}>
        <GuessTimeGame ref={timeRef} embedded />
      </StepSection>

      <StepSection step={4} title={STEPS[3].title} emoji={STEPS[3].emoji}>
        <GuessWeightGame ref={weightRef} embedded />
      </StepSection>

      <StepSection step={5} title={STEPS[4].title} emoji={STEPS[4].emoji}>
        <GuessNameGame ref={nameRef} embedded inputId="guess-name-doorprize" />
      </StepSection>

      {status !== "sent" ? (
        <>
          {error ? (
            <p className="text-center text-xs text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={openConfirm}
            disabled={status === "sending" || !wishId}
            className="font-display w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-sm font-bold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-50"
          >
            Kirim Jawaban
          </button>
        </>
      ) : null}

      {showConfirm ? (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/50 p-4"
          role="presentation"
          onClick={() => {
            if (status !== "sending") setShowConfirm(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-answers-title"
            className="w-full max-w-sm rounded-2xl border border-sky-200/80 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4
              id="confirm-answers-title"
              className="font-display text-center text-base font-bold text-aira-navy"
            >
              Kirim jawaban doorprize?
            </h4>
            <p className="mt-1 text-center text-xs text-slate-500">
              Pastikan semua tebakan sudah benar sebelum kirim.
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              {previewRows.map(({ label, value }) => (
                <li
                  key={label}
                  className="flex items-start justify-between gap-3 rounded-xl bg-sky-50/80 px-3 py-2"
                >
                  <span className="shrink-0 font-semibold text-slate-600">
                    {label}
                  </span>
                  <span className="text-right font-bold text-aira-navy">
                    {value || "—"}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={status === "sending"}
                onClick={() => setShowConfirm(false)}
                className="font-display rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-sm font-semibold text-aira-navy hover:bg-sky-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={status === "sending"}
                onClick={submitAnswers}
                className="font-display rounded-xl bg-gradient-to-r from-sky-500 to-aira-navy px-3 py-2.5 text-sm font-bold text-white hover:opacity-95 disabled:opacity-50"
              >
                {status === "sending" ? "..." : "Ya, kirim"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showThanks ? (
        <div
          className="fixed inset-0 z-[260] flex items-center justify-center bg-slate-900/55 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="thanks-doorprize-title"
            className="w-full max-w-sm rounded-2xl border border-emerald-200/80 bg-white p-6 text-center shadow-xl"
          >
            <p className="text-4xl" aria-hidden="true">
              🎁
            </p>
            <h4
              id="thanks-doorprize-title"
              className="font-display mt-3 text-base font-bold text-aira-navy sm:text-lg"
            >
              Terima kasih sudah berpartisipasi!
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              Tunggu hasil dan hadiahnya di Ig & WA story
            </p>
            <button
              type="button"
              onClick={closeThanks}
              className="font-display mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
