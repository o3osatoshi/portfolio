import type { ResultAsync } from "neverthrow";

export type NotificationField = {
  label: string;
  value: string;
};

export type NotificationLevel = "error" | "info" | "success" | "warning";

export type NotificationOverrides = {
  slack?: SlackMessageOverrides | undefined;
};

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

export type SlackMessageOverrides = {
  attachments?: undefined | unknown[];
  blocks?: undefined | unknown[];
  channel?: string | undefined;
  icon_emoji?: string | undefined;
  icon_url?: string | undefined;
  link_names?: boolean | undefined;
  metadata?: Record<string, unknown> | undefined;
  mrkdwn?: boolean | undefined;
  parse?: "full" | "none" | undefined;
  reply_broadcast?: boolean | undefined;
  text?: string | undefined;
  thread_ts?: string | undefined;
  unfurl_links?: boolean | undefined;
  unfurl_media?: boolean | undefined;
  username?: string | undefined;
};
