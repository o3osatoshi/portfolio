import type { ResultAsync } from "neverthrow";

export type NotificationField = {
  label: string;
  value: string;
};

export type NotificationLevel = "error" | "info" | "success" | "warning";

/**
 * Transport-specific overrides keyed by channel name (e.g. "slack", "email").
 * The shape is intentionally loose to avoid leaking vendor details into domain.
 */
export type NotificationOverrides = Record<string, Record<string, unknown>>;

export type NotificationPayload = {
  error?: { message: string } | undefined;
  fields?: NotificationField[] | undefined;
  level: NotificationLevel;
  message?: string | undefined;
  overrides?: NotificationOverrides | undefined;
  timestamp?: Date | undefined;
  title: string;
};

/**
 * Port for delivering notifications to external systems.
 */
export interface Notifier {
  notify(payload: NotificationPayload): ResultAsync<void, Error>;
}
