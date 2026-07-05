"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/app/store/useAuthStore";

/**
 * AuthInitializer — a client component that runs once on mount
 * and hydrates the Zustand store if a JWT token exists in localStorage.
 * Placed inside RootLayout so all pages benefit from auth state.
 */
export default function AuthInitializer() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isAuthenticated) {
      checkAuth();
    }
  }, []);

  return null;
}
