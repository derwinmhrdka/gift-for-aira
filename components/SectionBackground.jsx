import Image from "next/image";

const GRADIENTS = {
  soft: "from-white/50 via-white/30 to-aira-iceLight/40",
  top: "from-white/55 via-aira-iceLight/40 to-transparent",
  bottom: "from-aira-frost/70 via-white/30 to-transparent",
  location: "from-white/18 via-transparent to-sky-100/20",
  wishlist: "from-white/45 via-aira-snow/25 to-white/35",
};

export default function SectionBackground({
  src,
  objectPosition = "object-center",
  gradient = "soft",
  opacityClass = "opacity-[0.42] saturate-[0.92] sm:opacity-[0.5]",
  scaleClass = "scale-105",
}) {
  const gradientClass =
    GRADIENTS[gradient] ?? GRADIENTS.soft;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        className={`select-none object-cover ${objectPosition} ${scaleClass} ${opacityClass}`}
        sizes="(max-width: 768px) 100vw, 1280px"
      />
      <div
        className={`absolute inset-0 bg-gradient-to-b ${gradientClass}`}
        aria-hidden
      />
    </div>
  );
}
