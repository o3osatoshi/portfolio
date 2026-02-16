import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { newIntegrationError } from "../integration-error";
import { integrationErrorCodes } from "../integration-error-catalog";
import { createSlackNotifier } from "./notifier";

describe("integrations/slack createSlackNotifier", () => {
  it("builds a Slack message with header, fields, and error details", async () => {
    const postMessageMock = vi.fn(() =>
      okAsync({
        ok: true,
      }),
    );
    const notifier = createSlackNotifier({
      channelId: "C123",
      client: { postMessage: postMessageMock },
    });
    const timestamp = new Date("2024-01-01T00:00:00.000Z");

    const result = await notifier.notify({
      error: { message: "boom" },
      fields: [{ label: "Job", value: "store-ping" }],
      level: "error",
      message: "Something broke",
      timestamp,
      title: "Store Ping",
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    expect(postMessageMock).toHaveBeenCalledTimes(1);
    // @ts-expect-error
    const message = postMessageMock.mock.calls[0]?.[0] as unknown as {
      blocks: Array<{
        fields?: Array<{ text: string; type: string }>;
        text?: { text: string; type: string };
        type: string;
      }>;
      channel: string;
      text: string;
    };

    expect(message.channel).toBe("C123");
    expect(message.text).toBe("Store Ping ERROR - Something broke - boom");
    expect(message.blocks).toHaveLength(4);
    expect(message.blocks[0]).toMatchObject({
      text: { text: "Store Ping ERROR", type: "plain_text" },
      type: "header",
    });
    expect(message.blocks[1]).toMatchObject({
      text: { text: "Something broke", type: "mrkdwn" },
      type: "section",
    });
    expect(message.blocks[2]?.fields).toEqual([
      {
        text: `*Timestamp*\n${timestamp.toISOString()}`,
        type: "mrkdwn",
      },
      { text: "*Job*\nstore-ping", type: "mrkdwn" },
    ]);
    expect(message.blocks[3]).toMatchObject({
      text: { text: "Error: boom", type: "mrkdwn" },
      type: "section",
    });
  });

  it("wraps client errors as ExternalBadGatewayError", async () => {
    const postMessageMock = vi.fn(() =>
      errAsync(
        newIntegrationError({
          code: integrationErrorCodes.SLACK_NOTIFY_FAILED,
          details: {
            action: "SlackNotifierSpec",
            reason: "slack down",
          },
          isOperational: true,
          kind: "Unavailable",
        }),
      ),
    );
    const notifier = createSlackNotifier({
      channelId: "C123",
      client: { postMessage: postMessageMock },
    });

    const result = await notifier.notify({
      level: "warning",
      title: "Store Ping",
    });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error.name).toBe("ExternalBadGatewayError");
  });
});
