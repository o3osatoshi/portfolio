import type {
  NotificationField,
  NotificationPayload,
  Notifier,
  SlackMessageOverrides,
} from "@repo/domain";
import { errAsync } from "neverthrow";

import { newIntegrationError } from "../integration-error";
import type { SlackClient, SlackMessage } from "./client";

export type SlackNotifierConfig = {
  channelId: string;
  client: SlackClient;
};

export function createSlackNotifier(config: SlackNotifierConfig): Notifier {
  return {
    notify: (payload) =>
      config.client
        .postMessage(buildMessage(config.channelId, payload))
        .map(() => undefined)
        .orElse((cause) =>
          errAsync(
            newIntegrationError({
              action: "Notify",
              cause,
              hint: "Check Slack channel permissions and token scopes.",
              impact: "notification could not be delivered",
              kind: "BadGateway",
              reason: "Slack notification failed",
            }),
          ),
        ),
  };
}

function applyOverrides(
  base: SlackMessage,
  overrides?: SlackMessageOverrides,
): SlackMessage {
  if (!overrides) return base;
  const merged = { ...base, ...overrides };
  if (merged.channel === undefined) merged.channel = base.channel;
  if (merged.text === undefined) merged.text = base.text;
  return merged;
}

function buildFallbackText(payload: NotificationPayload): string {
  const status = payload.level.toUpperCase();
  const segments = [`${payload.title} ${status}`];
  if (payload.message) segments.push(payload.message);
  if (payload.error) segments.push(payload.error.message);
  return segments.join(" - ");
}

function buildFields(
  payload: NotificationPayload,
): Array<{ text: string; type: string }> {
  const fields: NotificationField[] = [];

  if (payload.timestamp) {
    fields.push({
      label: "Timestamp",
      value: payload.timestamp.toISOString(),
    });
  }

  if (payload.fields) {
    fields.push(...payload.fields);
  }

  return fields.map((entry) => field(entry.label, entry.value));
}

function buildMessage(
  channelId: string,
  payload: NotificationPayload,
): SlackMessage {
  const headerText = `${payload.title} ${payload.level.toUpperCase()}`;
  const fields = buildFields(payload);

  const blocks: unknown[] = [
    {
      text: {
        text: headerText,
        type: "plain_text",
      },
      type: "header",
    },
  ];

  if (payload.message) {
    blocks.push({
      text: {
        text: payload.message,
        type: "mrkdwn",
      },
      type: "section",
    });
  }

  if (fields.length > 0) {
    blocks.push({
      fields,
      type: "section",
    });
  }

  if (payload.error) {
    blocks.push({
      text: {
        text: `Error: ${payload.error.message}`,
        type: "mrkdwn",
      },
      type: "section",
    });
  }

  const baseMessage: SlackMessage = {
    blocks,
    channel: channelId,
    text: buildFallbackText(payload),
  };

  return applyOverrides(baseMessage, payload.overrides?.slack);
}

function field(label: string, value: string): { text: string; type: string } {
  return {
    text: `*${label}*\n${value}`,
    type: "mrkdwn",
  };
}
