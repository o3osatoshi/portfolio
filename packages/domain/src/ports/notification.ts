import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

export type NotificationField = {
  label: string;
  value: string;
};

export type NotificationLevel = "error" | "info" | "success" | "warning";

export type NotificationPayload = {
  error?: { message: string } | undefined;
  fields?: NotificationField[] | undefined;
  level: NotificationLevel;
  message?: string | undefined;
  timestamp?: Date | undefined;
  title: string;
};

/**
 * Port for delivering notifications to external systems.
 */
export interface Notifier {
  notify(payload: NotificationPayload): ResultAsync<void, RichError>;
}
