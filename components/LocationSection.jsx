"use client";

import { useAddSparkBurst } from "@/components/SparkBurstProvider";
import { useCallback, useMemo, useState } from "react";

const MAP_QUERY =
  "Serpong Garden 2, Green Cove Blok D2/8, Kelurahan Suradita, Kecamatan Cisauk, Kabupaten Tangerang 15843, Indonesia";

/** Teks yang disalin ke clipboard (hard-coded). */
const FULL_ADDRESS = `Serpong Garden 2, Green Cove Blok D2/8
Kelurahan Suradita, Kecamatan Cisauk
Kabupaten Tangerang, 15843`;

export default function LocationSection() {
  const addBurst = useAddSparkBurst();
  const [copied, setCopied] = useState(false);

  const embedSrc = useMemo(
    () =>
      `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=16&output=embed`,
    [],
  );

  const mapsLink = useMemo(
    () =>
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`,
    [],
  );

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(FULL_ADDRESS);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <section className="w-full" aria-labelledby="location-heading">
      <div className="mx-auto max-w-lg px-0 text-center sm:max-w-xl lg:max-w-2xl">
        <h2
          id="location-heading"
          className="font-display text-2xl font-bold text-aira-navy sm:text-3xl"
        >
          Lokasi
        </h2>
        <p className="mt-2 text-base text-slate-600 sm:text-lg">
          Hore, Kirim hadiahnya kesini yaa! 🎁
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-lg lg:mt-10">
        <div className="overflow-hidden rounded-2xl border-2 border-white/70 shadow-xl shadow-sky-900/15 ring-1 ring-white/50 backdrop-blur-[2px]">
          <iframe
            title="Peta — Serpong Garden 2, Green Cove"
            src={embedSrc}
            className="block h-[160px] w-full border-0 sm:h-[180px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

          <div className="border-t border-white/55 bg-white/45 px-5 py-5 backdrop-blur-md sm:px-6 sm:py-6">
            <address className="space-y-1.5 not-italic font-display text-base font-medium leading-relaxed text-aira-navy sm:text-[1.05rem]">
              <p>Serpong Garden 2, Green Cove Blok D2/8</p>
              <p>Kelurahan Suradita, Kecamatan Cisauk</p>
              <p>Kabupaten Tangerang, 15843</p>
            </address>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-sm font-semibold text-sky-800 underline-offset-2 sm:text-left hover:text-aira-navy hover:underline"
              >
                Buka di Google Maps
              </a>
              <button
                type="button"
                onClick={(e) => {
                  addBurst(e.clientX, e.clientY);
                  void copy();
                }}
                className="font-display touch-manipulation rounded-2xl bg-aira-navy px-5 py-3 text-sm font-bold text-white shadow-md shadow-sky-900/15 transition hover:bg-aira-navySoft focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-aira-snow sm:shrink-0"
              >
                {copied ? "✓ Disalin" : "Salin alamat"}
              </button>
              <p className="sr-only" role="status" aria-live="polite">
                {copied ? "Alamat berhasil disalin." : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
