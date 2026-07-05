"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/app/store/useAuthStore";

/**
 * AuthInitializer — runs checkAuth exactly ONCE on app load
 * if a token exists in localStorage and auth hasn't been checked yet.
 * Does NOT run in a reactive loop. Uses a ref guard to prevent StrictMode double-invoke.
 */
export default function AuthInitializer() {
  const { isAuthenticated, authChecked, isLoading, checkAuth } = useAuthStore();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Only call checkAuth if we haven't checked yet and we're not already loading
    if (!authChecked && !isLoading) {
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
