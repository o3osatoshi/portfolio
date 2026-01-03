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
    fields.push(field("DB Latest", payload.db.latestId ?? "n/a"));
    fields.push(field("DB Pruned", payload.db.prunedId ?? "none"));
    fields.push(field("DB Count", `${payload.db.totalCount}`));
  }

  if (payload.redis) {
    fields.push(field("Redis Key", payload.redis.key));
    fields.push(field("Redis Size", `${payload.redis.size}`));
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
