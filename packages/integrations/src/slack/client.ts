import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

import { httpStatusToKind, parseWith } from "@o3osatoshi/toolkit";

import {
  type IntegrationKind,
  newIntegrationError,
} from "../integration-error";
import type {
  SlackBlock,
  SlackMessage,
  SlackPostMessageResponse,
} from "./types";

const slackPostMessageResponseSchema: z.ZodType<SlackPostMessageResponse> = z
  .object({
    channel: z.string().optional(),
    error: z.string().optional(),
    ok: z.boolean(),
    ts: z.string().optional(),
  })
  .loose();

const parseSlackPostMessageResponse = parseWith(
  slackPostMessageResponseSchema,
  {
    action: "SlackPostMessageResponse",
    layer: "External",
  },
);

export type OverridableSlackMessage = Partial<SlackMessage>;

export type SlackClient = {
  postMessage: (
    message: SlackMessage,
  ) => ResultAsync<SlackPostMessageResponse, Error>;
};

export type SlackClientConfig = {
  apiBaseUrl?: string;
  fetch?: typeof fetch;
  token: string;
};

const slackMessageSchema: z.ZodType<SlackMessage> = z
  .object({
    blocks: z.array(z.custom<SlackBlock>()).min(1).optional(),
    channel: z.string().min(1),
    text: z.string().min(1).optional(),
  })
  .loose()
  .superRefine((value, ctx) => {
    const hasText =
      "text" in value &&
      typeof value.text === "string" &&
      value.text.length > 0;
    const hasBlocks =
      "blocks" in value &&
      Array.isArray(value.blocks) &&
      value.blocks.length > 0;

    if (!hasText && !hasBlocks) {
      ctx.addIssue({
        code: "custom",
        message: "Slack message must include text or blocks.",
        path: ["text"],
      });
    }
  });

const parseSlackMessage = parseWith(slackMessageSchema, {
  action: "SlackPostMessage",
  layer: "External",
});

export function createSlackClient(config: SlackClientConfig): SlackClient {
  const baseUrl = config.apiBaseUrl ?? "https://slack.com/api";
  const fetcher = config.fetch ?? fetch;

  return {
    postMessage: (message) =>
      parseSlackMessage(message).asyncAndThen((validated) =>
        ResultAsync.fromPromise(
          fetcher(`${baseUrl}/chat.postMessage`, {
            body: JSON.stringify(validated),
            headers: {
              Authorization: `Bearer ${config.token}`,
              "Content-Type": "application/json; charset=utf-8",
            },
            method: "POST",
          }),
          (cause) =>
            newIntegrationError({
              action: "SlackPostMessage",
              cause,
              hint: "Check Slack API connectivity and token validity.",
              impact: "notification could not be delivered",
              kind: "Unavailable",
              reason: "Slack API request failed",
            }),
        ).andThen((response) => parseResponse(response)),
      ),
  };
}

function parseResponse(
  response: Response,
): ResultAsync<SlackPostMessageResponse, Error> {
  if (!response.ok) {
    return ResultAsync.fromPromise(response.json(), (cause) =>
      newIntegrationError({
        action: "SlackPostMessage",
        cause,
        kind: httpStatusToKind(response.status),
        reason: `Slack API responded with ${response.status}`,
      }),
    ).andThen((data) =>
      parseSlackPostMessageResponse(data).andThen((res) => {
        return err(
          newIntegrationError({
            action: "SlackPostMessage",
            kind:
              slackErrorToKind(res.error) ?? httpStatusToKind(response.status),
            reason: `Slack API responded with ${response.status}: ${res.error ?? "unknown error"}`,
          }),
        );
      }),
    );
  }

  return ResultAsync.fromPromise(response.json(), (cause) =>
    newIntegrationError({
      action: "SlackPostMessage",
      cause,
      kind: "Serialization",
      reason: "Failed to parse Slack API response",
    }),
  ).andThen((data) =>
    parseSlackPostMessageResponse(data).andThen((res) => {
      if (!res.ok) {
        return err(
          newIntegrationError({
            action: "SlackPostMessage",
            kind:
              slackErrorToKind(res.error) ?? httpStatusToKind(response.status),
            reason: res.error ?? "Slack API returned ok=false",
          }),
        );
      }
      return ok(res);
    }),
  );
}

function slackErrorToKind(error?: string | undefined): IntegrationKind {
  if (!error) return "Unknown";

  const SLACK_ERROR_KIND_MAP: ReadonlyArray<[string, IntegrationKind]> = [
    ["invalid_auth", "Unauthorized"],
    ["not_authed", "Unauthorized"],
    ["channel_not_found", "NotFound"],
    ["ratelimited", "RateLimit"],
    ["not_in_channel", "Forbidden"],
  ];

  const matchedMap = SLACK_ERROR_KIND_MAP.find(([code]) =>
    error.toLowerCase().includes(code),
  );
  return matchedMap ? matchedMap[1] : "BadRequest";
}
