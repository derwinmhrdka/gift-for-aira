"use client";

import FingerprintJS from "@fingerprintjs/fingerprintjs";

const STORAGE_KEY = "aira-visitor-id";

let cachedVisitorId = null;
let loadPromise = null;

/**
 * Stable browser fingerprint id (FingerprintJS). Cached per tab session.
 */
export async function getVisitorId() {
  if (typeof window === "undefined") return "";

  if (cachedVisitorId) return cachedVisitorId;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedVisitorId = stored;
      return stored;
    }
  } catch {
    /* private mode */
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      const agent = await FingerprintJS.load();
      const { visitorId } = await agent.get();
      cachedVisitorId = visitorId;
      try {
        sessionStorage.setItem(STORAGE_KEY, visitorId);
      } catch {
        /* ignore */
      }
      return visitorId;
    })();
  }

  return loadPromise;
}
