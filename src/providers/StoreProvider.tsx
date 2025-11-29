"use client";

import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/stores";

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  useEffect(() => {
    // Hydrate auth state from localStorage on mount
    hydrateAuth();
  }, [hydrateAuth]);

  return <>{children}</>;
}
