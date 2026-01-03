import type { ResultAsync } from "neverthrow";

import type {
  StorePingCacheSummary,
  StorePingDbSummary,
  StorePingRunSlot,
} from "./store-ping.types";

export type StorePingNotification = {
  cache?: StorePingCacheSummary | undefined;
  db?: StorePingDbSummary | undefined;
  durationMs?: number | undefined;
  error?: { message: string } | undefined;
  jobKey: "store-ping";
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
