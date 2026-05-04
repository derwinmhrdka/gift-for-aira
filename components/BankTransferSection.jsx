"use client";

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

  const [copied, setCopied] = useState(false);

  const displayNumber = useMemo(
    () => formatAccountDisplay(rawNumber),
    [rawNumber],
  );

  const copy = useCallback(async () => {
    if (!rawNumber) return;
    try {
      await navigator.clipboard.writeText(rawNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [rawNumber]);

  const configured = Boolean(rawNumber);

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
          Salin nomor rekening untuk transfer hadiah.
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-md px-0 sm:mt-10 sm:max-w-lg">
        <div className="relative aspect-[85.6/53.98] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-aira-navy via-aira-navySoft to-aira-navy p-5 shadow-2xl ring-1 ring-sky-200/25 sm:p-6 md:p-8">
          {/* Decorative “chip” orbs — salju / es */}
          <div
            className="pointer-events-none absolute -right-4 top-6 flex items-center gap-0 sm:top-8 sm:right-2"
            aria-hidden
          >
            <span className="h-14 w-14 rounded-full bg-sky-300/90 opacity-95 sm:h-16 sm:w-16" />
            <span className="-ml-7 h-14 w-14 rounded-full bg-white/90 opacity-95 mix-blend-screen sm:-ml-8 sm:h-16 sm:w-16" />
          </div>

          <div className="pointer-events-none absolute left-5 top-5 h-9 w-12 rounded-md bg-gradient-to-br from-sky-100/95 to-sky-400/85 shadow-inner sm:left-6 sm:top-6 sm:h-10 sm:w-14" />

          <div className="relative mt-14 flex flex-col justify-end sm:mt-16 md:mt-20">
            <p className="text-left text-[10px] font-medium uppercase tracking-[0.2em] text-white/60 sm:text-xs">
              Nomor rekening
            </p>
            <p
              className="mt-2 break-all text-left font-mono text-lg leading-tight tracking-wider text-white sm:text-xl md:text-2xl"
              translate="no"
            >
              {configured ? displayNumber : "— — — — — —"}
            </p>
            <div className="mt-4 flex flex-col gap-0.5 text-left sm:mt-5">
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

        <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={(e) => {
              addBurst(e.clientX, e.clientY);
              void copy();
            }}
            disabled={!configured}
            className="font-display touch-manipulation rounded-3xl bg-aira-navy px-6 py-3.5 text-base font-bold text-white shadow-md shadow-sky-900/20 transition hover:bg-aira-navySoft focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-aira-snow disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[200px] sm:py-3"
          >
            {copied ? "✓ Disalin" : "Salin nomor rekening"}
          </button>
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
