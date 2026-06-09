import { readClientAdminActive } from "@/lib/adminMode";
import { getVisitorId } from "@/lib/visitorId";

const STORAGE_KEYS = {
  card: "aira-game-card-participated",
  doorprize: "aira-game-doorprize-participated",
  roulette: "aira-game-roulette-used",
};

function parseAdminFlag(value) {
  const normalized = String(value ?? "FALSE")
    .trim()
    .toUpperCase();
  return normalized === "TRUE" || normalized === "1" || normalized === "YES";
}

export function isAdminMode() {
  if (parseAdminFlag(process.env.NEXT_PUBLIC_ADMIN_MODE)) return true;
  return readClientAdminActive();
}

function getAdminAvailability() {
  return {
    card: true,
    doorprize: true,
    roulette: true,
    nameGuess: true,
  };
}

export function hasParticipatedIn(gameId) {
  if (isAdminMode()) return false;
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEYS[gameId]) === "1";
  } catch {
    return false;
  }
}

export function markParticipatedIn(gameId) {
  if (isAdminMode()) return;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS[gameId], "1");
  } catch {
    /* ignore quota / private mode */
  }
}

function syncLocalStorageFromServer(data) {
  if (typeof window === "undefined" || !data) return;
  if (data.card === false) markParticipatedIn("card");
  if (data.doorprize === false) markParticipatedIn("doorprize");
  if (data.roulette === false) markParticipatedIn("roulette");
}

export async function fetchParticipationFromServer() {
  if (isAdminMode()) return getAdminAvailability();

  try {
    const visitorId = await getVisitorId();
    if (!visitorId) return getParticipationState();

    const res = await fetch(
      `/api/participation?visitorId=${encodeURIComponent(visitorId)}`,
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return getParticipationState();

    syncLocalStorageFromServer(data);
    return {
      card: data.card !== false,
      doorprize: data.doorprize !== false,
      roulette: data.roulette !== false,
      nameGuess: data.nameGuess !== false,
    };
  } catch {
    return getParticipationState();
  }
}

export async function recordCardParticipation(wishId) {
  if (isAdminMode()) {
    markParticipatedIn("card");
    return;
  }

  const visitorId = await getVisitorId();
  const res = await fetch("/api/participation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitorId,
      game: "card",
      wishId: typeof wishId === "string" ? wishId : "",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Gagal menyimpan partisipasi mini game.");
  }
  markParticipatedIn("card");
}

export function canPlayGame(gameId) {
  if (isAdminMode()) return true;
  return !hasParticipatedIn(gameId);
}

export function getParticipationState() {
  return {
    card: canPlayGame("card"),
    doorprize: canPlayGame("doorprize"),
    roulette: canOpenRoulette(),
    nameGuess: true,
  };
}

export function hasAnyGameAvailable() {
  const state = getParticipationState();
  return state.card || state.doorprize;
}

export function hasCompletedAllGames() {
  return !hasAnyGameAvailable() && !isAdminMode();
}

export function hasUsedRoulette() {
  if (isAdminMode()) return false;
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEYS.roulette) === "1";
  } catch {
    return false;
  }
}

export function markRouletteUsed() {
  if (isAdminMode()) return;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.roulette, "1");
  } catch {
    /* ignore */
  }
}

export function canOpenRoulette() {
  if (isAdminMode()) return true;
  return !hasUsedRoulette();
}

export async function fetchRouletteAvailability() {
  const state = await fetchParticipationFromServer();
  if (state.roulette === false) markRouletteUsed();
  return state.roulette !== false;
}
