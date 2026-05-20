import { getErrorMessage } from "./errors";

type ErrorHandler = (message: string) => void;

let handler: ErrorHandler | null = null;
const pending: string[] = [];

export const setGlobalErrorHandler = (fn: ErrorHandler | null) => {
  handler = fn;
  if (handler) {
    while (pending.length) handler(pending.shift()!);
  }
};

export const reportError = (error: unknown, fallback?: string) => {
  const message = getErrorMessage(error, fallback);
  if (handler) handler(message);
  else pending.push(message);
  return message;
};
