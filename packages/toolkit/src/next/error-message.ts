import { type Kind, parseErrorMessage, parseErrorName } from "../error";

const KIND_MESSAGE_MAP: Record<Kind, string> = {
  Forbidden: "You do not have permission to perform this action.",
  Validation: "Some inputs look incorrect. Please review and try again.",
  BadGateway:
    "A connected service had an issue. Please try again in a few moments.",
  BadRequest: "The request was invalid. Please check your input.",
  Canceled: "The operation was canceled.",
  Config: "We hit a configuration issue. Please try again in a few moments.",
  Conflict: "Your change conflicted with another update. Reload and try again.",
  Deadlock: "The system is busy right now. Please try again in a few moments.",
  Integrity: "We ran into a data consistency issue. Reload and try again.",
  MethodNotAllowed: "This action is not supported.",
  NotFound: "We could not find the requested item.",
  RateLimit: "Too many requests right now. Please wait a moment and try again.",
  Serialization: "There was a problem processing the data. Please try again.",
  Timeout: "The request took too long. Please try again.",
  Unauthorized: "Please sign in to continue.",
  Unavailable:
    "The service is busy right now. Please try again in a few moments.",
  Unknown: "An unexpected error occurred.",
  Unprocessable: "We could not process your input. Please check and try again.",
};

const USER_MESSAGE_FALLBACK =
  "We could not complete your request due to an unknown error. Please try again.";

const NAME_KIND_FALLBACKS: Partial<Record<string, Kind>> = {
  AbortError: "Canceled",
  ZodError: "Validation",
};

/**
 * Derive a user-facing message from an `Error` produced by `@o3osatoshi/toolkit`.
 *
 * @remarks
 * Ordering rules:
 * - If the error `name` yields a `kind`, return the mapped friendly text.
 * - Append parsed `reason` / `impact` / `hint` when present in `composeErrorMessage` JSON.
 * - If no kind is detected but structured message fields exist, join them.
 * - Otherwise use the raw `error.message` when it is not JSON-like; fall back to a stable generic string.
 *
 * @public
 * @param error - An Error, ideally created via `newError`.
 * @returns A concise, user-friendly message.
 */
export function userMessageFromError(error: Error): string {
  const nameParts = parseErrorName(error.name);
  const kind = nameParts.kind ?? NAME_KIND_FALLBACKS[error.name];
  const baseMessage = kind ? KIND_MESSAGE_MAP[kind] : undefined;

  const detailMessages: string[] = [];
  const messageParts = parseErrorMessage(error.message);
  if (messageParts.reason) {
    detailMessages.push(messageParts.reason);
  }
  if (messageParts.impact) {
    detailMessages.push(`Impact: ${messageParts.impact}`);
  }
  if (messageParts.hint) {
    detailMessages.push(`Hint: ${messageParts.hint}`);
  }

  if (baseMessage) {
    if (detailMessages.length > 0) {
      return `${baseMessage} ${detailMessages.join(" ")}`;
    }
    return baseMessage;
  }

  if (detailMessages.length > 0) {
    return detailMessages.join(" ");
  }

  const plainMessage = error.message?.trim();
  if (plainMessage) {
    if (plainMessage.startsWith("{") || plainMessage.startsWith("[")) {
      return USER_MESSAGE_FALLBACK;
    }
    return plainMessage;
  }

  return USER_MESSAGE_FALLBACK;
}
