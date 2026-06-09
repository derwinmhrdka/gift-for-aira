"use client";

import { readClientAdminActive, setClientAdminActive } from "@/lib/adminMode";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

function parseEnvAdmin() {
  const normalized = String(process.env.NEXT_PUBLIC_ADMIN_MODE ?? "FALSE")
    .trim()
    .toUpperCase();
  return normalized === "TRUE" || normalized === "1" || normalized === "YES";
}

const AdminModeContext = createContext({
  isAdmin: false,
  refreshAdminStatus: async () => {},
});

export function AdminModeProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshAdminStatus = useCallback(async () => {
    if (parseEnvAdmin()) {
      setIsAdmin(true);
      return;
    }

    try {
      const res = await fetch("/api/admin/status", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      const active = data.active === true;
      setClientAdminActive(active);
      setIsAdmin(active);
    } catch {
      setIsAdmin(readClientAdminActive());
    }
  }, []);

  useEffect(() => {
    refreshAdminStatus();

    function onAdminChange(event) {
      if (parseEnvAdmin()) {
        setIsAdmin(true);
        return;
      }
      setIsAdmin(event.detail?.active === true);
    }

    window.addEventListener("aira-admin-change", onAdminChange);
    return () => window.removeEventListener("aira-admin-change", onAdminChange);
  }, [refreshAdminStatus]);

  return (
    <AdminModeContext.Provider value={{ isAdmin, refreshAdminStatus }}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  return useContext(AdminModeContext).isAdmin;
}

export function useAdminModeActions() {
  const { refreshAdminStatus } = useContext(AdminModeContext);
  return { refreshAdminStatus };
}
