import type {
  NotificationField,
  NotificationPayload,
  Notifier,
} from "@repo/domain";
import { err } from "neverthrow";

import { newIntegrationError } from "../integration-error";
import type {
  OverridableSlackMessage,
  SlackClient,
  SlackMessage,
} from "./client";
import type { SlackBlock, SlackTextObject } from "./types";

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
          err(
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

function buildFallbackText(payload: NotificationPayload): string {
  const status = payload.level.toUpperCase();
  const segments = [`${payload.title} ${status}`];
  if (payload.message) segments.push(payload.message);
  if (payload.error) segments.push(payload.error.message);
  return segments.join(" - ");
}

function buildMessage(
  channelId: string,
  payload: NotificationPayload,
): SlackMessage {
  const headerText = `${payload.title} ${payload.level.toUpperCase()}`;
  const fields = buildSlackMessageFields(payload);

  const blocks: SlackBlock[] = [
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

  const message: SlackMessage = {
    blocks,
    channel: channelId,
    text: buildFallbackText(payload),
  };

  return overrideMessage(message, resolveSlackOverrides(payload));
}

function buildSlackMessageFields(
  payload: NotificationPayload,
): SlackTextObject[] {
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

  return fields.map((entry) => toSlackMessageField(entry.label, entry.value));
}

function overrideMessage(
  message: SlackMessage,
  prioritizedMessage?: OverridableSlackMessage,
): SlackMessage {
  if (!prioritizedMessage) return message;
  const blocks = prioritizedMessage.blocks ?? message.blocks;
  return {
    ...message,
    ...prioritizedMessage,
    blocks,
    channel: prioritizedMessage.channel ?? message.channel,
    text: prioritizedMessage.text ?? message.text,
  };
}

function resolveSlackOverrides(
  payload: NotificationPayload,
): OverridableSlackMessage | undefined {
  const overrides = payload.overrides?.["slack"];
  if (!overrides || typeof overrides !== "object") return undefined;
  return overrides as OverridableSlackMessage;
}

function toSlackMessageField(label: string, value: string): SlackTextObject {
  return {
    text: `*${label}*\n${value}`,
    type: "mrkdwn",
  };
}
