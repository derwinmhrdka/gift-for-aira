import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "aira-admin";

export function getAdminAccessKey() {
  return process.env.ADMIN_ACCESS_KEY?.trim() || "";
}

export function isAdminKeyConfigured() {
  return Boolean(getAdminAccessKey());
}

export function verifyAdminKey(key) {
  const expected = getAdminAccessKey();
  if (!expected || key === null || key === undefined) return false;

  const provided = Buffer.from(String(key).trim());
  const target = Buffer.from(expected);
  if (provided.length !== target.length) return false;

  try {
    return timingSafeEqual(provided, target);
  } catch {
    return false;
  }
}

export function createAdminCookieValue() {
  const secret = getAdminAccessKey();
  if (!secret) return "";
  return createHmac("sha256", secret)
    .update("aira-admin-session")
    .digest("hex");
}

export function verifyAdminCookieValue(value) {
  const expected = createAdminCookieValue();
  if (!expected || !value) return false;

  try {
    const provided = Buffer.from(String(value));
    const target = Buffer.from(expected);
    if (provided.length !== target.length) return false;
    return timingSafeEqual(provided, target);
  } catch {
    return false;
  }
}

export function getAdminCookieFromRequest(request) {
  return request?.cookies?.get(ADMIN_COOKIE_NAME)?.value ?? "";
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
