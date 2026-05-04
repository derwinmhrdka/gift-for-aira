import Image from "next/image";

/** Latar section Lokasi — `public/bg_2.jpg`, wash sangat ringan agar foto terbaca. */
export default function LocationWash() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src="/bg_2.jpg"
        alt=""
        fill
        unoptimized
        className="select-none object-cover object-center scale-105 opacity-100 saturate-[0.95]"
        sizes="(max-width: 768px) 100vw, 896px"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/18 via-transparent to-sky-100/20"
        aria-hidden
      />
    </div>
  );
}
