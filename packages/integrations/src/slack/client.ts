import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import { httpStatusToKind } from "@o3osatoshi/toolkit";

import { newIntegrationError } from "../integration-error";

const SlackPostMessageResponseSchema = z.object({
  channel: z.string().optional(),
  error: z.string().optional(),
  ok: z.boolean(),
  ts: z.string().optional(),
});

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

export type SlackMessage =
  | ({
      blocks: unknown[];
      channel: string;
      text?: string | undefined;
    } & SlackMessageOverrides)
  | ({
      blocks?: undefined | unknown[];
      channel: string;
      text: string | undefined;
    } & SlackMessageOverrides);

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

export type SlackPostMessageResponse = z.infer<
  typeof SlackPostMessageResponseSchema
>;

const SlackMessageSchema = z
  .object({
    blocks: z.array(z.unknown()).min(1).optional(),
    channel: z.string().min(1),
    text: z.string().min(1).optional(),
  })
  .loose()
  .superRefine((value, ctx) => {
    if (!value.text && !value.blocks) {
      ctx.addIssue({
        code: "custom",
        message: "Slack message must include text or blocks.",
        path: ["text"],
      });
    }
  });

export function createSlackClient(config: SlackClientConfig): SlackClient {
  const baseUrl = config.apiBaseUrl ?? "https://slack.com/api";
  const fetcher = config.fetch ?? fetch;

  return {
    postMessage: (message) => {
      const result = SlackMessageSchema.safeParse(message);
      if (!result.success) {
        return errAsync(
          newIntegrationError({
            action: "SlackPostMessage",
            cause: result.error,
            kind: "Validation",
            reason: "Slack message validation failed",
          }),
        );
      }

      return ResultAsync.fromPromise(
        fetcher(`${baseUrl}/chat.postMessage`, {
          body: JSON.stringify(result.data),
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
      ).andThen((response) => parseResponse(response));
    },
  };
}

function mapSlackErrorToKind(error?: string) {
  if (!error) return "Unknown";
  if (error.includes("invalid_auth") || error.includes("not_authed")) {
    return "Unauthorized";
  }
  if (error.includes("channel_not_found")) return "NotFound";
  if (error.includes("ratelimited")) return "RateLimit";
  if (error.includes("not_in_channel")) return "Forbidden";
  return "BadRequest";
}

function parseResponse(
  response: Response,
): ResultAsync<SlackPostMessageResponse, Error> {
  if (!response.ok) {
    return ResultAsync.fromPromise(response.text(), (cause) =>
      newIntegrationError({
        action: "SlackPostMessage",
        cause,
        kind: httpStatusToKind(response.status),
        reason: `Slack API responded with ${response.status}`,
      }),
    ).andThen((body) => {
      const slackError = parseSlackError(body);
      const kind = slackError
        ? mapSlackErrorToKind(slackError)
        : httpStatusToKind(response.status);
      const reason = slackError
        ? `Slack API responded with ${response.status}: ${slackError}`
        : body
          ? `Slack API responded with ${response.status}: ${body}`
          : `Slack API responded with ${response.status}`;
      return errAsync(
        newIntegrationError({
          action: "SlackPostMessage",
          kind,
          reason,
        }),
      );
    });
  }

  return ResultAsync.fromPromise(response.json(), (cause) =>
    newIntegrationError({
      action: "SlackPostMessage",
      cause,
      kind: "Serialization",
      reason: "Failed to parse Slack API response",
    }),
  ).andThen((data) => {
    const parsed = SlackPostMessageResponseSchema.safeParse(data);
    if (!parsed.success) {
      return errAsync(
        newIntegrationError({
          action: "SlackPostMessage",
          cause: parsed.error,
          kind: "Serialization",
          reason: "Slack API response shape mismatch",
        }),
      );
    }
    if (!parsed.data.ok) {
      return errAsync(
        newIntegrationError({
          action: "SlackPostMessage",
          kind: mapSlackErrorToKind(parsed.data.error),
          reason: parsed.data.error ?? "Slack API returned ok=false",
        }),
      );
    }
    return okAsync(parsed.data);
  });
}

function parseSlackError(body: string): string | undefined {
  try {
    const data = JSON.parse(body);
    const parsed = SlackPostMessageResponseSchema.safeParse(data);
    if (parsed.success) return parsed.data.error;
    if (typeof data === "object" && data && "error" in data) {
      const candidate = (data as { error?: unknown }).error;
      if (typeof candidate === "string") return candidate;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
