"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/useAuthStore";

/**
 * useRequireAuth — redirects unauthenticated users to /login.
 *
 * Strategy:
 * - If no token exists → redirect immediately, do NOT call checkAuth.
 * - If a token exists but auth hasn't been checked yet → call checkAuth ONCE.
 * - After check: if still not authenticated → redirect.
 * - Never creates a re-render loop.
 */
export function useRequireAuth() {
  const { user, isAuthenticated, isLoading, authChecked, checkAuth } = useAuthStore();
  const router = useRouter();
  const initiated = useRef(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // No token at all → go to login immediately
    if (!token) {
      router.replace("/login");
      return;
    }

    // Token exists but we haven't verified it yet → trigger ONE check
    if (!authChecked && !isLoading && !initiated.current) {
      initiated.current = true;
      checkAuth();
    }
  }, [authChecked, isLoading, checkAuth, router]);

  // After auth check completes: if still not authenticated, redirect
  useEffect(() => {
    if (authChecked && !isAuthenticated && !isLoading) {
      router.replace("/login");
    }
  }, [authChecked, isAuthenticated, isLoading, router]);

  return { user, isAuthenticated, isLoading: isLoading || !authChecked };
}
