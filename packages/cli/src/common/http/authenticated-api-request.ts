import {
  err,
  errAsync,
  ok,
  okAsync,
  type Result,
  type ResultAsync,
} from "neverthrow";

import {
  newRichError,
  omitUndefined,
  type RichError,
} from "@o3osatoshi/toolkit";

import { refreshTokens } from "../../services/auth/oidc.service";
import {
  clearTokenSet,
  readTokenSet,
  writeTokenSet,
} from "../../services/auth/token-store.service";
import type { ApiErrorResponse } from "../contracts/api-error.schema";
import { apiErrorResponseSchema } from "../contracts/api-error.schema";
import { cliErrorCodes } from "../error-catalog";
import { resolveRuntimeEnv } from "../runtime-env";
import type { OidcTokenSet, RuntimeEnv } from "../types";
import { resolveApiRequestUrl } from "./api-url";
import { requestHttp } from "./http-request";
import { decodeHttpJson, readHttpText } from "./http-response";

// Refresh slightly before exp to avoid clock-skew races between CLI and API.
const ACCESS_TOKEN_REFRESH_SKEW_SECONDS = 60;

export function requestAuthenticatedApi(
  path: string,
  init: RequestInit,
): ResultAsync<unknown, RichError> {
  return resolveRuntimeEnv().asyncAndThen((env) =>
    ensureAccessToken(env).andThen((token) => {
      const url = resolveApiRequestUrl(env.apiBaseUrl, path);
      const headers = new Headers(init.headers);
      headers.set("authorization", `Bearer ${token.access_token}`);

      return requestHttp(
        url,
        {
          ...init,
          headers,
        },
        {
          action: "RequestCliApi",
          code: cliErrorCodes.CLI_API_REQUEST_FAILED,
          kind: "BadGateway",
          reason: "Failed to reach the API endpoint.",
        },
      ).andThen((response) => {
        if (response.ok) {
          return parseSuccessResponseBody(response, init.method);
        }

        return readHttpText(response, {
          action: "ReadCliApiErrorResponseBody",
          code: cliErrorCodes.CLI_API_REQUEST_FAILED,
          kind: "BadGateway",
          reason: "Failed to read API error response body.",
        }).andThen((text) => {
          const parsed = parseApiError(text);
          const reason = parsed?.details?.reason;

          if (response.status === 401) {
            return clearTokenSet()
              .orElse(() => ok(undefined))
              .andThen(() =>
                err(
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

export function requestAuthenticatedApiWithParser<T>(
  path: string,
  init: RequestInit,
  parser: (input: unknown) => Result<T, RichError>,
): ResultAsync<T, RichError> {
  return requestAuthenticatedApi(path, init).andThen(parser);
}

function ensureAccessToken(
  env: RuntimeEnv,
): ResultAsync<OidcTokenSet, RichError> {
  return readTokenSet().andThen((tokenSet) => {
    if (!tokenSet) {
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
      !tokenSet.expires_at ||
      tokenSet.expires_at > nowSeconds() + ACCESS_TOKEN_REFRESH_SKEW_SECONDS
    ) {
      return okAsync(tokenSet);
    }

    if (!tokenSet.refresh_token) {
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

    return refreshTokens(env.oidcConfig, tokenSet.refresh_token)
      .orElse((refreshError) =>
        clearTokenSet()
          .orElse(() => ok(undefined))
          .andThen(() =>
            err(
              newRichError({
                cause: refreshError,
                code: cliErrorCodes.CLI_API_UNAUTHORIZED,
                details: {
                  action: "RefreshCliAccessToken",
                  reason: "Session expired. Run `o3o auth login` again.",
                },
                isOperational: true,
                kind: "Unauthorized",
                layer: "Presentation",
              }),
            ),
          ),
      )
      .andThen((newTokenSet) => {
        const mergedTokenSet: OidcTokenSet = omitUndefined({
          ...tokenSet,
          ...newTokenSet,
          refresh_token: newTokenSet.refresh_token ?? tokenSet.refresh_token,
        });

        return writeTokenSet(mergedTokenSet).map(() => mergedTokenSet);
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

  return readHttpText(response, {
    action: "ReadCliApiResponseBody",
    code: cliErrorCodes.CLI_API_REQUEST_FAILED,
    kind: "BadGateway",
    reason: "Failed to read API response body.",
  }).andThen((text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return okAsync(undefined);
    }

    return decodeHttpJson(trimmed, {
      action: "DecodeCliApiResponseBody",
      code: cliErrorCodes.CLI_API_REQUEST_FAILED,
      kind: "BadGateway",
      reason: "API response was not valid JSON.",
    });
  });
}
