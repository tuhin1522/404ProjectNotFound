import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile } from "../types/auth";
import { authService } from "../services/authService";

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Prevents repeated /me calls after a failed auth check
  authChecked: boolean;
  setUser: (user: UserProfile | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authChecked: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      checkAuth: async () => {
        // Guard: only run once per session unless explicitly triggered
        if (get().isLoading) return;

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        // No token — don't even try
        if (!token) {
          set({ user: null, isAuthenticated: false, authChecked: true, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false, authChecked: true });
        } catch {
          // Token is invalid/expired — clear it immediately to prevent loops
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          set({ user: null, isAuthenticated: false, isLoading: false, authChecked: true });
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        set({ user: null, isAuthenticated: false, authChecked: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
