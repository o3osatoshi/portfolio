import { err, ok, type ResultAsync } from "neverthrow";
import { z } from "zod";

import type { RichError } from "@o3osatoshi/toolkit";
import { httpStatusToKind, parseWith } from "@o3osatoshi/toolkit";

import { createSmartFetch, type CreateSmartFetchOptions } from "../http";
import {
  type IntegrationKind,
  newIntegrationError,
} from "../integration-error";
import { integrationErrorCodes } from "../integration-error-catalog";
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

/**
 * Slack API client interface.
 *
 * Currently exposes only `chat.postMessage`; additional methods can be added by
 * extending the returned adapter.
 *
 * @public
 */
export type SlackClient = {
  postMessage: (
    message: SlackMessage,
  ) => ResultAsync<SlackPostMessageResponse, RichError>;
};

/**
 * Slack client configuration.
 *
 * @public
 */
export type SlackClientConfig = {
  apiBaseUrl?: string;
  token: string;
};

/**
 * Smart fetch options for Slack API calls.
 *
 * Reuses shared `createSmartFetch` configuration (`cache`, `logging`, `retry`).
 *
 * @public
 */
export type SlackClientOptions = CreateSmartFetchOptions;

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

/**
 * Create a Slack client backed by the shared smart-fetch utilities.
 *
 * Behavior:
 * - validates outgoing message shape before request
 * - maps transport and API errors to integration errors
 * - preserves `ok`/`error` semantics from Slack `chat.postMessage` response
 *
 * @param config Auth token and base URL.
 * @param options Shared smart-fetch options (`cache`, `logging`, `retry`).
 * @returns Slack client implementation.
 * @public
 */
export function createSlackClient(
  config: SlackClientConfig,
  options: SlackClientOptions = {},
): SlackClient {
  const baseUrl = config.apiBaseUrl ?? "https://slack.com/api";
  const sFetch = createSmartFetch(options);

  return {
    postMessage: (message) =>
      parseSlackMessage(message).asyncAndThen((validated) =>
        sFetch<typeof slackPostMessageResponseSchema>({
          body: JSON.stringify(validated),
          decode: {
            context: {
              action: "SlackPostMessageResponse",
              layer: "External",
            },
            schema: slackPostMessageResponseSchema,
          },
          headers: {
            Authorization: `Bearer ${config.token}`,
            "Content-Type": "application/json; charset=utf-8",
          },
          method: "POST",
          url: `${baseUrl}/chat.postMessage`,
        }).andThen((res) => {
          if (!res.response.ok) {
            return err(
              newIntegrationError({
                code: integrationErrorCodes.SLACK_API_HTTP_ERROR,
                details: {
                  action: "SlackPostMessage",
                  reason: `Slack API responded with ${res.response.status}: ${res.data.error ?? "unknown error"}`,
                },
                isOperational: true,
                kind:
                  slackErrorToKind(res.data.error) ??
                  httpStatusToKind(res.response.status),
              }),
            );
          }

          if (!res.data.ok) {
            return err(
              newIntegrationError({
                code: integrationErrorCodes.SLACK_API_LOGICAL_ERROR,
                details: {
                  action: "SlackPostMessage",
                  reason: res.data.error ?? "Slack API returned ok=false",
                },
                isOperational: true,
                kind:
                  slackErrorToKind(res.data.error) ??
                  httpStatusToKind(res.response.status),
              }),
            );
          }

          return ok(res.data);
        }),
      ),
  };
}

function slackErrorToKind(error?: string | undefined): IntegrationKind {
  if (!error) return "Internal";

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
