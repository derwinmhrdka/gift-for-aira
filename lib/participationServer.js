import {
  getAdminCookieFromRequest,
  verifyAdminCookieValue,
} from "@/lib/adminAuth";
import { createHash } from "crypto";

export const PARTICIPATION_GAMES = {
  card: "card",
  doorprize: "doorprize",
  roulette: "roulette",
  nameGuess: "name_guess",
};

function parseAdminFlag(value) {
  const normalized = String(value ?? "FALSE")
    .trim()
    .toUpperCase();
  return normalized === "TRUE" || normalized === "1" || normalized === "YES";
}

export function isAdminModeServer(request) {
  if (
    parseAdminFlag(process.env.ADMIN_MODE ?? process.env.NEXT_PUBLIC_ADMIN_MODE)
  ) {
    return true;
  }

  if (!request) return false;
  return verifyAdminCookieValue(getAdminCookieFromRequest(request));
}

export function hashVisitorId(visitorId) {
  const raw = String(visitorId ?? "").trim();
  if (!raw || raw.length > 128) return "";

  const secret =
    process.env.PARTICIPATION_HASH_SECRET?.trim() ||
    process.env.AIRTABLE_API_KEY?.trim() ||
    "gift-for-aira-participation";

  return createHash("sha256").update(`${secret}:${raw}`).digest("hex");
}

export function parseVisitorId(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw.length > 128) return "";
  return raw;
}

export function requireVisitorHash(visitorId, request) {
  if (isAdminModeServer(request)) return null;

  const parsed = parseVisitorId(visitorId);
  if (!parsed) {
    throw new ParticipationError("Identitas perangkat tidak valid.", 400);
  }

  const hash = hashVisitorId(parsed);
  if (!hash) {
    throw new ParticipationError("Identitas perangkat tidak valid.", 400);
  }

  return hash;
}

export class ParticipationError extends Error {
  constructor(message, status = 403) {
    super(message);
    this.name = "ParticipationError";
    this.status = status;
  }
}
