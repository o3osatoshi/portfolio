import type { SlackMessageOverrides } from "@repo/domain";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

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

export type SlackMessage = {
  channel?: string | undefined;
  text?: string | undefined;
} & SlackMessageOverrides;

export type SlackPostMessageResponse = z.infer<
  typeof SlackPostMessageResponseSchema
>;

export function createSlackClient(config: SlackClientConfig): SlackClient {
  const baseUrl = config.apiBaseUrl ?? "https://slack.com/api";
  const fetcher = config.fetch ?? fetch;

  return {
    postMessage: (message) =>
      ResultAsync.fromPromise(
        fetcher(`${baseUrl}/chat.postMessage`, {
          body: JSON.stringify(message),
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

function mapStatusToKind(status: number) {
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "NotFound";
  if (status === 408) return "Timeout";
  if (status === 429) return "RateLimit";
  if (status >= 500) return "BadGateway";
  return "BadRequest";
}

function parseResponse(
  response: Response,
): ResultAsync<SlackPostMessageResponse, Error> {
  if (!response.ok) {
    return ResultAsync.fromPromise(response.text(), () =>
      newIntegrationError({
        action: "SlackPostMessage",
        kind: mapStatusToKind(response.status),
        reason: `Slack API responded with ${response.status}`,
      }),
    ).andThen((body) =>
      errAsync(
        newIntegrationError({
          action: "SlackPostMessage",
          kind: mapStatusToKind(response.status),
          reason: `Slack API responded with ${response.status}: ${body}`,
        }),
      ),
    );
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
