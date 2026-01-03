import type { ResultAsync } from "neverthrow";

import type {
  StorePingDbSummary,
  StorePingRedisSummary,
  StorePingRunSlot,
} from "./store-ping.types";

export type StorePingNotification = {
  db?: StorePingDbSummary | undefined;
  durationMs?: number | undefined;
  error?: { message: string } | undefined;
  jobKey: "store-ping";
  redis?: StorePingRedisSummary | undefined;
  runAt: Date;
  runKey: string;
  slot: StorePingRunSlot;
  status: StorePingNotificationStatus;
};

export type StorePingNotificationStatus = "failure" | "success";

/**
 * Port for delivering store-ping notifications.
 */
export interface StorePingNotifier {
  notify(payload: StorePingNotification): ResultAsync<void, Error>;
}
