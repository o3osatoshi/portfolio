import { errAsync, okAsync, ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import { refreshToken } from "../../services/auth/oidc.service";
import {
  clearTokenSet,
  readTokenSet,
  writeTokenSet,
} from "../../services/auth/token-store.service";
import type { ApiErrorResponse } from "../contracts/api-error.schema";
import { apiErrorResponseSchema } from "../contracts/api-error.schema";
import { cliErrorCodes } from "../error-catalog";
import { toAsync } from "../result";
import { getRuntimeConfig } from "../runtime-config";
import type { CliRuntimeConfig, TokenSet } from "../types";
import { resolveApiRequestUrl } from "./api-url";

// Refresh slightly before exp to avoid clock-skew races between CLI and API.
const ACCESS_TOKEN_REFRESH_SKEW_SECONDS = 60;

export function requestAuthenticatedApi(
  path: string,
  init: RequestInit,
): ResultAsync<unknown, RichError> {
  return toAsync(getRuntimeConfig()).andThen((config) =>
    ensureAccessToken(config).andThen((token) => {
      const url = resolveApiRequestUrl(config.apiBaseUrl, path);
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

function ensureAccessToken(
  config: CliRuntimeConfig,
): ResultAsync<TokenSet, RichError> {
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

    return refreshToken(config.oidc, token.refresh_token)
      .orElse((refreshError) =>
        clearTokenSet()
          .orElse(() => okAsync(undefined))
          .andThen(() =>
            errAsync(
              newRichError({
                cause: refreshError,
                code: cliErrorCodes.CLI_API_UNAUTHORIZED,
                details: {
                  action: "RefreshAccessToken",
                  reason: "Session expired. Run `o3o auth login` again.",
                },
                isOperational: true,
                kind: "Unauthorized",
                layer: "Presentation",
              }),
            ),
          ),
      )
      .andThen((refreshed) => {
        const refreshTokenValue =
          refreshed.refresh_token ?? token.refresh_token;
        const merged: TokenSet = {
          ...token,
          ...refreshed,
          ...(refreshTokenValue !== undefined
            ? { refresh_token: refreshTokenValue }
            : {}),
        };

        return writeTokenSet(merged).map(() => merged);
      });
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

function parseApiError(text: string): ApiErrorResponse | null {
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
): ResultAsync<undefined | unknown, RichError> {
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
