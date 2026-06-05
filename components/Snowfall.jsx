/**
 * Salju jatuh halus — bentuk snowflake bervariasi, pelan, drift seperti angin.
 * Deterministik (tanpa Math.random) agar konsisten SSR/CSR.
 */

const VARIANTS = ["classic", "star", "crystal", "fern", "hex", "spark"];

const COUNT = 56;

function buildFlakes() {
  return Array.from({ length: COUNT }, (_, i) => {
    const left = ((i * 41 + 11) % 98) + 1;
    const variant = VARIANTS[i % VARIANTS.length];
    const size = 7 + (i % 6) * 1.4;
    const rotate = (i * 23 + 7) % 360;
    const duration = 12 + (i % 12) * 1.8;
    const delay = -((i * 2.37) % duration);
    const opacity = 0.5 + (i % 5) * 0.08;
    const sway = [
      ((i * 5 + 3) % 36) - 18,
      ((i * 9 + 1) % 52) - 26,
      ((i * 13 + 5) % 44) - 22,
      ((i * 7 + 2) % 60) - 30,
    ];
    return {
      key: i,
      left,
      variant,
      size,
      rotate,
      duration,
      delay,
      opacity,
      sway,
    };
  });
}

const FLAKES = buildFlakes();

function SnowflakeGlyph({ variant, size }) {
  const s = size;
  const stroke = "currentColor";
  const common = {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.35,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (variant) {
    case "star":
      return (
        <svg {...common}>
          <path d="M12 2v20M2 12h20M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
        </svg>
      );
    case "crystal":
      return (
        <svg {...common}>
          <path d="M12 2v20M4 8l16 8M20 8L4 16" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "fern":
      return (
        <svg {...common} strokeWidth={1.15}>
          <path d="M12 2v20" />
          <path d="M12 6l-3 2M12 6l3 2M12 10l-4 2.5M12 10l4 2.5M12 14l-3 2M12 14l3 2M12 18l-2 1.5M12 18l2 1.5" />
        </svg>
      );
    case "hex":
      return (
        <svg {...common}>
          <path d="M12 2l7 4v8l-7 4-7-4V6z" />
          <path d="M12 6v12M8.5 8l7 8M15.5 8l-7 8" opacity="0.85" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common} strokeWidth={1.2}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
          <path d="M6.8 6.8l2.8 2.8M14.4 14.4l2.8 2.8M17.2 6.8l-2.8 2.8M9.6 14.4l-2.8 2.8" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "classic":
    default:
      return (
        <svg {...common}>
          <path d="M12 2v20M2 12h20" />
          <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
          <path d="M12 5l-2.5 3h5L12 5zM12 19l-2.5-3h5L12 19zM5 12l3-2.5v5L5 12zM19 12l-3-2.5v5L19 12z" />
        </svg>
      );
  }
}

export default function Snowfall() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[15] overflow-hidden"
      aria-hidden
    >
      {FLAKES.map((f) => (
        <span
          key={f.key}
          className="aira-snowflake"
          style={{
            left: `${f.left}%`,
            "--flake-dur": `${f.duration}s`,
            "--flake-delay": `${f.delay}s`,
            "--flake-o": String(f.opacity),
            "--sx1": `${f.sway[0]}px`,
            "--sx2": `${f.sway[1]}px`,
            "--sx3": `${f.sway[2]}px`,
            "--sx4": `${f.sway[3]}px`,
          }}
        >
          <span
            className="aira-snowflake-glyph text-sky-300 drop-shadow-[0_0_3px_rgba(255,255,255,0.9)]"
            style={{
              width: `${f.size}px`,
              height: `${f.size}px`,
              transform: `rotate(${f.rotate}deg)`,
            }}
          >
            <SnowflakeGlyph variant={f.variant} size={f.size} />
          </span>
        </span>
      ))}
    </div>
  );
}
