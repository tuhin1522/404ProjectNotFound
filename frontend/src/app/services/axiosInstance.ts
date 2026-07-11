import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const baseURL = apiUrl.endsWith("/api/v1") ? apiUrl : `${apiUrl}/api/v1`;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT Token automatically
axiosInstance.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (!config.url?.includes("/auth/")) {
    config.headers.Authorization = undefined;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        // Clear tokens immediately to prevent re-entrant checkAuth calls
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        // Only redirect if we're not already on an auth page
        const path = window.location.pathname;
        if (!path.startsWith("/login") && !path.startsWith("/signup")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;