"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/useAuthStore";

/**
 * useRequireAuth — redirect to /login if the user is not authenticated.
 * Use this hook at the top of any protected page component.
 *
 * Returns the current authenticated user once resolved.
 */
export function useRequireAuth() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth, router]);

  return { user, isAuthenticated, isLoading };
}
