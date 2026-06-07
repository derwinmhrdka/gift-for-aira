"use client";

import FeatureCard from "@/components/FeatureCard";
import WishGamesMenu from "@/components/WishGamesMenu";
import { useWishTicker } from "@/components/WishTickerProvider";
import { useRef, useState } from "react";

export default function BestWishesSection() {
  const { addWish } = useWishTicker();
  const messageRef = useRef(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [lastWishId, setLastWishId] = useState(null);
  const [lastWishName, setLastWishName] = useState("");

  async function submitWish() {
    if (status === "sending") return;

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName) return setError("Nama wajib diisi.");
    if (!trimmedMessage) return setError("Ucapan wajib diisi.");

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, message: trimmedMessage }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal mengirim.");

      setName("");
      setMessage("");
      setLastWishId(data.wish?.id ?? null);
      setLastWishName(trimmedName);
      setStatus("sent");
      addWish({ name: trimmedName, message: trimmedMessage });
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Gagal mengirim.");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    submitWish();
  }

  function handleNameKeyDown(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (message.trim()) {
      submitWish();
      return;
    }
    messageRef.current?.focus();
  }

  function handleMessageKeyDown(e) {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    submitWish();
  }

  return (
    <section className="w-full" aria-labelledby="best-wishes-heading">
      <FeatureCard className="!px-4 !py-4 text-left sm:!px-5 sm:!py-5">
        <h2
          id="best-wishes-heading"
          className="font-display text-center text-xl font-bold text-aira-navy sm:text-2xl"
        >
          Your best wishes!
        </h2>
        {status !== "sent" ? (
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Yuk ikutan games dan dapatin hadiahnya! Tapi harus isi wishes dulu ya🎁
          </p>
        ) : null}

        {status === "sent" ? (
          <WishGamesMenu
            wishId={lastWishId}
            wishName={lastWishName}
            onSendAgain={() => {
              setLastWishId(null);
              setLastWishName("");
              setStatus("idle");
            }}
          />
        ) : (
          <form
            className="mt-3 space-y-2.5"
            onSubmit={handleSubmit}
            noValidate
          >
            <label htmlFor="wish-name" className="sr-only">
              Nama
            </label>
            <input
              id="wish-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={handleNameKeyDown}
              disabled={status === "sending"}
              autoComplete="name"
              placeholder="Nama"
              maxLength={120}
              className="w-full rounded-xl border border-sky-200/80 bg-white/90 px-3 py-2.5 text-sm text-aira-navy placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/70 disabled:opacity-60"
            />

            <label htmlFor="wish-message" className="sr-only">
              Ucapan
            </label>
            <textarea
              ref={messageRef}
              id="wish-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError("");
              }}
              onKeyDown={handleMessageKeyDown}
              disabled={status === "sending"}
              placeholder="Ucapanmu..."
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-sky-200/80 bg-white/90 px-3 py-2.5 text-sm text-aira-navy placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/70 disabled:opacity-60"
            />

            {error ? (
              <p className="text-xs text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === "sending"}
              className="font-display w-full rounded-xl bg-gradient-to-r from-sky-500 to-aira-navy px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 disabled:opacity-60"
            >
              {status === "sending" ? "..." : "Kirim"}
            </button>
          </form>
        )}
      </FeatureCard>
    </section>
  );
}
