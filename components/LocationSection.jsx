"use client";

import { useAddSparkBurst } from "@/components/SparkBurstProvider";
import { MapPin, Snowflake } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const MAP_QUERY =
  "Serpong Garden 2, Green Cove Blok D2/8, Kelurahan Suradita, Kecamatan Cisauk, Kabupaten Tangerang 15843, Indonesia";

/** Teks yang disalin ke clipboard (hard-coded). */
const FULL_ADDRESS = `Serpong Garden 2, Green Cove Blok D2/8
Kelurahan Suradita, Kecamatan Cisauk
Kabupaten Tangerang, 15843`;

function SnowyMapIcon() {
  return (
    <div
      className="relative flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100/95 via-white to-aira-iceLight shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-sky-200/70 sm:h-28 sm:w-28"
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.9),transparent_65%)]" />
      <Snowflake
        className="absolute left-2 top-2 h-3 w-3 text-sky-300/80 sm:h-3.5 sm:w-3.5"
        strokeWidth={1.5}
      />
      <Snowflake
        className="absolute bottom-2.5 right-2 h-3.5 w-3.5 text-sky-300/70 sm:h-4 sm:w-4"
        strokeWidth={1.5}
      />
      <MapPin
        className="relative z-10 h-8 w-8 text-sky-600 sm:h-10 sm:w-10"
        strokeWidth={2.25}
        fill="currentColor"
        fillOpacity={0.15}
      />
    </div>
  );
}

export default function LocationSection() {
  const addBurst = useAddSparkBurst();
  const [copied, setCopied] = useState(false);

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
        <div className="overflow-hidden rounded-2xl border-2 border-white/70 bg-white/45 px-4 py-4 shadow-xl shadow-sky-900/15 ring-1 ring-white/50 backdrop-blur-md sm:px-5 sm:py-5">
          <div className="flex items-start gap-3.5 sm:items-center sm:gap-5">
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-2xl transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-aira-snow"
              aria-label="Buka lokasi di Google Maps"
            >
              <SnowyMapIcon />
            </a>

            <div className="min-w-0 flex-1 text-left">
              <address className="not-italic font-display text-aira-navy">
                <p className="text-xs font-medium leading-relaxed sm:text-sm">
                  Serpong Garden 2, Green Cove Blok D2/8
                </p>
                <p className="mt-0.5 text-[0.65rem] font-medium leading-relaxed text-slate-600 sm:text-xs">
                  Kelurahan Suradita, Kecamatan Cisauk
                </p>
                <p className="text-[0.65rem] font-medium leading-relaxed text-slate-600 sm:text-xs">
                  Kabupaten Tangerang, 15843
                </p>
              </address>

              <div className="mt-3 flex flex-col gap-2 sm:mt-3.5 sm:flex-row sm:items-center sm:gap-3">
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-sky-800 underline-offset-2 hover:text-aira-navy hover:underline sm:text-sm"
                >
                  Buka di Google Maps
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    addBurst(e.clientX, e.clientY);
                    void copy();
                  }}
                  className="font-display touch-manipulation w-fit rounded-xl bg-aira-navy px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-sky-900/15 transition hover:bg-aira-navySoft focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-aira-snow sm:text-sm"
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
      </div>
    </section>
  );
}
