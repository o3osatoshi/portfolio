import { execFile } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { promisify } from "node:util";

import { err, ok, ResultAsync } from "neverthrow";

import { isRichError, type RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import { requestHttpJsonWithParser } from "../../common/http/http-json";
import type { OidcConfig, OidcTokenSet } from "../../common/types";
import { makeCliSchemaParser } from "../../common/zod-validation";
import {
  type OidcDiscoveryResponse,
  oidcTokenResponseSchema,
  pkceCallbackQuerySchema,
} from "./contracts/oidc.schema";
import { newOidcError, toReason } from "./oidc-error";
import { toTokenSetWithExpiry } from "./oidc-token-set";

const execFileAsync = promisify(execFile);

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

export function loginByPkce(
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

        const callbackQueryResult = makeCliSchemaParser(
          pkceCallbackQuerySchema,
          {
            action: "DecodePkceCallbackQuery",
            code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
            context: "PKCE callback query",
            fallbackHint: "Retry `o3o auth login --mode pkce`.",
          },
        )({
          code: url.searchParams.get("code") ?? undefined,
          error: url.searchParams.get("error") ?? undefined,
          state: url.searchParams.get("state") ?? undefined,
        });

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

          return requestHttpJsonWithParser(
            discovery.token_endpoint,
            {
              body,
              headers: {
                "content-type": "application/x-www-form-urlencoded",
              },
              method: "POST",
            },
            {
              parser: makeCliSchemaParser(oidcTokenResponseSchema, {
                action: "DecodeOidcTokenResponseFromPkceFlow",
                code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                context: "OIDC token response",
                fallbackHint: "Retry `o3o auth login --mode pkce`.",
              }),
              read: {
                action: "ReadOidcTokenResponseBody",
                code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                kind: "BadGateway",
                reason: "Failed to read OIDC token response body.",
              },
              request: {
                action: "ExchangePkceAuthorizationCode",
                code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                kind: "BadGateway",
                reason: "Token exchange failed.",
              },
            },
          ).map(toTokenSetWithExpiry);
        });
      })
      .orElse((cause) => {
        void codePromise.catch(() => undefined);
        disposeCallbackListener?.();

        return closeServerResult(server)
          .orElse(() => ok(undefined))
          .andThen(() => err(cause));
      });
  });
}

export function shouldFallbackToDeviceFlow(error: unknown): boolean {
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
