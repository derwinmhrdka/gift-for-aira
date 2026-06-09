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

function getParticipationSecret() {
  return (
    process.env.PARTICIPATION_HASH_SECRET?.trim() ||
    process.env.AIRTABLE_API_KEY?.trim() ||
    "gift-for-aira-participation"
  );
}

export function hashVisitorId(visitorId) {
  const raw = String(visitorId ?? "").trim();
  if (!raw || raw.length > 128) return "";

  return createHash("sha256")
    .update(`${getParticipationSecret()}:${raw}`)
    .digest("hex");
}

export function getClientIp(request) {
  const forwarded = request?.headers?.get?.("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request?.headers?.get?.("x-real-ip")?.trim();
  if (realIp) return realIp;

  return request?.headers?.get?.("cf-connecting-ip")?.trim() || "";
}

export function hashIpAddress(ip) {
  const raw = String(ip ?? "").trim();
  if (!raw) return "";

  return createHash("sha256")
    .update(`${getParticipationSecret()}:ip:${raw}`)
    .digest("hex");
}

export function getParticipationIdentity(request, visitorId) {
  if (isAdminModeServer(request)) {
    return { visitorHash: null, ipHash: null };
  }

  const visitorHash = requireVisitorHash(visitorId, request);
  const ipHash = hashIpAddress(getClientIp(request)) || null;
  return { visitorHash, ipHash };
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

export const PARTICIPATION_BLOCK_MESSAGES = {
  fingerprint: "Kamu sudah pernah ikut game ini.",
  ip: "Jaringan ini sudah dipakai main dari browser lain.",
};

export function participationBlockMessage(reason) {
  return (
    PARTICIPATION_BLOCK_MESSAGES[reason] ||
    PARTICIPATION_BLOCK_MESSAGES.fingerprint
  );
}
