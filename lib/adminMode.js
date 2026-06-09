export const ADMIN_CLIENT_KEY = "aira-admin-active";

export function readClientAdminActive() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ADMIN_CLIENT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setClientAdminActive(active) {
  if (typeof window === "undefined") return;
  try {
    if (active) localStorage.setItem(ADMIN_CLIENT_KEY, "1");
    else localStorage.removeItem(ADMIN_CLIENT_KEY);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(
    new CustomEvent("aira-admin-change", { detail: { active: Boolean(active) } }),
  );
}
