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
  async (error) => {
    const originalRequest = error.config;

    if (typeof window !== "undefined") {
      const status = error?.response?.status;

      // Only attempt refresh on 401, not 403, and only if we haven't already retried
      if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/") && !originalRequest.url?.includes("/users/login/")) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("No refresh token");
          
          // Request new token
          const res = await axios.post(`${baseURL}/users/login/refresh/`, { refresh: refreshToken });
          
          const newAuthToken = res.data.access;
          localStorage.setItem("token", newAuthToken);
          // Update refresh token if the backend rotated it
          if (res.data.refresh) {
            localStorage.setItem("refreshToken", res.data.refresh);
          }
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newAuthToken}`;
          return axiosInstance(originalRequest);
          
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          const path = window.location.pathname;
          if (!path.startsWith("/login") && !path.startsWith("/signup")) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }

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