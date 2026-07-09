import axiosInstance from "@/app/services/axiosInstance";
import { LoginCredentials, RegisterData, AuthResponse, UserProfile } from "@/app/types/auth";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/users/login/", credentials);
    if (response.data.access) {
      localStorage.setItem("token", response.data.access);
      if (response.data.refresh) {
        localStorage.setItem("refreshToken", response.data.refresh);
      }
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<UserProfile> => {
    const response = await axiosInstance.post<UserProfile>("/users/register/", data);
    return response.data;
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get<UserProfile>("/users/me/");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  isLoggedIn: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  },
};


