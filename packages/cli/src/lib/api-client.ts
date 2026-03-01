import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import { newRichError, parseWith } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./cli-error-catalog";
import { toAsync } from "./cli-result";
import { getRuntimeConfig } from "./config";
import { refreshToken } from "./oidc";
import { clearTokenSet, readTokenSet, writeTokenSet } from "./token-store";
import type { CliResultAsync, CliRuntimeConfig, TokenSet } from "./types";

const meSchema = z.object({
  issuer: z.string(),
  scopes: z.array(z.string()),
  subject: z.string(),
  userId: z.string(),
});

const transactionSchema = z.object({
  id: z.string(),
  amount: z.string(),
  createdAt: z.string().or(z.date()),
  currency: z.string(),
  datetime: z.string().or(z.date()),
  price: z.string(),
  type: z.enum(["BUY", "SELL"]),
  updatedAt: z.string().or(z.date()),
  userId: z.string(),
});

const apiErrorResponseSchema = z.looseObject({
  code: z.string().optional(),
  details: z
    .looseObject({
      reason: z.string().optional(),
    })
    .optional(),
  message: z.string().optional(),
});

// Refresh slightly before exp to avoid clock-skew races between CLI and API.
const ACCESS_TOKEN_REFRESH_SKEW_SECONDS = 60;

export type MeResponse = z.infer<typeof meSchema>;
export type TransactionResponse = z.infer<typeof transactionSchema>;

export function createTransaction(
  payload: Record<string, unknown>,
): CliResultAsync<TransactionResponse> {
  return request("/api/cli/v1/transactions", {
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  }).andThen((json) =>
    toAsync(
      parseWith(transactionSchema, {
        action: "DecodeCreateTransactionResponse",
        layer: "Presentation",
      })(json),
    ),
  );
}

