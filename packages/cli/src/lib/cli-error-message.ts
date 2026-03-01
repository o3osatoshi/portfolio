import type { RichError } from "@o3osatoshi/toolkit";

export function toCliErrorMessage(error: RichError): string {
  const message = error.details?.reason?.trim() || error.message.trim();
  if (!error.code) {
    return message;
  }
  return `${message} (code=${error.code})`;
}
