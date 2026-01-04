import type { NotificationPayload, Notifier } from "@repo/domain";
import { errAsync, type ResultAsync } from "neverthrow";

import { newError } from "@o3osatoshi/toolkit";

export function retriableNotify(
  notifier: Notifier,
  payload: NotificationPayload,
  attempts: number,
): ResultAsync<void, Error> {
  if (attempts <= 0) {
    return errAsync(
      newError({
        action: "NotifyWithRetry",
        hint: "ensure retry attempts is set to a positive integer",
        impact: "notification could not be delivered",
        kind: "Config",
        layer: "Application",
        reason: `attempts must be greater than 0 (received ${attempts})`,
      }),
    );
  }

  const attemptNotify = (remaining: number): ResultAsync<void, Error> =>
    notifier.notify(payload).orElse((error) => {
      if (remaining <= 1) return errAsync(error);
      return attemptNotify(remaining - 1);
    });

  return attemptNotify(attempts);
}
