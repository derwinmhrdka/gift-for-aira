import SectionBackground from "@/components/SectionBackground";

/**
 * Aksen gambar safari sangat halus di belakang header atau footer.
 * `anchor`: "top" = bagian atas gambar (langit), "bottom" = hewan di bawah.
 */
export default function SafariWash({ anchor }) {
  return (
    <SectionBackground
      src="/bg.jpg"
      objectPosition={anchor === "top" ? "object-top" : "object-bottom"}
      gradient={anchor === "top" ? "top" : "bottom"}
      scaleClass="scale-110"
      opacityClass="opacity-[0.42] saturate-[0.92] sm:opacity-[0.52]"
    />
  );
}
