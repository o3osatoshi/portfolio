import { execFile } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { promisify } from "node:util";

import { err, errAsync, ok, okAsync, Result, ResultAsync } from "neverthrow";
import { z } from "zod";

import {
  isRichError,
  newRichError,
  omitUndefined,
  type RichError,
} from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import type { OidcConfig, OidcTokenSet } from "../../common/types";
import { makeCliSchemaParser } from "../../common/zod-validation";

const execFileAsync = promisify(execFile);

const oidcDiscoveryResponseSchema = z.object({
  authorization_endpoint: z.string().url(),
  device_authorization_endpoint: z.string().url().optional(),
  revocation_endpoint: z.string().url().optional(),
  token_endpoint: z.string().url(),
});

type OidcDiscoveryResponse = z.infer<typeof oidcDiscoveryResponseSchema>;

const oidcTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
});

type OidcTokenResponse = z.infer<typeof oidcTokenResponseSchema>;

const oidcDeviceAuthorizationResponseSchema = z.object({
  device_code: z.string().min(1),
  expires_in: z.number().min(1),
  interval: z.number().min(1).default(5),
  user_code: z.string().min(1),
  verification_uri: z.string().url(),
  verification_uri_complete: z.string().url().optional(),
});

type OidcDeviceAuthorizationResponse = z.infer<
  typeof oidcDeviceAuthorizationResponseSchema
>;

const oidcDeviceTokenErrorSchema = z.object({
  error: z.string().optional(),
});

const pkceCallbackQuerySchema = z.object({
  code: z.string().trim().min(1).optional(),
  error: z.string().trim().min(1).optional(),
  state: z.string().trim().min(1).optional(),
});

export type OidcLoginMode = "auto" | "device" | "pkce";

export type OidcLoginOptions = {
  onInfo?: ((message: string) => void) | undefined;
};

// Keep callback wait bounded to avoid dangling local servers in failed login flows.
const PKCE_CALLBACK_TIMEOUT_MS = 180_000;
const callbackHtmlStyles =
  'body{margin:40px auto;max-width:640px;padding:0 16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.5;color:#111827}h1{font-size:22px;line-height:1.3;margin:0 0 12px}.status-success{color:#14532d}.status-error{color:#991b1b}p{margin:8px 0}';
const callbackPageHeaders = {
  cacheControl: "no-store",
  contentSecurityPolicy:
    "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
  contentType: "text/html; charset=utf-8",
  pragma: "no-cache",
  xContentTypeOptions: "nosniff",
} as const;

type CallbackPageContent = {
  kind: "error" | "success";
  messageLine1: string;
  messageLine2: string;
  title: string;
};

type OidcErrorOptions = {
  action: string;
  code: string;
  kind?: RichError["kind"];
  reason: string;
};

type ParseSchemaOptions = {
  action: string;
  code: string;
  context: string;
  fallbackHint?: string | undefined;
};

export function oidcLogin(
  config: OidcConfig,
  mode: OidcLoginMode,
  options?: OidcLoginOptions,
): ResultAsync<OidcTokenSet, RichError> {
  return unsafeOidcLogin(config, mode, options).mapErr((cause) =>
    remapOidcError(cause, {
      action: "AuthenticateWithOidc",
      code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
      kind: "Unauthorized",
      reason: "OIDC login failed.",
    }),
  );
}

export function refreshTokens(
  config: OidcConfig,
  refreshToken: string,
): ResultAsync<OidcTokenSet, RichError> {
  return unsafeRefreshTokens(config, refreshToken).mapErr((cause) =>
    remapOidcError(cause, {
      action: "RefreshOidcTokens",
      code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
      kind: "Unauthorized",
      reason: "Failed to refresh access token.",
    }),
  );
}

