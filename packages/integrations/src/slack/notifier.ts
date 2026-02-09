import type {
  NotificationField,
  NotificationPayload,
  Notifier,
} from "@repo/domain";
import { err } from "neverthrow";

import { newIntegrationError } from "../integration-error";
import { integrationErrorCodes } from "../integration-error-catalog";
import type { OverridableSlackMessage, SlackClient } from "./client";
import type { SlackBlock, SlackMessage, SlackTextObject } from "./types";

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
              cause,
              code: integrationErrorCodes.SLACK_NOTIFY_FAILED,
              details: {
                action: "Notify",
                hint: "Check Slack channel permissions and token scopes.",
                impact: "notification could not be delivered",
                reason: "Slack notification failed",
              },
              isOperational: true,
              kind: "BadGateway",
            }),
          ),
        ),
  };
}

function buildFallbackText(payload: NotificationPayload): string {
  const segments = [`${payload.title} ${payload.level.toUpperCase()}`];
  if (payload.message) segments.push(payload.message);
  if (payload.error) segments.push(payload.error.message);
  return segments.join(" - ");
}

function buildMessage(
  channelId: string,
  payload: NotificationPayload,
): SlackMessage {
  const headerText = `${payload.title} ${payload.level.toUpperCase()}`;
  const fields = buildSlackTextObjects(payload);

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

  return overrideMessage(message, extractOverridableMessage(payload));
}

function buildSlackTextObjects(
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

  return fields.map((entry) => toSlackTextObject(entry.label, entry.value));
}

function extractOverridableMessage(
  payload: NotificationPayload,
): OverridableSlackMessage | undefined {
  const overrides = payload.overrides?.["slack"];
  if (!overrides || typeof overrides !== "object") return undefined;
  return overrides as OverridableSlackMessage;
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

function toSlackTextObject(label: string, value: string): SlackTextObject {
  return {
    text: `*${label}*\n${value}`,
    type: "mrkdwn",
  };
}
