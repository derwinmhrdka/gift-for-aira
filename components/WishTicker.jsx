"use client";

import { useWishTicker } from "@/components/WishTickerProvider";

function WishBubble({ name, message }) {
  const text = String(message).replace(/\s+/g, " ").trim();

  return (
    <span className="wish-ticker__bubble">
      <span className="wish-ticker__bubble-emoji" aria-hidden="true">
        ❄️
      </span>
      <span className="wish-ticker__bubble-name">{name}</span>
      <span className="wish-ticker__bubble-sep" aria-hidden="true">
        ·
      </span>
      <span className="wish-ticker__bubble-msg">{text}</span>
    </span>
  );
}

function WinnerBubble({ winnerName, prizeName }) {
  return (
    <span className="wish-ticker__bubble wish-ticker__bubble--gold">
      <span className="wish-ticker__bubble-emoji" aria-hidden="true">
        🏆
      </span>
      <span className="wish-ticker__bubble-name">{winnerName}</span>
      <span className="wish-ticker__bubble-sep" aria-hidden="true">
        ·
      </span>
      <span className="wish-ticker__bubble-msg">
        menang {prizeName}! 🎁
      </span>
    </span>
  );
}

function TickerItem({ item }) {
  if (item.kind === "winner") {
    return (
      <WinnerBubble
        winnerName={item.winnerName}
        prizeName={item.prizeName}
      />
    );
  }

  return <WishBubble name={item.name} message={item.message} />;
}

function TickerChunk({ items, duplicate }) {
  return (
    <span className="wish-ticker__chunk" aria-hidden={duplicate || undefined}>
      {items.map((item) => (
        <TickerItem
          key={`${item.id}${duplicate ? "-dup" : ""}`}
          item={item}
        />
      ))}
    </span>
  );
}

export default function WishTicker() {
  const { tickerItems } = useWishTicker();
  if (!tickerItems?.length) return null;

  const charCount = tickerItems.reduce((n, item) => {
    if (item.kind === "winner") {
      return (
        n +
        String(item.winnerName).length +
        String(item.prizeName).length +
        12
      );
    }
    return n + String(item.name).length + String(item.message).length;
  }, 0);
  const duration = Math.max(
    24,
    Math.min(52, tickerItems.length * 6.5 + charCount * 0.06),
  );

  return (
    <>
      <div
        className="wish-ticker fixed inset-x-0 top-0 z-[40] overflow-hidden border-b border-sky-200/70 bg-gradient-to-r from-sky-100/95 via-white/92 to-aira-iceLight/95 shadow-[0_4px_20px_rgba(147,197,253,0.25)] backdrop-blur-md"
        aria-label="Ucapan tamu dan pemenang hadiah"
      >
        <div className="wish-ticker__shimmer pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative flex items-stretch">
          <div className="wish-ticker__badge flex shrink-0 items-center gap-1.5 border-r border-sky-200/60 bg-white/55 px-2.5 py-2 sm:gap-2 sm:px-3">
            <img
              src="/snowman-90.gif"
              alt=""
              width={32}
              height={32}
              className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              decoding="async"
            />
            <span className="font-display hidden text-xs font-extrabold tracking-wide text-aira-navy sm:inline sm:text-sm">
              Best wishes!
            </span>
            <span className="font-display text-sm sm:hidden" aria-hidden="true">
              ⛄
            </span>
          </div>

          <div className="min-w-0 flex-1 overflow-hidden py-2 sm:py-2.5">
            <div
              className="wish-ticker__track"
              style={{ animationDuration: `${duration}s` }}
            >
              <TickerChunk items={tickerItems} />
              <TickerChunk items={tickerItems} duplicate />
            </div>
          </div>
        </div>
      </div>
      <div className="h-11 shrink-0 sm:h-12" aria-hidden="true" />
    </>
  );
}
