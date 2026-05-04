import Image from "next/image";

/**
 * Aksen gambar safari sangat halus di belakang header atau footer.
 * `anchor`: "top" = bagian atas gambar (langit), "bottom" = hewan di bawah.
 */
export default function SafariWash({ anchor }) {
  const objectPos = anchor === "top" ? "object-top" : "object-bottom";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src="/bg.jpg"
        alt=""
        fill
        className={`select-none object-cover ${objectPos} scale-110 opacity-[0.42] saturate-[0.92] sm:opacity-[0.52]`}
        sizes="(max-width: 768px) 100vw, 896px"
      />
      {anchor === "top" ? (
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/55 via-aira-iceLight/40 to-transparent"
          aria-hidden
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-t from-aira-frost/70 via-white/30 to-transparent"
          aria-hidden
        />
      )}
    </div>
  );
}
