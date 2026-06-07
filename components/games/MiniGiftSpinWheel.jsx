"use client";

import { vibrateMatch } from "@/lib/babyMatch";
import { useWishTicker } from "@/components/WishTickerProvider";
import {
  playSpinStartSound,
  playSpinTickSound,
  playSpinWinSound,
  playSpinZonkSound,
  unlockGuessSounds,
} from "@/lib/guessSounds";
import { useCallback, useEffect, useRef, useState } from "react";

const SEGMENT_COLORS = [
  "#BAE6FD",
  "#FBCFE8",
  "#BBF7D0",
  "#FDE68A",
  "#E9D5FF",
  "#FECDD3",
  "#99F6E4",
  "#FED7AA",
];

const ZONK_COLOR = "#E2E8F0";
const SPIN_MS = 4200;

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeSegment(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function uprightRotation(deg) {
  let rotation = ((deg % 360) + 360) % 360;
  if (rotation > 90 && rotation < 270) {
    rotation = (rotation + 180) % 360;
  }
  return rotation;
}

function segmentLabelLayout(mid, segmentAngle) {
  const labelRadius = 68;
  const pos = polarToCartesian(100, 100, labelRadius, mid);
  const rotation = uprightRotation(mid + 90);
  const arcWidth =
    2 * labelRadius * Math.sin(((segmentAngle / 2) * Math.PI) / 180);
  const radialLen = Math.max(30, 96 - labelRadius);
  const width = Math.max(32, Math.min(radialLen, 50));
  const height = Math.max(16, Math.min(arcWidth * 0.92, 34));

  return { pos, rotation, width, height };
}

function SegmentLabel({ name, mid, segmentAngle }) {
  const { pos, rotation, width, height } = segmentLabelLayout(mid, segmentAngle);

  return (
    <foreignObject
      x={pos.x - width / 2}
      y={pos.y - height / 2}
      width={width}
      height={height}
      transform={`rotate(${rotation}, ${pos.x}, ${pos.y})`}
      className="overflow-visible"
    >
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className="flex h-full w-full items-center justify-center px-0.5 text-center text-[7px] font-bold leading-[1.2] text-aira-navy sm:text-[8px]"
        style={{
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {name}
      </div>
    </foreignObject>
  );
}

function spinRotationForIndex(index, count, currentRotation) {
  const segmentAngle = 360 / count;
  const targetMod =
    (360 - index * segmentAngle - segmentAngle / 2 + 360) % 360;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  let delta = targetMod - currentMod;
  if (delta <= 0) delta += 360;
  return currentRotation + 360 * 5 + delta;
}

export default function MiniGiftSpinWheel({ open, onClose, onFinished, wishName = "" }) {
  const { addWinner } = useWishTicker();
  const [presents, setPresents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [winnerContact, setWinnerContact] = useState("");
  const [winnerStatus, setWinnerStatus] = useState("idle");
  const [winnerError, setWinnerError] = useState("");
  const [hasAvailablePrizes, setHasAvailablePrizes] = useState(true);
  const rotationRef = useRef(0);
  const wheelRef = useRef(null);
  const spinTickRef = useRef(null);

  const loadPresents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/presents");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal memuat hadiah.");
      setHasAvailablePrizes(data.hasAvailablePrizes !== false);
      setPresents(Array.isArray(data.presents) ? data.presents : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat hadiah.");
      setPresents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setSpinning(false);
    setWinnerContact("");
    setWinnerStatus("idle");
    setWinnerError("");
    if (spinTickRef.current) {
      window.clearInterval(spinTickRef.current);
      spinTickRef.current = null;
    }
    loadPresents();
  }, [open, loadPresents]);

  useEffect(
    () => () => {
      if (spinTickRef.current) {
        window.clearInterval(spinTickRef.current);
        spinTickRef.current = null;
      }
    },
    [],
  );

  function clearSpinTicks() {
    if (spinTickRef.current) {
      window.clearInterval(spinTickRef.current);
      spinTickRef.current = null;
    }
  }

  function playSpinResultSound(outcome) {
    if (outcome === "win") {
      playSpinWinSound();
      return;
    }
    playSpinZonkSound();
  }

  async function handleSpin() {
    if (spinning || loading || !presents.length || !hasAvailablePrizes) return;

    unlockGuessSounds();
    setSpinning(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/presents/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmentIds: presents.map((present) => present.id),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal memutar.");

      const index =
        typeof data.index === "number"
          ? data.index
          : presents.findIndex((p) => p.id === data.present?.id);

      const nextRotation = spinRotationForIndex(
        index,
        presents.length,
        rotationRef.current,
      );
      rotationRef.current = nextRotation;
      setRotation(nextRotation);

      playSpinStartSound();
      clearSpinTicks();
      spinTickRef.current = window.setInterval(() => {
        playSpinTickSound();
      }, 380);

      window.setTimeout(() => {
        clearSpinTicks();
        setSpinning(false);
        setResult(data);
        playSpinResultSound(data.outcome);
        if (data.outcome === "win") vibrateMatch();
        onFinished?.(data);
      }, SPIN_MS);
    } catch (err) {
      clearSpinTicks();
      setSpinning(false);
      setError(err instanceof Error ? err.message : "Gagal memutar.");
    }
  }

  function handleClose() {
    if (spinning) return;
    if (result?.outcome === "win" && winnerStatus !== "sent") return;
    onClose?.();
  }

  function handleSpinAgain() {
    setResult(null);
    setWinnerContact("");
    setWinnerStatus("idle");
    setWinnerError("");
    loadPresents();
  }

  async function submitWinner() {
    if (!result?.present?.id || winnerStatus === "sending") return;
    if (!wishName.trim()) {
      setWinnerError("Nama dari ucapan tidak ditemukan. Kirim ucapan dulu ya.");
      return;
    }

    setWinnerStatus("sending");
    setWinnerError("");

    try {
      const res = await fetch("/api/presents/winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presentId: result.present.id,
          winnerContact: winnerContact,
          winnerName: wishName.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan kontak.");
      setWinnerStatus("sent");
      addWinner({
        id: result.present.id,
        winnerName: wishName.trim(),
        prizeName:
          String(result.present.description ?? "").trim() ||
          result.present.name,
        createdDate: new Date().toISOString(),
      });
    } catch (err) {
      setWinnerStatus("idle");
      setWinnerError(
        err instanceof Error ? err.message : "Gagal menyimpan kontak.",
      );
    }
  }

  const winnerSaved = winnerStatus === "sent";
  const showWinnerForm =
    result?.outcome === "win" && !winnerSaved;

  const allowBodyScroll = Boolean(result);

  if (!open) return null;

  const count = presents.length;
  const segmentAngle = count > 0 ? 360 / count : 0;

  return (
    <div
      className="fixed inset-0 z-[270] flex items-center justify-center bg-slate-900/55 p-4"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="spin-wheel-title"
        className="flex max-h-[calc(90dvh-2rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-rose-200/80 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h4
          id="spin-wheel-title"
          className="font-display shrink-0 border-b border-sky-100/80 px-4 py-3 text-center text-base font-bold text-aira-navy"
        >
          🎁 Mini Gift Roulette
        </h4>

        <div
          className={`px-4 py-3 ${
            allowBodyScroll
              ? "min-h-0 flex-1 overflow-y-auto overscroll-contain"
              : "shrink-0 overflow-hidden"
          }`}
        >
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Memuat hadiah…</p>
          ) : error && !presents.length ? (
            <p className="py-4 text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : (
            <div
              className={`relative mx-auto w-full pt-4 ${
                result ? "max-w-[11rem] sm:max-w-[12rem]" : "max-w-[14rem] sm:max-w-[16rem]"
              }`}
            >
              <div
                className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1"
                aria-hidden="true"
              >
                <span className="block h-0 w-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-rose-500 drop-shadow" />
              </div>

              <div
                ref={wheelRef}
                className="relative mx-auto aspect-square w-full rounded-full border-4 border-white shadow-lg"
                style={{
                  transition: spinning
                    ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.85, 0.2, 1)`
                    : "none",
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  {presents.map((present, index) => {
                    const start = index * segmentAngle;
                    const end = (index + 1) * segmentAngle;
                    const mid = start + segmentAngle / 2;
                    const fill = present.isZonk
                      ? ZONK_COLOR
                      : SEGMENT_COLORS[index % SEGMENT_COLORS.length];

                    return (
                      <g key={present.wheelKey ?? `${present.id}-${index}`}>
                        <path
                          d={describeSegment(100, 100, 98, start, end)}
                          fill={fill}
                          stroke="#fff"
                          strokeWidth="1.5"
                        />
                        <SegmentLabel
                          name={present.name}
                          mid={mid}
                          segmentAngle={segmentAngle}
                        />
                      </g>
                    );
                  })}
                  <circle cx="100" cy="100" r="18" fill="#fff" stroke="#BAE6FD" strokeWidth="3" />
                  <text
                    x="100"
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    aria-hidden="true"
                  >
                    🎁
                  </text>
                </svg>
              </div>
            </div>
          )}

          {error && presents.length ? (
            <p className="mt-2 text-center text-xs text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {result ? (
            <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-3 text-center text-sm">
              {result.outcome === "win" ? (
                <>
                  <p className="text-2xl" aria-hidden="true">
                    🎉
                  </p>
                  <p className="font-display mt-1 font-bold text-aira-navy">
                    Selamat! Kamu dapat:
                  </p>
                  <p className="mt-1 font-semibold text-emerald-700">
                    {result.present?.name}
                  </p>
                  {result.present?.description ? (
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {result.present.description}
                    </p>
                  ) : null}
                  {showWinnerForm ? (
                    <div className="mt-3 text-left">
                      <label
                        htmlFor="winner-contact"
                        className="block text-xs font-semibold text-aira-navy"
                      >
                        Whatsapp/Email
                      </label>
                      <input
                        id="winner-contact"
                        type="text"
                        value={winnerContact}
                        onChange={(e) => setWinnerContact(e.target.value)}
                        placeholder="08xx atau nama@email.com"
                        className="mt-1.5 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm text-aira-navy placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                      {winnerError ? (
                        <p className="mt-1.5 text-xs text-red-600" role="alert">
                          {winnerError}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        disabled={
                          winnerStatus === "sending" ||
                          !winnerContact.trim() ||
                          !wishName.trim()
                        }
                        onClick={submitWinner}
                        className="font-display mt-3 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-50"
                      >
                        {winnerStatus === "sending" ? "Menyimpan…" : "Kirim kontak"}
                      </button>
                    </div>
                  ) : null}
                  {winnerSaved ? (
                    <p className="mt-3 text-xs font-semibold text-emerald-700">
                      Kontak tersimpan! Hadiah akan dikirim ke kontakmu. 🎁
                    </p>
                  ) : null}
                </>
              ) : null}
              {result.outcome === "zonk" ? (
                <>
                  <p className="text-2xl" aria-hidden="true">
                    😅
                  </p>
                  <p className="font-display mt-1 font-bold text-aira-navy">Zonk!</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Belum beruntung kali ini. Terima kasih sudah main!
                  </p>
                </>
              ) : null}
              {result.outcome === "unavailable" ? (
                <>
                  <p className="text-2xl" aria-hidden="true">
                    📦
                  </p>
                  <p className="font-display mt-1 font-bold text-aira-navy">
                    {result.present?.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Hadiah ini sudah habis — putar lagi ya!
                  </p>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 space-y-2 border-t border-sky-100/80 bg-white/90 px-4 py-3">
          {!result && hasAvailablePrizes ? (
            <button
              type="button"
              disabled={spinning || loading || !presents.length}
              onClick={handleSpin}
              className="font-display w-full rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-50"
            >
              {spinning ? "Memutar…" : "Putar!"}
            </button>
          ) : !result && !hasAvailablePrizes ? (
            <p className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-3 text-center text-sm text-slate-600">
              Yah hadiahnya sudah habis 😢
            </p>
          ) : result?.canSpinAgain ? (
            <button
              type="button"
              onClick={handleSpinAgain}
              className="font-display w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              Putar lagi
            </button>
          ) : result && !showWinnerForm ? (
            <button
              type="button"
              onClick={handleClose}
              className="font-display w-full rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              {result.outcome === "win" ? "Yeay!" : "OK"}
            </button>
          ) : null}

          {!spinning && !result?.canSpinAgain && !showWinnerForm ? (
            <button
              type="button"
              onClick={handleClose}
              className="w-full text-xs font-semibold text-slate-500 hover:text-aira-navy"
            >
              Tutup
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
