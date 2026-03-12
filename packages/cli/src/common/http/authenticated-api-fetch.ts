import { err, errAsync, ok, okAsync, type ResultAsync } from "neverthrow";
import type { z } from "zod";

import {
  buildHttpErrorFromResponse,
  decodeJsonText,
  fetchResponse,
  httpStatusToKind,
  makeSchemaParser,
  newRichError,
  omitUndefined,
  readResponseText,
  type RichError,
} from "@o3osatoshi/toolkit";

import { refreshTokens } from "../../services/auth/oidc.service";
import {
  clearTokenSet,
  persistTokenSet,
  readTokenSet,
} from "../../services/auth/token-store.service";
import type { ApiErrorResponse } from "../contracts/api-error.schema";
import { apiErrorResponseSchema } from "../contracts/api-error.schema";
import { cliErrorCodes } from "../error-catalog";
import { resolveRuntimeEnv } from "../runtime-env";
import type { OidcTokenSet, RuntimeEnv } from "../types";
import { resolveApiRequestUrl } from "./api-url";
import { runJsonFetch } from "./fetch";

// Refresh slightly before exp to avoid clock-skew races between CLI and API.
const ACCESS_TOKEN_REFRESH_SKEW_SECONDS = 60;

type FetchAuthedJsonDecode<T extends z.ZodType = z.ZodType<unknown>> = {
  context: FetchAuthedJsonDecodeContext;
  schema: T;
};

type FetchAuthedJsonDecodeContext = {
  action: string;
  layer?: RichError["layer"] | undefined;
};

type FetchAuthedJsonInputBase = {
  body?: RequestInit["body"];
  headers?: RequestInit["headers"];
  method?: string;
  path: string;
};

export function fetchAuthedJson<T extends z.ZodType>(
  request: {
    decode: FetchAuthedJsonDecode<T>;
  } & FetchAuthedJsonInputBase,
): ResultAsync<z.infer<T>, RichError>;
export function fetchAuthedJson(
  request: FetchAuthedJsonInputBase,
): ResultAsync<unknown, RichError>;
export function fetchAuthedJson<T extends z.ZodType>(
  request: {
    decode?: FetchAuthedJsonDecode<T> | undefined;
  } & FetchAuthedJsonInputBase,
): ResultAsync<unknown | z.infer<T>, RichError> {
  return runJsonFetch(
    (init) => fetchAuthenticatedApi(request.path, init),
    request,
    (json, decode) =>
      makeSchemaParser(decode.schema, {
        action: decode.context.action,
        ...(decode.context.layer !== undefined
          ? { layer: decode.context.layer }
          : {}),
      })(json),
  );
}
export function fetchAuthenticatedApi(
  path: string,
  init: RequestInit,
): ResultAsync<unknown, RichError> {
  return resolveRuntimeEnv().asyncAndThen((env) =>
    ensureAccessToken(env).andThen((token) => {
      const url = resolveApiRequestUrl(env.apiBaseUrl, path);
      const headers = new Headers(init.headers);
      headers.set("authorization", `Bearer ${token.access_token}`);

      return fetchResponse(
        omitUndefined({
          body: init.body,
          headers,
          method: init.method,
          url,
        }),
        {
          error: {
            action: "FetchCliApi",
            code: cliErrorCodes.CLI_API_REQUEST_FAILED,
            kind: "BadGateway",
            layer: "Presentation",
            reason: "Failed to reach the API endpoint.",
          },
        },
      ).andThen((response) => {
        if (response.ok) {
          return parseSuccessResponseBody(response, init.method);
        }

        return readResponseText(response, {
          action: "ReadCliApiErrorResponseBody",
          code: cliErrorCodes.CLI_API_REQUEST_FAILED,
          kind: "BadGateway",
          layer: "Presentation",
          reason: "Failed to read API error response body.",
        }).andThen((text) => {
          const parsed = parseApiError(text);
          const reason = parsed?.details?.reason;

          if (response.status === 401) {
            return clearTokenSet()
              .orElse(() => ok())
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

          return err(
            buildHttpErrorFromResponse(response, text, {
              action: "FetchCliApi",
              code: parsed?.code ?? cliErrorCodes.CLI_API_REQUEST_FAILED,
              kind: httpStatusToKind(response.status),
              layer: "Presentation",
              reason: reason ?? "API request failed.",
            }),
          );
        });
      });
    }),
  );
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
      .orElse((cause) =>
        clearTokenSet()
          .orElse(() => ok())
          .andThen(() =>
            err(
              newRichError({
                cause,
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

        return persistTokenSet(mergedTokenSet).map(() => mergedTokenSet);
      });
  });
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

  return readResponseText(response, {
    action: "ReadCliApiResponseBody",
    code: cliErrorCodes.CLI_API_REQUEST_FAILED,
    kind: "BadGateway",
    layer: "Presentation",
    reason: "Failed to read API response body.",
  }).andThen((text) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return okAsync(undefined);
    }

    return decodeJsonText(trimmed, {
      action: "DecodeCliApiResponseBody",
      code: cliErrorCodes.CLI_API_REQUEST_FAILED,
      kind: "BadGateway",
      layer: "Presentation",
      reason: "API response was not valid JSON.",
    });
  });
}
