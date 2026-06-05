import { ImageResponse } from "next/og";

export const alt = "Mahardika's Baby Wishlist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(160deg, #F4FAFF 0%, #EAF3FB 45%, #C5DDF0 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#0F2744",
            marginBottom: 20,
          }}
        >
          Baby wishlist
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.05,
            color: "#0F2744",
            marginBottom: 24,
          }}
        >
          Mahardika&apos;s Baby
        </div>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.4,
            color: "#334155",
            maxWidth: 820,
          }}
        >
          Sweet picks for Mahardika&apos;s baby — curated with love.
        </div>
        <div
          style={{
            position: "absolute",
            right: 72,
            bottom: 72,
            fontSize: 120,
          }}
        >
          🎁
        </div>
      </div>
    ),
    { ...size },
  );
}
