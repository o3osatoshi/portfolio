import { execFile } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { promisify } from "node:util";

import { ResultAsync } from "neverthrow";
import { z } from "zod";

import { type RichError, toRichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./cli-error-catalog";
import type { OidcConfig, TokenSet } from "./types";

const execFileAsync = promisify(execFile);

const discoverySchema = z.object({
  authorization_endpoint: z.string().url(),
  device_authorization_endpoint: z.string().url().optional(),
  revocation_endpoint: z.string().url().optional(),
  token_endpoint: z.string().url(),
});

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
});

const deviceCodeSchema = z.object({
  device_code: z.string().min(1),
  expires_in: z.number().min(1),
  interval: z.number().min(1).default(5),
  user_code: z.string().min(1),
  verification_uri: z.string().url(),
  verification_uri_complete: z.string().url().optional(),
});

const deviceTokenErrorSchema = z.object({
  error: z.string().optional(),
});

export type LoginMode = "auto" | "device" | "pkce";
// Keep callback wait bounded to avoid dangling local servers in failed login flows.
const PKCE_CALLBACK_TIMEOUT_MS = 180_000;

export function loginWithOidc(
  config: OidcConfig,
  mode: LoginMode,
): ResultAsync<TokenSet, RichError> {
  return ResultAsync.fromPromise(loginWithOidcUnsafe(config, mode), (cause) =>
    toRichError(cause, {
      code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
      details: {
        action: "LoginWithOidc",
        reason: toReason(cause, "OIDC login failed."),
      },
      isOperational: true,
      kind: "Unauthorized",
      layer: "Presentation",
    }),
  );
}

export function refreshToken(
  config: OidcConfig,
  refreshTokenValue: string,
): ResultAsync<TokenSet, RichError> {
  return ResultAsync.fromPromise(
    refreshTokenUnsafe(config, refreshTokenValue),
    (cause) =>
      toRichError(cause, {
        code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
        details: {
          action: "RefreshOidcToken",
          reason: toReason(cause, "Failed to refresh access token."),
        },
        isOperational: true,
        kind: "Unauthorized",
        layer: "Presentation",
      }),
  );
}

