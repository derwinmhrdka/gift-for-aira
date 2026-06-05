/**
 * Salju jatuh halus — kecil, tipis, pelan, dengan drift seperti tertiup angin.
 * Deterministik (tanpa Math.random) agar konsisten SSR/CSR.
 */

const COUNT = 56;

function buildFlakes() {
  return Array.from({ length: COUNT }, (_, i) => {
    const left = ((i * 41 + 11) % 98) + 1;
    const thin = i % 3 !== 0;
    const width = thin ? 2 + (i % 3) * 0.6 : 3 + (i % 4) * 0.5;
    const height = thin ? 5 + (i % 5) * 1.2 : width;
    const rotate = (i * 23 + 7) % 180;
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
      width,
      height,
      rotate,
      duration,
      delay,
      opacity,
      sway,
    };
  });
}

const FLAKES = buildFlakes();

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
            className="aira-snowflake-dot"
            style={{
              width: `${f.width}px`,
              height: `${f.height}px`,
              transform: `rotate(${f.rotate}deg)`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
