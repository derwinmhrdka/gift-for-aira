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
  return parseAdminFlag(process.env.NEXT_PUBLIC_ADMIN_MODE);
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

export function canPlayGame(gameId) {
  if (isAdminMode()) return true;
  return !hasParticipatedIn(gameId);
}

export function getParticipationState() {
  return {
    card: canPlayGame("card"),
    doorprize: canPlayGame("doorprize"),
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
