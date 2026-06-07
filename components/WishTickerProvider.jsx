"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const WishTickerContext = createContext(null);

function parseTickerDate(value) {
  if (!value) return 0;
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortTickerItems(items) {
  return [...items].sort(
    (a, b) => parseTickerDate(b.createdDate) - parseTickerDate(a.createdDate),
  );
}

export function WishTickerProvider({ initialWishes, initialWinners, children }) {
  const [wishes, setWishes] = useState(initialWishes ?? []);
  const [winners, setWinners] = useState(initialWinners ?? []);

  const addWish = useCallback((wish) => {
    const name = String(wish?.name ?? "").trim();
    const message = String(wish?.message ?? "").trim();
    if (!name || !message) return;

    setWishes((prev) =>
      sortTickerItems([
        {
          id: `local-${Date.now()}`,
          name,
          message,
          createdDate: new Date().toISOString(),
        },
        ...prev,
      ]),
    );
  }, []);

  const addWinner = useCallback((entry) => {
    const winnerName = String(entry?.winnerName ?? "").trim();
    const prizeName = String(entry?.prizeName ?? "").trim();
    if (!winnerName || !prizeName) return;

    const id = entry?.id ? String(entry.id) : `local-w-${Date.now()}`;
    const createdDate = entry?.createdDate ?? new Date().toISOString();

    setWinners((prev) => {
      if (prev.some((item) => item.id === id)) return prev;
      return sortTickerItems([
        { id, winnerName, prizeName, createdDate },
        ...prev,
      ]);
    });
  }, []);

  const tickerItems = useMemo(
    () =>
      sortTickerItems([
        ...winners.map((item) => ({ ...item, kind: "winner" })),
        ...wishes.map((item) => ({ ...item, kind: "wish" })),
      ]),
    [winners, wishes],
  );

  const value = useMemo(
    () => ({ wishes, winners, tickerItems, addWish, addWinner }),
    [wishes, winners, tickerItems, addWish, addWinner],
  );

  return (
    <WishTickerContext.Provider value={value}>
      {children}
    </WishTickerContext.Provider>
  );
}

export function useWishTicker() {
  const ctx = useContext(WishTickerContext);
  if (!ctx) {
    throw new Error("useWishTicker must be used within WishTickerProvider");
  }
  return ctx;
}
