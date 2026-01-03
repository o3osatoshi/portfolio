import type { StorePingNotification, StorePingNotifier } from "@repo/domain";
import { errAsync } from "neverthrow";

import { newIntegrationError } from "../integration-error";
import type { SlackClient } from "./client";

export type StorePingSlackNotifierConfig = {
  channelId: string;
  client: SlackClient;
};

export function createStorePingSlackNotifier(
  config: StorePingSlackNotifierConfig,
): StorePingNotifier {
  return {
    notify: (payload) =>
      config.client
        .postMessage({
          blocks: buildBlocks(payload),
          channel: config.channelId,
          text: buildFallbackText(payload),
        })
        .map(() => undefined)
        .orElse((cause) =>
          errAsync(
            newIntegrationError({
              action: "StorePingNotify",
              cause,
              hint: "Check Slack channel permissions and token scopes.",
              impact: "store-ping notification not delivered",
              kind: "BadGateway",
              reason: "Slack notification failed",
            }),
          ),
        ),
  };
}

function buildBlocks(payload: StorePingNotification): unknown[] {
  const header = {
    text: {
      text: `Store Ping ${payload.status.toUpperCase()}`,
      type: "plain_text",
    },
    type: "header",
  };

  const fields = [
    field("Job", payload.jobKey),
    field("Run Key", payload.runKey),
    field("Slot", payload.slot),
    field("Run At", payload.runAt.toISOString()),
  ];

  if (payload.durationMs !== undefined) {
    fields.push(field("Duration", `${payload.durationMs}ms`));
  }

  if (payload.db) {
    fields.push(field("DB Created", payload.db.createdId));
    fields.push(field("DB Read", payload.db.readId));
    fields.push(field("DB Deleted", payload.db.deletedId));
  }

  if (payload.cache) {
    fields.push(field("Cache Key", payload.cache.key));
    fields.push(field("Cache Size", `${payload.cache.size}`));
  }

  const blocks: unknown[] = [
    header,
    {
      fields,
      type: "section",
    },
  ];

  if (payload.error) {
    blocks.push({
      text: {
        text: `Error: ${payload.error.message}`,
        type: "mrkdwn",
      },
      type: "section",
    });
  }

  return blocks;
}

function buildFallbackText(payload: StorePingNotification): string {
  const status = payload.status.toUpperCase();
  const base = `Store Ping ${status}`;
  if (!payload.error) return base;
  return `${base}: ${payload.error.message}`;
}

function field(label: string, value: string): { text: string; type: string } {
  return {
    text: `*${label}*\n${value}`,
    type: "mrkdwn",
  };
}