export function deleteTransaction(id: string): CliResultAsync<void> {
  return request(`/api/cli/v1/transactions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).map(() => undefined);
}

export function fetchMe(): CliResultAsync<MeResponse> {
  return request("/api/cli/v1/me", {
    method: "GET",
  }).andThen((json) =>
    toAsync(
      parseWith(meSchema, {
        action: "DecodeCliPrincipalResponse",
        layer: "Presentation",
      })(json),
    ),
  );
}

export function listTransactions(): CliResultAsync<TransactionResponse[]> {
  return request("/api/cli/v1/transactions", {
    method: "GET",
  }).andThen((json) =>
    toAsync(
      parseWith(z.array(transactionSchema), {
        action: "DecodeListTransactionsResponse",
        layer: "Presentation",
      })(json),
    ),
  );
}

export function updateTransaction(
  id: string,
  payload: Record<string, unknown>,
): CliResultAsync<void> {
  return request(`/api/cli/v1/transactions/${encodeURIComponent(id)}`, {
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
    method: "PATCH",
  }).map(() => undefined);
}

function ensureAccessToken(config: CliRuntimeConfig): CliResultAsync<TokenSet> {
  return readTokenSet().andThen((token) => {
    if (!token) {
      return errAsync(
        newRichError({
          code: cliErrorCodes.CLI_API_UNAUTHORIZED,
          details: {
            action: "EnsureAccessToken",
            reason: "Not logged in. Run `o3o auth login`.",
          },
          isOperational: true,
          kind: "Unauthorized",
          layer: "Presentation",
        }),
      );
    }

    if (
      !token.expires_at ||
      token.expires_at > nowSeconds() + ACCESS_TOKEN_REFRESH_SKEW_SECONDS
    ) {
      return okAsync(token);
    }

    if (!token.refresh_token) {
      return errAsync(
        newRichError({
          code: cliErrorCodes.CLI_API_UNAUTHORIZED,
          details: {
            action: "EnsureAccessToken",
            reason: "Session expired. Run `o3o auth login` again.",
          },
          isOperational: true,
          kind: "Unauthorized",
          layer: "Presentation",
        }),
      );
    }

    return refreshToken(config.oidc, token.refresh_token).andThen(
      (refreshed) => {
        const merged: TokenSet = {
          ...token,
          ...refreshed,
          refresh_token: refreshed.refresh_token ?? token.refresh_token,
        };

        return writeTokenSet(merged).map(() => merged);
      },
    );
  });
}

function mapHttpKind(
  status: number,
):
  | "BadGateway"
  | "BadRequest"
  | "Conflict"
  | "Forbidden"
  | "NotFound"
  | "RateLimit"
  | "Unauthorized"
  | "Unprocessable" {
  if (status === 400) return "BadRequest";
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "NotFound";
  if (status === 409) return "Conflict";
  if (status === 422) return "Unprocessable";
  if (status === 429) return "RateLimit";
  return "BadGateway";
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function parseApiError(
  text: string,
): null | z.infer<typeof apiErrorResponseSchema> {
  try {
    const parsed = apiErrorResponseSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function parseSuccessResponseBody(
  response: Response,
  method: RequestInit["method"],
): CliResultAsync<undefined | unknown> {
  const normalizedMethod = (method ?? "GET").toUpperCase();
  if (normalizedMethod === "DELETE" || response.status === 204) {
    return okAsync(undefined);
  }

  return ResultAsync.fromPromise(response.text(), (cause) =>
    newRichError({
      cause,
      code: cliErrorCodes.CLI_API_REQUEST_FAILED,
      details: {
        action: "ReadCliApiResponseBody",
        reason: "Failed to read API response body.",
      },
      isOperational: true,
      kind: "BadGateway",
      layer: "Presentation",
    }),
  ).andThen((text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return okAsync(undefined);
    }

    return ResultAsync.fromPromise(
      (async () => JSON.parse(trimmed) as unknown)(),
      (cause) =>
        newRichError({
          cause,
          code: cliErrorCodes.CLI_API_REQUEST_FAILED,
          details: {
            action: "DecodeCliApiResponseBody",
            reason: "API response was not valid JSON.",
          },
          isOperational: true,
          kind: "BadGateway",
          layer: "Presentation",
        }),
    );
  });
}

function request(path: string, init: RequestInit): CliResultAsync<unknown> {
  return toAsync(getRuntimeConfig()).andThen((config) =>
    ensureAccessToken(config).andThen((token) => {
      const url = new URL(path, config.apiBaseUrl).toString();
      const headers = new Headers(init.headers);
      headers.set("authorization", `Bearer ${token.access_token}`);

      return ResultAsync.fromPromise(
        fetch(url, {
          ...init,
          headers,
        }),
        (cause) =>
          newRichError({
            cause,
            code: cliErrorCodes.CLI_API_REQUEST_FAILED,
            details: {
              action: "RequestCliApi",
              reason: "Failed to reach the API endpoint.",
            },
            isOperational: true,
            kind: "BadGateway",
            layer: "Presentation",
          }),
      ).andThen((response) => {
        if (response.ok) {
          return parseSuccessResponseBody(response, init.method);
        }

        return ResultAsync.fromPromise(response.text(), (cause) =>
          newRichError({
            cause,
            code: cliErrorCodes.CLI_API_REQUEST_FAILED,
            details: {
              action: "ReadCliApiErrorResponseBody",
              reason: "Failed to read API error response body.",
            },
            isOperational: true,
            kind: "BadGateway",
            layer: "Presentation",
          }),
        ).andThen((text) => {
          const parsed = parseApiError(text);
          const reason = parsed?.details?.reason;

          if (response.status === 401) {
            return clearTokenSet()
              .orElse(() => okAsync(undefined))
              .andThen(() =>
                errAsync(
                  newRichError({
                    code: parsed?.code ?? cliErrorCodes.CLI_API_UNAUTHORIZED,
                    details: {
                      action: "AuthorizeCliRequest",
                      reason:
                        reason ?? "Unauthorized. Please run `o3o auth login`.",
                    },
                    isOperational: true,
                    kind: "Unauthorized",
                    layer: "Presentation",
                  }),
                ),
              );
          }

          const fallback = response.statusText
            ? `API request failed (${response.status}): ${response.statusText}`
            : `API request failed (${response.status}).`;

          return errAsync(
            newRichError({
              code: parsed?.code ?? cliErrorCodes.CLI_API_REQUEST_FAILED,
              details: {
                action: "RequestCliApi",
                reason: reason ?? fallback,
              },
              isOperational: true,
              kind: mapHttpKind(response.status),
              layer: "Presentation",
            }),
          );
        });
      });
    }),
  );
}
