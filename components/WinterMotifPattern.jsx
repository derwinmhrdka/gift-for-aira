/**
 * Lapisan dekoratif salju: motif tersebar (pseudo-acak), sangat transparan.
 * Server-safe — tidak pakai Math.random supaya konsisten SSR/CSR.
 */

const GLYPHS = [
  { kind: "emoji", char: "⛄" },
  { kind: "emoji", char: "❄" },
  { kind: "emoji", char: "❅" },
  { kind: "emoji", char: "❆" },
  { kind: "emoji", char: "🍬" },
  { kind: "emoji", char: "🍭" },
  { kind: "emoji", char: "✨" },
  { kind: "emoji", char: "☃️" },
  { kind: "emoji", char: "🤍" },
  { kind: "emoji", char: "⭐" },
  { kind: "crystal" },
];

const COUNT = 52;

function buildPlacements() {
  return Array.from({ length: COUNT }, (_, i) => {
    const g = GLYPHS[i % GLYPHS.length];
    const left = ((i * 47 + 13) % 91) + 2;
    const top = ((i * 61 + 7) % 86) + 5;
    const rotate = (i * 29 + 11) % 360;
    const sizeRem = 0.72 + (i % 8) * 0.16;
    let opacity = 0.032 + (i % 7) * 0.011;
    if (g.kind === "crystal") opacity = Math.min(0.11, opacity * 2.5);
    return { ...g, left, top, rotate, sizeRem, opacity, key: i };
  });
}

const PLACEMENTS = buildPlacements();

function CrystalGlyph({ sizeRem }) {
  const em = `${sizeRem * 1.15}rem`;
  return (
    <svg
      aria-hidden
      width={em}
      height={em}
      viewBox="0 0 40 40"
      className="text-sky-500"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round">
        <path d="M20 3v34M6 11l28 18M34 11L6 29" />
        <path d="M11 6l18 28M29 6L11 34" opacity="0.75" />
      </g>
    </svg>
  );
}

export default function WinterMotifPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] select-none overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_88%,transparent_100%)]"
      aria-hidden
    >
      {PLACEMENTS.map((p) => (
        <span
          key={p.key}
          className="absolute text-aira-navy"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
            opacity: p.opacity,
          }}
        >
          {p.kind === "emoji" ? (
            <span
              className="block leading-none"
              style={{
                fontSize: `${p.sizeRem}rem`,
                filter: "blur(0.4px)",
              }}
            >
              {p.char}
            </span>
          ) : (
            <CrystalGlyph sizeRem={p.sizeRem} />
          )}
        </span>
      ))}
    </div>
  );
}
