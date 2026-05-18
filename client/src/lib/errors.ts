import axios from "axios";

export const getErrorMessage = (error: unknown, fallback?: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (typeof data?.message === "string" && data.message) return data.message;
    if (Array.isArray(data?.message) && data.message.length) return data.message.join(", ");
    if (error.response?.status === 401) return "Invalid credentials";
    if (error.response?.status === 403) return "You do not have permission for this action";
    if (error.response?.status === 404) return "Not found";
    if (error.response?.status === 400) return "Invalid request";
    if (error.response?.status && error.response.status >= 500) return "Server error. Please try again";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback ?? "Something went wrong";
};
