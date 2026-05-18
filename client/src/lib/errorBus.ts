import { getErrorMessage } from "./errors";

type ErrorHandler = (message: string) => void;

let handler: ErrorHandler | null = null;

export const setGlobalErrorHandler = (fn: ErrorHandler | null) => {
  handler = fn;
};

export const reportError = (error: unknown, fallback?: string) => {
  const message = getErrorMessage(error, fallback);
  handler?.(message);
  return message;
};
