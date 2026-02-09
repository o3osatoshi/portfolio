import { isRichError } from "../error";

const USER_MESSAGE_FALLBACK =
  "We could not complete your request due to an unknown error. Please try again.";

/**
 * Derive a fallback user-facing message from an `Error`.
 *
 * @remarks
 * This helper does not perform translation. Use `RichError.i18n` for localized
 * user-facing text when available, and rely on this function only as fallback.
 *
 * @public
 * @param error - An Error, ideally created via `newRichError`.
 * @returns A fallback message safe to display when i18n lookup is unavailable.
 */
export function userMessageFromError(error: Error): string {
  const detailMessages: string[] = [];
  if (isRichError(error) && error.details) {
    const { hint, impact, reason } = error.details;
    if (reason) detailMessages.push(reason);
    if (impact) detailMessages.push(`Impact: ${impact}`);
    if (hint) detailMessages.push(`Hint: ${hint}`);
  }

  if (detailMessages.length > 0) {
    return detailMessages.join(" ");
  }

  const plainMessage = error.message?.trim();
  if (plainMessage) {
    if (plainMessage.startsWith("{") || plainMessage.startsWith("[")) {
      return USER_MESSAGE_FALLBACK;
    }
    if (plainMessage === error.name) {
      return USER_MESSAGE_FALLBACK;
    }
    return plainMessage;
  }

  return USER_MESSAGE_FALLBACK;
}
