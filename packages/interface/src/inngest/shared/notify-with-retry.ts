import type { NotificationPayload, Notifier } from "@repo/domain";
import { errAsync, type ResultAsync } from "neverthrow";

export function notifyWithRetry(
  notifier: Notifier,
  payload: NotificationPayload,
  attempts: number,
): ResultAsync<void, Error> {
  if (attempts <= 0) {
    return errAsync(new Error("Notification failed"));
  }

  const attemptNotify = (remaining: number): ResultAsync<void, Error> =>
    notifier.notify(payload).orElse((error) => {
      if (remaining <= 1) return errAsync(error);
      return attemptNotify(remaining - 1);
    });

  return attemptNotify(attempts);
}
