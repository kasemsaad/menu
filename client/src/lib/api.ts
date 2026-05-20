import axios from "axios";
import { reportError } from "./errorBus";

declare module "axios" {
  interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = String(error.config?.url ?? "");
    const isLoginAttempt =
      url.includes("/auth/login") || url.includes("/auth/customer/login");
    const skip = error.config?.skipErrorToast || isLoginAttempt;
    if (!skip) reportError(error);

    if (error.response?.status === 401 && !isLoginAttempt) {
      const kind = localStorage.getItem("authKind");
      if (kind === "staff" || kind === "customer") {
        localStorage.removeItem("token");
        localStorage.removeItem("authKind");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
