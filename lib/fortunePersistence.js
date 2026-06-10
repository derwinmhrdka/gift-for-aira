import { LUCK_TIERS, rollFortune } from "@/lib/fortuneData";

const STORAGE_PREFIX = "aira-fortune";

export function getFortuneDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function storageKey(visitorId, categoryId, dateKey) {
  const id = visitorId?.trim() || "anon";
  return `${STORAGE_PREFIX}:${id}:${categoryId}:${dateKey}`;
}

function isValidStoredFortune(parsed, categoryId, dateKey) {
  if (!parsed || typeof parsed !== "object") return false;
  if (parsed.categoryId !== categoryId || parsed.dateKey !== dateKey) return false;
  if (!LUCK_TIERS[parsed.tierKey]) return false;
  const percent = Number(parsed.percent);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) return false;
  if (typeof parsed.text !== "string" || !parsed.text.trim()) return false;
  return true;
}

export function readStoredFortune(
  visitorId,
  categoryId,
  dateKey = getFortuneDateKey(),
) {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(
      storageKey(visitorId, categoryId, dateKey),
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidStoredFortune(parsed, categoryId, dateKey)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredFortune(
  visitorId,
  result,
  categoryId,
  dateKey = getFortuneDateKey(),
) {
  if (typeof window === "undefined" || !result) return;

  try {
    localStorage.setItem(
      storageKey(visitorId, categoryId, dateKey),
      JSON.stringify({
        categoryId,
        dateKey,
        tierKey: result.tierKey,
        percent: result.percent,
        text: result.text,
      }),
    );
  } catch {
    /* private mode / quota */
  }
}

export function fortuneFromStored(stored) {
  if (!stored) return null;
  const tier = LUCK_TIERS[stored.tierKey];
  if (!tier) return null;

  return {
    tierKey: stored.tierKey,
    tier,
    percent: Number(stored.percent),
    text: stored.text,
    cached: true,
  };
}

export async function resolveFortuneForVisitor(
  categoryId,
  { isAdmin = false, visitorId = "" } = {},
) {
  const dateKey = getFortuneDateKey();

  if (!isAdmin) {
    const stored = readStoredFortune(visitorId, categoryId, dateKey);
    const restored = fortuneFromStored(stored);
    if (restored) return restored;
  }

  const rolled = rollFortune(categoryId);

  if (!isAdmin) {
    writeStoredFortune(visitorId, rolled, categoryId, dateKey);
  }

  return { ...rolled, cached: false };
}