export function revokeRefreshToken(
  config: OidcConfig,
  refreshToken: string,
): ResultAsync<void, RichError> {
  return revokeRefreshTokenUnsafe(config, refreshToken).mapErr((cause) =>
    remapOidcError(cause, {
      action: "RevokeOidcRefreshToken",
      code: cliErrorCodes.CLI_AUTH_REVOKE_FAILED,
      kind: "Internal",
      reason: "Failed to revoke refresh token.",
    }),
  );
}

function closeServer(server: ReturnType<typeof createServer>): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function closeServerResult(
  server: ReturnType<typeof createServer>,
): ResultAsync<void, RichError> {
  return ResultAsync.fromPromise(closeServer(server), (cause) =>
    newOidcError(
      {
        action: "ClosePkceCallbackServer",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "Internal",
        reason: "Failed to close PKCE callback server.",
      },
      cause,
    ),
  );
}

function discover(
  issuer: string,
  errorCode: string,
): ResultAsync<OidcDiscoveryResponse, RichError> {
  const normalized = issuer.endsWith("/") ? issuer.slice(0, -1) : issuer;
  return fetchResponse(
    `${normalized}/.well-known/openid-configuration`,
    undefined,
    {
      action: "FetchOidcDiscoveryDocument",
      code: errorCode,
      kind: "BadGateway",
      reason: "Failed to fetch OIDC discovery document.",
    },
  )
    .andThen((response) =>
      expectOkResponse(response, {
        action: "FetchOidcDiscoveryDocument",
        code: errorCode,
        kind: "BadGateway",
        reason: "Failed to fetch OIDC discovery document.",
      }),
    )
    .andThen((response) =>
      readJson(response, {
        action: "ReadOidcDiscoveryResponseBody",
        code: errorCode,
        kind: "BadGateway",
        reason: "Failed to read OIDC discovery response body.",
      }),
    )
    .andThen((json) =>
      parseWithSchemaAsync(oidcDiscoveryResponseSchema, json, {
        action: "DecodeOidcDiscoveryResponse",
        code: errorCode,
        context: "OIDC discovery response",
        fallbackHint: "Verify OIDC issuer configuration and retry.",
      }),
    );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function expectOkResponse(
  response: Response,
  options: OidcErrorOptions,
): ResultAsync<Response, RichError> {
  if (!response.ok) {
    return errAsync(
      newOidcError({
        ...options,
        reason: `${options.reason} (${response.status})`,
      }),
    );
  }
  return okAsync(response);
}

function fetchResponse(
  url: string,
  init?: RequestInit,
  options?: OidcErrorOptions,
): ResultAsync<Response, RichError> {
  const errorOptions = options ?? {
    action: "FetchOidcEndpoint",
    code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
    kind: "BadGateway" as const,
    reason: "Failed to reach the OIDC endpoint.",
  };

  return ResultAsync.fromPromise(fetch(url, init), (cause) =>
    newOidcError(errorOptions, cause),
  );
}

function info(options: OidcLoginOptions | undefined, message: string): void {
  options?.onInfo?.(message);
}

function loginByDeviceCode(
  config: OidcConfig,
  discovery: OidcDiscoveryResponse,
  options?: OidcLoginOptions,
): ResultAsync<OidcTokenSet, RichError> {
  if (!discovery.device_authorization_endpoint) {
    return errAsync(
      newOidcError({
        action: "RequestOidcDeviceAuthorization",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "Unauthorized",
        reason: "The issuer does not expose a device authorization endpoint.",
      }),
    );
  }

  const requestBody = new URLSearchParams({
    client_id: config.clientId,
    audience: config.audience,
    scope:
      "openid profile email offline_access transactions:read transactions:write",
  });

  return fetchResponse(
    discovery.device_authorization_endpoint,
    {
      body: requestBody,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    },
    {
      action: "RequestOidcDeviceAuthorization",
      code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
      kind: "BadGateway",
      reason: "Device authorization failed.",
    },
  )
    .andThen((response) =>
      expectOkResponse(response, {
        action: "RequestOidcDeviceAuthorization",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "BadGateway",
        reason: "Device authorization failed.",
      }),
    )
    .andThen((response) =>
      readJson(response, {
        action: "ReadOidcDeviceAuthorizationResponseBody",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "BadGateway",
        reason: "Failed to read OIDC device authorization response body.",
      }),
    )
    .andThen((json) =>
      parseWithSchemaAsync(oidcDeviceAuthorizationResponseSchema, json, {
        action: "DecodeOidcDeviceCodeResponse",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        context: "OIDC device authorization response",
        fallbackHint: "Retry `o3o auth login --mode device`.",
      }),
    )
    .andThen((deviceCode) => {
      const url =
        deviceCode.verification_uri_complete ?? deviceCode.verification_uri;
      if (deviceCode.verification_uri_complete) {
        info(options, `Open this URL to continue login:\n${url}`);
      } else {
        info(
          options,
          `Open ${deviceCode.verification_uri} and enter code: ${deviceCode.user_code}`,
        );
      }

      return pollDeviceToken(
        config,
        discovery,
        deviceCode,
        deviceCode.interval,
        Date.now() + deviceCode.expires_in * 1000,
      );
    });
}

function loginByPkce(
  config: OidcConfig,
  discovery: OidcDiscoveryResponse,
): ResultAsync<OidcTokenSet, RichError> {
  const redirectHost = "127.0.0.1";
  const redirectUri = `http://${redirectHost}:${config.redirectPort}/callback`;
  const state = randomBytes(16).toString("hex");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const server = createServer();
  let disposeCallbackListener: (() => void) | undefined;

  return startCallbackServer(
    server,
    redirectHost,
    config.redirectPort,
    redirectUri,
  ).andThen(() => {
    const codePromise = new Promise<string>((resolve, reject) => {
      let callbackDisposed = false;
      const onRequest = (req: IncomingMessage, res: ServerResponse) => {
        const base = `http://${redirectHost}:${config.redirectPort}`;
        const url = new URL(req.url ?? "/", base);
        if (url.pathname !== "/callback") {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }

        const callbackQueryResult = parseWithSchema(
          pkceCallbackQuerySchema,
          {
            code: url.searchParams.get("code") ?? undefined,
            error: url.searchParams.get("error") ?? undefined,
            state: url.searchParams.get("state") ?? undefined,
          },
          {
            action: "DecodePkceCallbackQuery",
            code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
            context: "PKCE callback query",
            fallbackHint: "Retry `o3o auth login --mode pkce`.",
          },
        );

        if (callbackQueryResult.isErr()) {
          sendCallbackPage(res, {
            kind: "error",
            messageLine1: "Authorization was not completed.",
            messageLine2:
              "Return to your terminal and run o3o auth login again.",
            title: "Sign-in failed",
          });
          cleanup();
          reject(callbackQueryResult.error);
          return;
        }

        const callbackQuery = callbackQueryResult.value;
        if (callbackQuery.error) {
          sendCallbackPage(res, {
            kind: "error",
            messageLine1: "Authorization was not completed.",
            messageLine2:
              "Return to your terminal and run o3o auth login again.",
            title: "Sign-in failed",
          });
          cleanup();
          reject(
            newOidcError({
              action: "ValidatePkceCallback",
              code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
              kind: "Unauthorized",
              reason: "OAuth authorization failed.",
            }),
          );
          return;
        }

        if (!callbackQuery.code || callbackQuery.state !== state) {
          sendCallbackPage(res, {
            kind: "error",
            messageLine1: "Authorization was not completed.",
            messageLine2:
              "Return to your terminal and run o3o auth login again.",
            title: "Sign-in failed",
          });
          cleanup();
          reject(
            newOidcError({
              action: "ValidatePkceCallback",
              code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
              kind: "Unauthorized",
              reason: "OAuth callback validation failed.",
            }),
          );
          return;
        }

        sendCallbackPage(res, {
          kind: "success",
          messageLine1:
            "You can close this window and return to your terminal.",
          messageLine2:
            "Continue in the same terminal where you ran o3o auth login.",
          title: "Sign-in complete",
        });
        cleanup();
        resolve(callbackQuery.code);
      };

      const cleanup = () => {
        if (callbackDisposed) {
          return;
        }
        callbackDisposed = true;
        clearTimeout(timeout);
        server.off("request", onRequest);
      };
      disposeCallbackListener = cleanup;

      const timeout = setTimeout(() => {
        cleanup();
        reject(
          newOidcError({
            action: "AwaitPkceCallback",
            code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
            kind: "Unauthorized",
            reason: "Timed out waiting for browser callback.",
          }),
        );
      }, PKCE_CALLBACK_TIMEOUT_MS);

      server.on("request", onRequest);
    });

    const authorizationUrl = new URL(discovery.authorization_endpoint);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", config.clientId);
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set(
      "scope",
      "openid profile email offline_access transactions:read transactions:write",
    );
    authorizationUrl.searchParams.set("audience", config.audience);
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", challenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    return openBrowser(authorizationUrl.toString(), redirectUri)
      .andThen(() =>
        ResultAsync.fromPromise(codePromise, (cause) =>
          isRichError(cause)
            ? cause
            : newOidcError(
                {
                  action: "AwaitPkceCallback",
                  code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                  kind: "Unauthorized",
                  reason: toReason(
                    cause,
                    "Timed out waiting for browser callback.",
                  ),
                },
                cause,
              ),
        ),
      )
      .andThen((code) => {
        disposeCallbackListener?.();

        return closeServerResult(server).andThen(() => {
          const body = new URLSearchParams({
            client_id: config.clientId,
            code,
            code_verifier: verifier,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          });

          return fetchResponse(
            discovery.token_endpoint,
            {
              body,
              headers: {
                "content-type": "application/x-www-form-urlencoded",
              },
              method: "POST",
            },
            {
              action: "ExchangePkceAuthorizationCode",
              code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
              kind: "BadGateway",
              reason: "Token exchange failed.",
            },
          )
            .andThen((response) =>
              expectOkResponse(response, {
                action: "ExchangePkceAuthorizationCode",
                code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                kind: "BadGateway",
                reason: "Token exchange failed.",
              }),
            )
            .andThen((response) =>
              readJson(response, {
                action: "ReadOidcTokenResponseBody",
                code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                kind: "BadGateway",
                reason: "Failed to read OIDC token response body.",
              }),
            )
            .andThen((json) =>
              parseWithSchemaAsync(oidcTokenResponseSchema, json, {
                action: "DecodeOidcTokenResponseFromPkceFlow",
                code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                context: "OIDC token response",
                fallbackHint: "Retry `o3o auth login --mode pkce`.",
              }),
            )
            .map((token) => toTokenSetWithExpiry(token));
        });
      })
      .orElse((cause) => {
        // Prevent unhandled rejections if browser launch fails before callback.
        void codePromise.catch(() => undefined);
        disposeCallbackListener?.();

        return closeServerResult(server)
          .orElse(() => ok(undefined))
          .andThen(() => err(cause));
      });
  });
}

function newOidcError(options: OidcErrorOptions, cause?: unknown): RichError {
  return newRichError({
    cause,
    code: options.code,
    details: {
      action: options.action,
      reason: options.reason,
    },
    isOperational: true,
    kind: options.kind ?? "Internal",
    layer: "Presentation",
  });
}

function openBrowser(
  url: string,
  redirectUri: string,
): ResultAsync<void, RichError> {
  const openCommand =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "explorer.exe"
        : "xdg-open";

  return ResultAsync.fromPromise(execFileAsync(openCommand, [url]), (cause) =>
    newOidcError(
      {
        action: "OpenOidcBrowser",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "Internal",
        reason: `Failed to open the system browser for PKCE login (${redirectUri}).`,
      },
      cause,
    ),
  ).map(() => undefined);
}

function parseJsonSafely(text: string): null | unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const parseJson = Result.fromThrowable(
    (value: string) => JSON.parse(value),
    () => null,
  );
  const parsed = parseJson(trimmed);
  return parsed.isOk() ? parsed.value : null;
}

