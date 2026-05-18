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
    const skip =
      error.config?.skipErrorToast ||
      url.includes("/auth/login") ||
      url.includes("/auth/customer/login");
    if (!skip) reportError(error);
    return Promise.reject(error);
  }
);

export default api;
