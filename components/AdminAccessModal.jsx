"use client";

import { useAdminMode, useAdminModeActions } from "@/components/AdminModeProvider";
import { setClientAdminActive } from "@/lib/adminMode";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function AdminAccessModal({ open, onClose }) {
  const isAdmin = useAdminMode();
  const { refreshAdminStatus } = useAdminModeActions();
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function closeModal() {
    onClose();
    setKey("");
    setError("");
    setStatus("idle");
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Kode tidak valid.");
      }

      setClientAdminActive(true);
      await refreshAdminStatus();
      closeModal();
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Gagal masuk admin mode.");
    }
  }

  async function handleLogout() {
    setStatus("sending");
    setError("");

    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setClientAdminActive(false);
      await refreshAdminStatus();
      closeModal();
    } catch {
      setError("Gagal keluar admin mode.");
      setStatus("idle");
    }
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-access-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={closeModal}
        aria-label="Tutup"
      />
      <div className="relative w-full max-w-xs rounded-2xl border border-sky-100/90 bg-white p-5 shadow-xl shadow-sky-200/30">
        <h2
          id="admin-access-title"
          className="font-display text-base font-bold text-aira-navy"
        >
          {isAdmin ? "Admin mode" : "Masuk admin"}
        </h2>

        {isAdmin ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-emerald-700">
              Admin mode aktif — pembatasan game dinonaktifkan.
            </p>
            {error ? (
              <p className="text-xs text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              disabled={status === "sending"}
              className="font-display w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {status === "sending" ? "..." : "Keluar admin mode"}
            </button>
          </div>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={handleLogin}>
            <label htmlFor="admin-access-key" className="sr-only">
              Kode admin
            </label>
            <input
              id="admin-access-key"
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError("");
              }}
              autoComplete="off"
              placeholder="Masukkan kode admin"
              className="w-full rounded-xl border border-sky-200/80 bg-white px-3 py-2.5 text-sm text-aira-navy placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/70"
            />
            {error ? (
              <p className="text-xs text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={!key.trim() || status === "sending"}
              className="font-display w-full rounded-xl bg-gradient-to-r from-sky-500 to-aira-navy px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-50"
            >
              {status === "sending" ? "..." : "Masuk"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={closeModal}
          className="mt-3 w-full text-center text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Tutup
        </button>
      </div>
    </div>,
    document.body,
  );
}