function parseWithSchema<T extends z.ZodType>(
  schema: T,
  input: unknown,
  options: ParseSchemaOptions,
): Result<z.infer<T>, RichError> {
  return makeCliSchemaParser(schema, options)(input);
}

function parseWithSchemaAsync<T extends z.ZodType>(
  schema: T,
  input: unknown,
  options: ParseSchemaOptions,
): ResultAsync<z.infer<T>, RichError> {
  const parsed = parseWithSchema(schema, input, options);
  return parsed.isOk() ? okAsync(parsed.value) : errAsync(parsed.error);
}

function pollDeviceToken(
  config: OidcConfig,
  discovery: OidcDiscoveryResponse,
  deviceCode: OidcDeviceAuthorizationResponse,
  interval: number,
  expiresAt: number,
): ResultAsync<OidcTokenSet, RichError> {
  if (Date.now() >= expiresAt) {
    return errAsync(
      newOidcError({
        action: "PollOidcDeviceToken",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "Unauthorized",
        reason: "Device login timed out.",
      }),
    );
  }

  return ResultAsync.fromSafePromise(sleep(interval * 1000)).andThen(() => {
    const tokenBody = new URLSearchParams({
      client_id: config.clientId,
      device_code: deviceCode.device_code,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    });

    return fetchResponse(
      discovery.token_endpoint,
      {
        body: tokenBody,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
      {
        action: "PollOidcDeviceToken",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "BadGateway",
        reason: "Failed to poll OIDC device token.",
      },
    )
      .andThen((tokenResponse) =>
        readText(tokenResponse, {
          action: "ReadOidcTokenResponseBody",
          code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
          kind: "BadGateway",
          reason: "Failed to read OIDC token response body.",
        }).map((responseText) => ({
          json: parseJsonSafely(responseText),
          responseText,
          tokenResponse,
        })),
      )
      .andThen(({ json, responseText, tokenResponse }) => {
        if (tokenResponse.ok) {
          if (json === null) {
            return errAsync(
              newOidcError({
                action: "DeserializeOidcTokenResponseBody",
                code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                kind: "BadGateway",
                reason: `Device login failed: received invalid JSON from token endpoint (status ${tokenResponse.status}).`,
              }),
            );
          }

          return parseWithSchemaAsync(oidcTokenResponseSchema, json, {
            action: "DecodeOidcTokenResponseFromDeviceFlow",
            code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
            context: "OIDC token response",
            fallbackHint: "Retry `o3o auth login --mode device`.",
          }).map((token) => toTokenSetWithExpiry(token));
        }

        if (json === null) {
          const detail = responseText.trim() || "no response body";
          return errAsync(
            newOidcError({
              action: "PollOidcDeviceToken",
              code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
              kind: "Unauthorized",
              reason: `Device login failed with status ${tokenResponse.status}: ${detail}`,
            }),
          );
        }

        const parsedError = oidcDeviceTokenErrorSchema.safeParse(json);
        const error =
          parsedError.success && parsedError.data.error
            ? parsedError.data.error
            : "unknown_error";

        if (error === "authorization_pending") {
          return pollDeviceToken(
            config,
            discovery,
            deviceCode,
            interval,
            expiresAt,
          );
        }

        if (error === "slow_down") {
          return pollDeviceToken(
            config,
            discovery,
            deviceCode,
            interval + 5,
            expiresAt,
          );
        }

        if (error === "expired_token") {
          return errAsync(
            newOidcError({
              action: "PollOidcDeviceToken",
              code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
              kind: "Unauthorized",
              reason: "Device login expired. Please retry.",
            }),
          );
        }

        return errAsync(
          newOidcError({
            action: "PollOidcDeviceToken",
            code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
            kind: "Unauthorized",
            reason: `Device login failed: ${error}`,
          }),
        );
      });
  });
}

function readJson(
  response: Response,
  options: OidcErrorOptions,
): ResultAsync<unknown, RichError> {
  return ResultAsync.fromPromise(response.json(), (cause) =>
    newOidcError(options, cause),
  );
}

function readText(
  response: Response,
  options: OidcErrorOptions,
): ResultAsync<string, RichError> {
  return ResultAsync.fromPromise(response.text(), (cause) =>
    newOidcError(options, cause),
  );
}

function remapOidcError(
  cause: RichError,
  options: OidcErrorOptions,
): RichError {
  const reason = toReason(cause, options.reason);
  const kind = options.kind ?? cause.kind;

  if (
    cause.code === options.code &&
    cause.details?.action === options.action &&
    cause.details?.reason === reason &&
    cause.kind === kind &&
    cause.layer === "Presentation"
  ) {
    return cause;
  }

  return newRichError({
    cause: cause.cause,
    code: options.code,
    details: {
      ...cause.details,
      action: options.action,
      reason,
    },
    i18n: cause.i18n,
    isOperational: cause.isOperational,
    kind,
    layer: "Presentation",
    meta: cause.meta,
  });
}

function revokeRefreshTokenUnsafe(
  config: OidcConfig,
  refreshToken: string,
): ResultAsync<void, RichError> {
  return discover(config.issuer, cliErrorCodes.CLI_AUTH_REVOKE_FAILED).andThen(
    (discovery) => {
      if (!discovery.revocation_endpoint) {
        return okAsync(undefined);
      }

      const body = new URLSearchParams({
        client_id: config.clientId,
        token: refreshToken,
        token_type_hint: "refresh_token",
      });

      return fetchResponse(
        discovery.revocation_endpoint,
        {
          body,
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        },
        {
          action: "RevokeOidcRefreshToken",
          code: cliErrorCodes.CLI_AUTH_REVOKE_FAILED,
          kind: "BadGateway",
          reason: "Revocation request failed.",
        },
      )
        .andThen((response) =>
          expectOkResponse(response, {
            action: "RevokeOidcRefreshToken",
            code: cliErrorCodes.CLI_AUTH_REVOKE_FAILED,
            kind: "BadGateway",
            reason: "Revocation request failed.",
          }),
        )
        .map(() => undefined);
    },
  );
}

function sendCallbackPage(
  res: ServerResponse,
  input: CallbackPageContent,
): void {
  const headingClass =
    input.kind === "success" ? "status-success" : "status-error";
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
    <style>${callbackHtmlStyles}</style>
  </head>
  <body>
    <h1 class="${headingClass}">${escapeHtml(input.title)}</h1>
    <p>${escapeHtml(input.messageLine1)}</p>
    <p>${escapeHtml(input.messageLine2)}</p>
  </body>
</html>`;

  res.statusCode = 200;
  res.setHeader("cache-control", callbackPageHeaders.cacheControl);
  res.setHeader(
    "content-security-policy",
    callbackPageHeaders.contentSecurityPolicy,
  );
  res.setHeader("content-type", callbackPageHeaders.contentType);
  res.setHeader("pragma", callbackPageHeaders.pragma);
  res.setHeader(
    "x-content-type-options",
    callbackPageHeaders.xContentTypeOptions,
  );
  res.end(html);
}

function shouldFallbackToDeviceFlow(error: unknown): boolean {
  if (isRichError(error)) {
    return (
      error.details?.action === "StartPkceCallbackServer" ||
      error.details?.action === "AwaitPkceCallback" ||
      error.details?.action === "OpenOidcBrowser"
    );
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.startsWith("Failed to start PKCE callback server on ") ||
    error.message === "Timed out waiting for browser callback." ||
    error.message.startsWith("Failed to open the system browser for PKCE login")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startCallbackServer(
  server: ReturnType<typeof createServer>,
  redirectHost: string,
  redirectPort: number,
  redirectUri: string,
): ResultAsync<void, RichError> {
  return ResultAsync.fromPromise(
    new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        reject(
          newOidcError(
            {
              action: "StartPkceCallbackServer",
              code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
              kind: "Internal",
              reason: `Failed to start PKCE callback server on ${redirectUri}. Ensure the port is free and retry.`,
            },
            error,
          ),
        );
      };

      server.once("error", onError);
      server.listen(redirectPort, redirectHost, () => {
        server.off("error", onError);
        resolve();
      });
    }),
    (cause) =>
      isRichError(cause)
        ? cause
        : newOidcError(
            {
              action: "StartPkceCallbackServer",
              code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
              kind: "Internal",
              reason: `Failed to start PKCE callback server on ${redirectUri}. Ensure the port is free and retry.`,
            },
            cause,
          ),
  );
}

function toReason(cause: unknown, fallback: string): string {
  if (isRichError(cause) && cause.details?.reason?.trim()) {
    return cause.details.reason;
  }
  if (cause instanceof Error && cause.message.trim().length > 0) {
    return cause.message;
  }
  return fallback;
}

function toTokenSetWithExpiry(token: OidcTokenResponse): OidcTokenSet {
  const expiresAt =
    token.expires_in !== undefined
      ? Math.floor(Date.now() / 1000) + token.expires_in
      : undefined;

  return omitUndefined({
    access_token: token.access_token,
    expires_at: expiresAt,
    refresh_token: token.refresh_token,
    scope: token.scope,
    token_type: token.token_type,
  });
}

function unsafeOidcLogin(
  config: OidcConfig,
  mode: OidcLoginMode,
  options?: OidcLoginOptions,
): ResultAsync<OidcTokenSet, RichError> {
  return discover(config.issuer, cliErrorCodes.CLI_AUTH_LOGIN_FAILED).andThen(
    (discovery) => {
      switch (mode) {
        case "device":
          return loginByDeviceCode(config, discovery, options);
        case "pkce":
          return loginByPkce(config, discovery);
        case "auto":
          return loginByPkce(config, discovery).orElse((error) => {
            if (!shouldFallbackToDeviceFlow(error)) {
              return errAsync(error);
            }
            return loginByDeviceCode(config, discovery, options);
          });
      }
    },
  );
}

function unsafeRefreshTokens(
  config: OidcConfig,
  refreshToken: string,
): ResultAsync<OidcTokenSet, RichError> {
  return discover(config.issuer, cliErrorCodes.CLI_AUTH_REFRESH_FAILED).andThen(
    (discovery) => {
      const body = new URLSearchParams({
        client_id: config.clientId,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });

      return fetchResponse(
        discovery.token_endpoint,
        {
          body,
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        },
        {
          action: "RefreshOidcTokens",
          code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
          kind: "BadGateway",
          reason: "Refresh token request failed.",
        },
      )
        .andThen((response) =>
          expectOkResponse(response, {
            action: "RefreshOidcTokens",
            code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
            kind: "BadGateway",
            reason: "Refresh token request failed.",
          }),
        )
        .andThen((response) =>
          readJson(response, {
            action: "ReadOidcTokenResponseBody",
            code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
            kind: "BadGateway",
            reason: "Failed to read OIDC token response body.",
          }),
        )
        .andThen((json) =>
          parseWithSchemaAsync(oidcTokenResponseSchema, json, {
            action: "DecodeOidcTokenResponseFromRefreshFlow",
            code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
            context: "OIDC token response",
            fallbackHint: "Run `o3o auth login` and retry.",
          }),
        )
        .map((token) => toTokenSetWithExpiry(token));
    },
  );
}