export function revokeRefreshToken(
  config: OidcConfig,
  refreshTokenValue: string,
): ResultAsync<void, RichError> {
  return ResultAsync.fromPromise(
    revokeRefreshTokenUnsafe(config, refreshTokenValue),
    (cause) =>
      toRichError(cause, {
        code: cliErrorCodes.CLI_AUTH_REVOKE_FAILED,
        details: {
          action: "RevokeOidcRefreshToken",
          reason: toReason(cause, "Failed to revoke refresh token."),
        },
        isOperational: true,
        kind: "Internal",
        layer: "Presentation",
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

async function discover(issuer: string) {
  const normalized = issuer.endsWith("/") ? issuer.slice(0, -1) : issuer;
  const res = await fetch(`${normalized}/.well-known/openid-configuration`);
  if (!res.ok) {
    throw new Error(`Failed to fetch OIDC discovery document (${res.status})`);
  }
  const json = await res.json();
  return discoverySchema.parse(json);
}

async function loginByDeviceCode(
  config: OidcConfig,
  discovery: z.infer<typeof discoverySchema>,
): Promise<TokenSet> {
  if (!discovery.device_authorization_endpoint) {
    throw new Error(
      "The issuer does not expose a device authorization endpoint.",
    );
  }

  const requestBody = new URLSearchParams({
    client_id: config.clientId,
    audience: config.audience,
    scope:
      "openid profile email offline_access transactions:read transactions:write",
  });

  const deviceResponse = await fetch(discovery.device_authorization_endpoint, {
    body: requestBody,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!deviceResponse.ok) {
    throw new Error(`Device authorization failed (${deviceResponse.status})`);
  }

  const deviceJson = await deviceResponse.json();
  const deviceCode = deviceCodeSchema.parse(deviceJson);

  const url =
    deviceCode.verification_uri_complete ?? deviceCode.verification_uri;
  if (deviceCode.verification_uri_complete) {
    console.log(`Open this URL to continue login:\n${url}`);
  } else {
    console.log(
      `Open ${deviceCode.verification_uri} and enter code: ${deviceCode.user_code}`,
    );
  }

  let interval = deviceCode.interval;
  const expiresAt = Date.now() + deviceCode.expires_in * 1000;

  while (Date.now() < expiresAt) {
    await sleep(interval * 1000);

    const tokenBody = new URLSearchParams({
      client_id: config.clientId,
      device_code: deviceCode.device_code,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    });

    const tokenResponse = await fetch(discovery.token_endpoint, {
      body: tokenBody,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const responseText = await tokenResponse.text();
    const json = parseJsonSafely(responseText);
    if (tokenResponse.ok) {
      if (json === null) {
        throw new Error(
          `Device login failed: received invalid JSON from token endpoint (status ${tokenResponse.status}).`,
        );
      }
      return withExpiry(tokenSchema.parse(json));
    }

    if (json === null) {
      const detail = responseText.trim() || "no response body";
      throw new Error(
        `Device login failed with status ${tokenResponse.status}: ${detail}`,
      );
    }

    const parsedError = deviceTokenErrorSchema.safeParse(json);
    const error =
      parsedError.success && parsedError.data.error
        ? parsedError.data.error
        : "unknown_error";
    if (error === "authorization_pending") {
      continue;
    }
    if (error === "slow_down") {
      interval += 5;
      continue;
    }
    if (error === "expired_token") {
      throw new Error("Device login expired. Please retry.");
    }

    throw new Error(`Device login failed: ${error}`);
  }

  throw new Error("Device login timed out.");
}

async function loginByPkce(
  config: OidcConfig,
  discovery: z.infer<typeof discoverySchema>,
): Promise<TokenSet> {
  const redirectHost = "127.0.0.1";
  const redirectUri = `http://${redirectHost}:${config.redirectPort}/callback`;
  const state = randomBytes(16).toString("hex");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const server = createServer();

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      reject(
        new Error(
          `Failed to start PKCE callback server on ${redirectUri}. Ensure the port is free and retry.`,
          { cause: error },
        ),
      );
    };

    server.once("error", onError);
    server.listen(config.redirectPort, redirectHost, () => {
      server.off("error", onError);
      resolve();
    });
  });

  let disposeCallbackListener: (() => void) | undefined;
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

      const returnedState = url.searchParams.get("state");
      const code = url.searchParams.get("code");
      if (!code || returnedState !== state) {
        res.statusCode = 400;
        res.end("OAuth callback validation failed.");
        cleanup();
        reject(new Error("OAuth callback validation failed."));
        return;
      }

      res.statusCode = 200;
      res.end("Login completed. You can close this tab.");
      cleanup();
      resolve(code);
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
      reject(new Error("Timed out waiting for browser callback."));
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

  let code: string;
  try {
    await openBrowser(authorizationUrl.toString(), redirectUri);
    code = await codePromise;
  } catch (error) {
    // Prevent unhandled rejections if PKCE browser launch fails early.
    void codePromise.catch(() => {});
    throw error;
  } finally {
    disposeCallbackListener?.();
    await closeServer(server);
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    code,
    code_verifier: verifier,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const response = await fetch(discovery.token_endpoint, {
    body,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed (${response.status})`);
  }

  const json = await response.json();
  const parsed = tokenSchema.parse(json);
  return withExpiry(parsed);
}

async function loginWithOidcUnsafe(
  config: OidcConfig,
  mode: LoginMode,
): Promise<TokenSet> {
  const discovery = await discover(config.issuer);
  if (mode === "device") {
    return loginByDeviceCode(config, discovery);
  }
  if (mode === "pkce") {
    return loginByPkce(config, discovery);
  }

  try {
    return await loginByPkce(config, discovery);
  } catch (error) {
    if (!shouldFallbackToDeviceFlow(error)) {
      throw error;
    }
    return loginByDeviceCode(config, discovery);
  }
}

async function openBrowser(url: string, redirectUri: string): Promise<void> {
  try {
    if (process.platform === "darwin") {
      await execFileAsync("open", [url]);
      return;
    }
    if (process.platform === "win32") {
      await execFileAsync("explorer.exe", [url]);
      return;
    }
    await execFileAsync("xdg-open", [url]);
  } catch (error) {
    throw new Error(
      `Failed to open the system browser for PKCE login (${redirectUri}).`,
      { cause: error },
    );
  }
}

function parseJsonSafely(text: string): null | unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

async function refreshTokenUnsafe(
  config: OidcConfig,
  refreshTokenValue: string,
): Promise<TokenSet> {
  const discovery = await discover(config.issuer);
  const body = new URLSearchParams({
    client_id: config.clientId,
    grant_type: "refresh_token",
    refresh_token: refreshTokenValue,
  });

  const response = await fetch(discovery.token_endpoint, {
    body,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Refresh token request failed (${response.status})`);
  }

  const json = await response.json();
  const parsed = tokenSchema.parse(json);
  return withExpiry(parsed);
}

async function revokeRefreshTokenUnsafe(
  config: OidcConfig,
  refreshTokenValue: string,
): Promise<void> {
  const discovery = await discover(config.issuer);
  if (!discovery.revocation_endpoint) return;

  const body = new URLSearchParams({
    client_id: config.clientId,
    token: refreshTokenValue,
    token_type_hint: "refresh_token",
  });

  const response = await fetch(discovery.revocation_endpoint, {
    body,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Revocation request failed (${response.status})`);
  }
}

function shouldFallbackToDeviceFlow(error: unknown): boolean {
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

function toReason(cause: unknown, fallback: string): string {
  if (cause instanceof Error && cause.message.trim().length > 0) {
    return cause.message;
  }
  return fallback;
}

function withExpiry(token: z.infer<typeof tokenSchema>): TokenSet {
  return {
    access_token: token.access_token,
    expires_at: token.expires_in
      ? Math.floor(Date.now() / 1000) + token.expires_in
      : undefined,
    refresh_token: token.refresh_token,
    scope: token.scope,
    token_type: token.token_type,
  };
}
