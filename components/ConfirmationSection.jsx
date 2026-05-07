"use client";

const DEFAULT_MESSAGE = "Halo bun, apakah produk masih ada?";

function sanitizeWaNumber(raw) {
  if (!raw) return "";
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

function isValidWaNumber(n) {
  return /^62\d{8,15}$/.test(n);
}

export default function ConfirmationSection() {
  const normalizedWa = sanitizeWaNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "");
  const waNumber = isValidWaNumber(normalizedWa) ? normalizedWa : "";
  const message = DEFAULT_MESSAGE;
  const whatsappUrl =
    waNumber && message
      ? `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
      : "";

  return (
    <section className="w-full" aria-labelledby="confirmation-heading">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/55 bg-white/70 px-5 py-6 text-center shadow-md shadow-sky-200/25 backdrop-blur-md sm:px-6 sm:py-7">
        <h2
          id="confirmation-heading"
          className="font-display text-2xl font-bold text-aira-navy sm:text-3xl"
        >
          Ucapan / Konfirmasi
        </h2>
        <p className="mt-2 text-base text-slate-600 sm:text-lg">
          Mau ucapin sesuatu ke aku? Chat via mamanya dulu aja ya 😊.
        </p>

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display mt-5 inline-flex rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
          >
            Chat via WhatsApp
          </a>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Set{" "}
            <code className="rounded bg-white/60 px-1 py-0.5 text-xs">
              NEXT_PUBLIC_WHATSAPP_NUMBER
            </code>{" "}
            di <code className="rounded bg-white/60 px-1 py-0.5 text-xs">.env.local</code>
          </p>
        )}
      </div>
    </section>
  );
}
