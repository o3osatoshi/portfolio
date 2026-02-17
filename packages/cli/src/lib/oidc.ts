import { execFile } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { promisify } from "node:util";

import { z } from "zod";

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

export async function loginWithOidc(
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
  } catch {
    return loginByDeviceCode(config, discovery);
  }
}

export async function refreshToken(
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

export async function revokeRefreshToken(
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

    const json: unknown = await tokenResponse.json();
    if (tokenResponse.ok) {
      return withExpiry(tokenSchema.parse(json));
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

  const codePromise = new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for browser callback."));
    }, 180000);

    server.on("request", (req, res) => {
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
        clearTimeout(timeout);
        reject(new Error("OAuth callback validation failed."));
        return;
      }

      res.statusCode = 200;
      res.end("Login completed. You can close this tab.");
      clearTimeout(timeout);
      resolve(code);
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(config.redirectPort, redirectHost, () => resolve());
    server.on("error", (error) => {
      reject(
        new Error(
          `Failed to start PKCE callback server on ${redirectUri}. Ensure the port is free and retry.`,
          { cause: error },
        ),
      );
    });
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

  await openBrowser(authorizationUrl.toString());
  const code = await codePromise.finally(() => {
    server.close();
  });

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

async function openBrowser(url: string): Promise<void> {
  if (process.platform === "darwin") {
    await execFileAsync("open", [url]);
    return;
  }
  if (process.platform === "win32") {
    await execFileAsync("cmd", ["/c", "start", "", url]);
    return;
  }
  await execFileAsync("xdg-open", [url]);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
