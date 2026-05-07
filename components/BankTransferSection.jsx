"use client";

import Image from "next/image";
import { useAddSparkBurst } from "@/components/SparkBurstProvider";
import { useCallback, useMemo, useState } from "react";

function formatAccountDisplay(digits) {
  const clean = digits.replace(/\D/g, "");
  if (!clean) return "— — — —";
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

export default function BankTransferSection() {
  const addBurst = useAddSparkBurst();
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME ?? "";
  const accountName = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME ?? "";
  const rawNumber = (process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER ?? "").replace(
    /\s/g,
    "",
  );
  const danaName = process.env.NEXT_PUBLIC_DANA_ACCOUNT_NAME ?? accountName;
  const rawDanaNumber = (process.env.NEXT_PUBLIC_DANA_ACCOUNT_NUMBER ?? "").replace(
    /\s/g,
    "",
  );

  const [copied, setCopied] = useState(false);
  const [showDanaCard, setShowDanaCard] = useState(false);

  const displayNumber = useMemo(
    () => formatAccountDisplay(rawNumber),
    [rawNumber],
  );
  const displayDanaNumber = useMemo(
    () => formatAccountDisplay(rawDanaNumber),
    [rawDanaNumber],
  );
  const danaOrBankDisplayNumber = useMemo(
    () => (rawDanaNumber ? displayDanaNumber : displayNumber),
    [rawDanaNumber, displayDanaNumber, displayNumber],
  );
  const activeNumber = showDanaCard ? rawDanaNumber || rawNumber : rawNumber;
  const activeLabel = showDanaCard ? "nomor DANA" : "nomor rekening";

  const copy = useCallback(async () => {
    if (!activeNumber) return;
    try {
      await navigator.clipboard.writeText(activeNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [activeNumber]);

  const configured = Boolean(rawNumber);
  const danaConfigured = Boolean(rawDanaNumber);

  return (
    <section className="w-full" aria-labelledby="transfer-bank-heading">
      <div className="mx-auto max-w-lg px-0 text-center sm:max-w-xl lg:max-w-2xl">
        <h2
          id="transfer-bank-heading"
          className="font-display text-2xl font-bold text-aira-navy sm:text-3xl"
        >
          Transfer Bank
        </h2>
        <p className="mt-2 text-base text-slate-600 sm:text-lg">
          Bingung kasih kado? boleh transfer saja uncle onty 😀
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-md px-0 sm:mt-10 sm:max-w-lg">
        <button
          type="button"
          onClick={(e) => {
            addBurst(e.clientX, e.clientY);
            setShowDanaCard((s) => !s);
          }}
          className="group block w-full rounded-3xl text-left [perspective:1200px] focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-aira-snow"
          aria-label="Balik kartu transfer"
        >
          <div
            className={`relative aspect-[85.6/53.98] w-full transition-transform duration-[360ms] ease-out [transform-style:preserve-3d] ${
              showDanaCard ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-aira-navy via-aira-navySoft to-aira-navy p-4 shadow-2xl ring-1 ring-sky-200/25 [backface-visibility:hidden] sm:p-6 md:p-8">
              <div
                className="pointer-events-none absolute -right-4 top-5 flex items-center gap-0 sm:top-8 sm:right-2"
                aria-hidden
              >
                <span className="h-12 w-12 rounded-full bg-sky-300/90 opacity-95 sm:h-16 sm:w-16" />
                <span className="-ml-6 h-12 w-12 rounded-full bg-white/90 opacity-95 mix-blend-screen sm:-ml-8 sm:h-16 sm:w-16" />
              </div>

              <div className="pointer-events-none absolute left-4 top-4 h-8 w-11 rounded-md bg-gradient-to-br from-sky-100/95 to-sky-400/85 shadow-inner sm:left-6 sm:top-6 sm:h-10 sm:w-14" />

              <div className="relative mt-[4.9rem] flex flex-col justify-end sm:mt-[6.1rem] md:mt-[6.8rem]">
                <p className="text-left text-[10px] font-medium uppercase tracking-[0.2em] text-white/65 sm:text-xs">
                  Nomor rekening
                </p>
                <p
                  className="mt-1.5 break-all text-left font-mono text-base leading-tight tracking-wider text-white sm:text-xl md:text-2xl"
                  translate="no"
                >
                  {configured ? displayNumber : "— — — — — —"}
                </p>
                <div className="mt-2 flex flex-col gap-0.5 text-left sm:mt-4">
                  {bankName ? (
                    <p className="text-sm font-semibold text-white/95 sm:text-base">
                      {bankName}
                    </p>
                  ) : (
                    <p className="text-sm text-white/50 sm:text-base">
                      Atur bank di env
                    </p>
                  )}
                  {accountName ? (
                    <p className="text-xs text-white/75 sm:text-sm">{accountName}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#61b8ff] via-[#38a8ff] to-[#8fd0ff] p-4 shadow-2xl ring-1 ring-sky-300/35 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-6 md:p-8">
              <div className="pointer-events-none absolute -right-6 top-5 h-28 w-28 rounded-full bg-white/40 blur-sm" />

              <div className="absolute left-4 top-5 flex flex-col items-center sm:left-6 sm:top-7">
                <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-white/90 shadow-md sm:h-24 sm:w-24 sm:rounded-2xl">
                  <Image
                    src="/dana-logo-ref.png"
                    alt="Logo DANA"
                    width={96}
                    height={96}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </span>
              </div>

              <div className="relative mt-[5.5rem] flex flex-col justify-end sm:mt-32 md:mt-32">
                <p
                  className="mt-5 break-all text-left font-mono text-base leading-tight tracking-wider text-white sm:mt-2 sm:text-xl md:text-2xl"
                  translate="no"
                >
                  {danaOrBankDisplayNumber}
                </p>
                <div className="mt-2.5 flex flex-col gap-0.5 text-left sm:mt-5">
                  {danaName ? (
                    <p className="text-sm font-semibold text-white/95 sm:text-base">{danaName}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </button>
        <p className="mt-2 text-center text-xs text-slate-600">
          Ketuk untuk metode transfer lainnya.
        </p>

        <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={(e) => {
              addBurst(e.clientX, e.clientY);
              void copy();
            }}
            disabled={showDanaCard ? !danaConfigured && !configured : !configured}
            className="font-display touch-manipulation rounded-3xl bg-aira-navy px-6 py-3.5 text-base font-bold text-white shadow-md shadow-sky-900/20 transition hover:bg-aira-navySoft focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-aira-snow disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[200px] sm:py-3"
          >
            {copied ? "✓ Disalin" : `Salin ${activeLabel}`}
          </button>
          <p className="sr-only" role="status" aria-live="polite">
            {copied ? `${activeLabel} berhasil disalin.` : ""}
          </p>
        </div>
        {!configured ? (
          <p className="mt-3 text-center text-sm text-slate-500">
            Set{" "}
            <code className="rounded bg-white/60 px-1 py-0.5 text-xs">
              NEXT_PUBLIC_BANK_ACCOUNT_NUMBER
            </code>{" "}
            di <code className="rounded bg-white/60 px-1 py-0.5 text-xs">.env.local</code>
          </p>
        ) : null}
      </div>
    </section>
  );
}
