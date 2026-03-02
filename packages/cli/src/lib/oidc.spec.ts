import { createServer, get as httpGet } from "node:http";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  execFileMock: vi.fn(
    (
      _file: string,
      _args: readonly string[],
      callback: (error: Error | null, stdout?: string, stderr?: string) => void,
    ) => {
      callback(null, "", "");
    },
  ),
}));

vi.mock("node:child_process", () => ({
  execFile: h.execFileMock,
}));

import { cliErrorCodes } from "./cli-error-catalog";
import { loginWithOidc, refreshToken, revokeRefreshToken } from "./oidc";
import type { OidcConfig } from "./types";

const config: OidcConfig = {
  audience: "https://api.o3o.app",
  clientId: "cli-client-id",
  issuer: "https://example.auth0.com",
  redirectPort: 38080,
};

describe("lib/oidc", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    h.execFileMock.mockClear();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("refreshes access token from refresh_token grant", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          access_token: "new-access-token",
          expires_in: 3600,
          refresh_token: "new-refresh-token",
          scope: "openid profile",
          token_type: "Bearer",
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const tokenResult = await refreshToken(config, "old-refresh-token");

    expect(tokenResult.isOk()).toBe(true);
    if (tokenResult.isErr()) throw new Error("Expected ok result");
    const token = tokenResult.value;
    expect(token.access_token).toBe("new-access-token");
    expect(token.refresh_token).toBe("new-refresh-token");
    expect(token.expires_at).toBeTypeOf("number");
  });

  it("returns error when refresh token endpoint rejects request", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(new Response("", { status: 401 }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await refreshToken(config, "bad-refresh-token");
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_REFRESH_FAILED);
    expect(result.error.details?.reason).toMatch(
      /Refresh token request failed/,
    );
  });

  it("executes device flow and returns tokens", async () => {
    vi.useFakeTimers();

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          device_authorization_endpoint:
            "https://example.auth0.com/oauth/device/code",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          device_code: "device-code",
          expires_in: 600,
          interval: 1,
          user_code: "ABCD-EFGH",
          verification_uri: "https://example.auth0.com/activate",
          verification_uri_complete:
            "https://example.auth0.com/activate?user_code=ABCD-EFGH",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          access_token: "device-access-token",
          expires_in: 1800,
          refresh_token: "device-refresh-token",
          scope: "openid profile email",
          token_type: "Bearer",
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = loginWithOidc(config, "device");
    await vi.advanceTimersByTimeAsync(1000);

    const result = await resultPromise;

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    const token = result.value;
    expect(token.access_token).toBe("device-access-token");
    expect(token.refresh_token).toBe("device-refresh-token");
  });

  it("routes device flow progress logs to onInfo callback", async () => {
    vi.useFakeTimers();
    const onInfo = vi.fn();

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          device_authorization_endpoint:
            "https://example.auth0.com/oauth/device/code",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          device_code: "device-code",
          expires_in: 600,
          interval: 1,
          user_code: "ABCD-EFGH",
          verification_uri: "https://example.auth0.com/activate",
          verification_uri_complete:
            "https://example.auth0.com/activate?user_code=ABCD-EFGH",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          access_token: "device-access-token",
          expires_in: 1800,
          refresh_token: "device-refresh-token",
          scope: "openid profile email",
          token_type: "Bearer",
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = loginWithOidc(config, "device", { onInfo });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await resultPromise;

    expect(result.isOk()).toBe(true);
    expect(onInfo).toHaveBeenCalledWith(
      expect.stringContaining("Open this URL to continue login"),
    );
  });

  it("falls back from auto PKCE to device flow when callback port is unavailable", async () => {
    vi.useFakeTimers();
    const blocker = createServer();
    await new Promise<void>((resolve) => {
      blocker.listen(config.redirectPort, "127.0.0.1", () => resolve());
    });

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          device_authorization_endpoint:
            "https://example.auth0.com/oauth/device/code",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          device_code: "device-code",
          expires_in: 600,
          interval: 1,
          user_code: "ABCD-EFGH",
          verification_uri: "https://example.auth0.com/activate",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          access_token: "device-access-token",
          expires_in: 1800,
          refresh_token: "device-refresh-token",
          scope: "openid profile email",
          token_type: "Bearer",
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = loginWithOidc(config, "auto");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await resultPromise;

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    const token = result.value;
    expect(token.access_token).toBe("device-access-token");
    await new Promise<void>((resolve, reject) =>
      blocker.close((error) => (error ? reject(error) : resolve())),
    );
  });

  it("retries device flow when authorization is pending and slow_down is returned", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          device_authorization_endpoint:
            "https://example.auth0.com/oauth/device/code",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          device_code: "device-code",
          expires_in: 600,
          interval: 1,
          user_code: "ABCD-EFGH",
          verification_uri: "https://example.auth0.com/activate",
        }),
      )
      .mockResolvedValueOnce(jsonErrorResponse("authorization_pending"))
      .mockResolvedValueOnce(jsonErrorResponse("slow_down"))
      .mockResolvedValueOnce(
        jsonResponse({
          access_token: "device-access-token",
          expires_in: 1800,
          refresh_token: "device-refresh-token",
          scope: "openid profile email",
          token_type: "Bearer",
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = loginWithOidc(config, "device");
    await vi.advanceTimersByTimeAsync(9000);
    const result = await resultPromise;
    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value.access_token).toBe("device-access-token");
  });

  it("returns error when issuer does not support device endpoint", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        authorization_endpoint: "https://example.auth0.com/authorize",
        token_endpoint: "https://example.auth0.com/oauth/token",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await loginWithOidc(config, "device");
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.reason).toMatch(
      /does not expose a device authorization endpoint/i,
    );
  });

  it("returns error when device authorization endpoint returns non-2xx", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          device_authorization_endpoint:
            "https://example.auth0.com/oauth/device/code",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(new Response("", { status: 400 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await loginWithOidc(config, "device");
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.reason).toMatch(
      /Device authorization failed \(400\)/,
    );
  });

  it("returns error on expired device token", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          device_authorization_endpoint:
            "https://example.auth0.com/oauth/device/code",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          device_code: "device-code",
          expires_in: 600,
          interval: 1,
          user_code: "ABCD-EFGH",
          verification_uri: "https://example.auth0.com/activate",
        }),
      )
      .mockResolvedValueOnce(jsonErrorResponse("expired_token"));
    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = loginWithOidc(config, "device");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await resultPromise;
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.reason).toMatch(/Device login expired/);
  });

  it("returns error on unknown device token error", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          device_authorization_endpoint:
            "https://example.auth0.com/oauth/device/code",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          device_code: "device-code",
          expires_in: 600,
          interval: 1,
          user_code: "ABCD-EFGH",
          verification_uri: "https://example.auth0.com/activate",
        }),
      )
      .mockResolvedValueOnce(jsonErrorResponse("access_denied"));
    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = loginWithOidc(config, "device");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await resultPromise;
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.reason).toMatch(
      /Device login failed: access_denied/,
    );
  });

  it("renders minimal success callback page with secure headers", async () => {
    const redirectPort = await getAvailablePort();
    const pkceConfig: OidcConfig = { ...config, redirectPort };
    const issuedCode = "code-secret-value-for-test";

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          access_token: "pkce-access-token",
          expires_in: 1800,
          refresh_token: "pkce-refresh-token",
          scope: "openid profile email",
          token_type: "Bearer",
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = loginWithOidc(pkceConfig, "pkce");
    const authorizationUrl = await waitForAuthorizationUrl();
    const state = authorizationUrl.searchParams.get("state");
    expect(state).toBeTruthy();

    const callbackResponse = await requestLocal(
      `http://127.0.0.1:${redirectPort}/callback?code=${encodeURIComponent(
        issuedCode,
      )}&state=${encodeURIComponent(state ?? "")}`,
    );

    expect(callbackResponse.status).toBe(200);
    expect(callbackResponse.body).toContain("Sign-in complete");
    expect(callbackResponse.body).toContain(
      "You can close this window and return to your terminal.",
    );
    expect(callbackResponse.body).toContain(
      "Continue in the same terminal where you ran o3o auth login.",
    );
    expect(callbackResponse.body).not.toContain(issuedCode);
    expect(callbackResponse.body).not.toContain(state ?? "");
    expectHeader(callbackResponse.headers["cache-control"], "no-store");
    expectHeader(callbackResponse.headers["pragma"], "no-cache");
    expectHeader(callbackResponse.headers["x-content-type-options"], "nosniff");
    expectHeader(
      callbackResponse.headers["content-security-policy"],
      "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
    );

    const result = await resultPromise;
    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value.access_token).toBe("pkce-access-token");
  });

  it("renders failed callback page on state mismatch without leaking query secrets", async () => {
    const redirectPort = await getAvailablePort();
    const pkceConfig: OidcConfig = { ...config, redirectPort };
    const issuedCode = "state-mismatch-code-value";

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        authorization_endpoint: "https://example.auth0.com/authorize",
        token_endpoint: "https://example.auth0.com/oauth/token",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = loginWithOidc(pkceConfig, "pkce");
    await waitForAuthorizationUrl();
    const callbackResponse = await requestLocal(
      `http://127.0.0.1:${redirectPort}/callback?code=${encodeURIComponent(
        issuedCode,
      )}&state=wrong-state`,
    );

    expect(callbackResponse.status).toBe(200);
    expect(callbackResponse.body).toContain("Sign-in failed");
    expect(callbackResponse.body).toContain("Authorization was not completed.");
    expect(callbackResponse.body).toContain(
      "Return to your terminal and run o3o auth login again.",
    );
    expect(callbackResponse.body).not.toContain(issuedCode);
    expect(callbackResponse.body).not.toContain("wrong-state");
    expectHeader(callbackResponse.headers["cache-control"], "no-store");
    expectHeader(callbackResponse.headers["x-content-type-options"], "nosniff");

    const result = await resultPromise;
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.reason).toMatch(
      /OAuth callback validation failed/,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("renders failed callback page for oauth error query", async () => {
    const redirectPort = await getAvailablePort();
    const pkceConfig: OidcConfig = { ...config, redirectPort };

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        authorization_endpoint: "https://example.auth0.com/authorize",
        token_endpoint: "https://example.auth0.com/oauth/token",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = loginWithOidc(pkceConfig, "pkce");
    const authorizationUrl = await waitForAuthorizationUrl();
    const state = authorizationUrl.searchParams.get("state");
    expect(state).toBeTruthy();

    const callbackResponse = await requestLocal(
      `http://127.0.0.1:${redirectPort}/callback?error=access_denied&state=${encodeURIComponent(
        state ?? "",
      )}`,
    );
    expect(callbackResponse.status).toBe(200);
    expect(callbackResponse.body).toContain("Sign-in failed");
    expect(callbackResponse.body).toContain("Authorization was not completed.");
    expect(callbackResponse.body).toContain(
      "Return to your terminal and run o3o auth login again.",
    );
    expect(callbackResponse.body).not.toContain("state=");
    expect(callbackResponse.body).not.toContain("access_denied");

    const result = await resultPromise;
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.reason).toMatch(/OAuth authorization failed/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns status-based error when device token response is non-json", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          device_authorization_endpoint:
            "https://example.auth0.com/oauth/device/code",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          device_code: "device-code",
          expires_in: 600,
          interval: 1,
          user_code: "ABCD-EFGH",
          verification_uri: "https://example.auth0.com/activate",
        }),
      )
      .mockResolvedValueOnce(
        new Response("gateway timeout", {
          headers: {
            "content-type": "text/plain",
          },
          status: 502,
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = loginWithOidc(config, "device");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await resultPromise;
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.reason).toMatch(
      /Device login failed with status 502: gateway timeout/,
    );
  });

  it("skips refresh token revocation when discovery has no endpoint", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        authorization_endpoint: "https://example.auth0.com/authorize",
        token_endpoint: "https://example.auth0.com/oauth/token",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await revokeRefreshToken(config, "refresh-token");
    expect(result.isOk()).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("revokes refresh token when endpoint is available", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          revocation_endpoint: "https://example.auth0.com/oauth/revoke",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(new Response("", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await revokeRefreshToken(config, "refresh-token");
    expect(result.isOk()).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns error when revocation endpoint rejects request", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          authorization_endpoint: "https://example.auth0.com/authorize",
          revocation_endpoint: "https://example.auth0.com/oauth/revoke",
          token_endpoint: "https://example.auth0.com/oauth/token",
        }),
      )
      .mockResolvedValueOnce(new Response("", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await revokeRefreshToken(config, "refresh-token");
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_REVOKE_FAILED);
    expect(result.error.details?.reason).toMatch(
      /Revocation request failed \(500\)/,
    );
  });
});

function expectHeader(header: string | string[] | undefined, expected: string) {
  if (Array.isArray(header)) {
    expect(header.join(", ")).toBe(expected);
    return;
  }
  expect(header).toBe(expected);
}

async function getAvailablePort(): Promise<number> {
  const server = createServer();
  return await new Promise<number>((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to resolve dynamic port."));
        return;
      }
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(address.port);
      });
    });
  });
}

function jsonErrorResponse(error: string): Response {
  return new Response(JSON.stringify({ error }), {
    headers: {
      "content-type": "application/json",
    },
    status: 400,
  });
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
  });
}

async function requestLocal(url: string): Promise<{
  body: string;
  headers: import("node:http").IncomingHttpHeaders;
  status: number;
}> {
  return await new Promise((resolve, reject) => {
    const req = httpGet(url, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({
          body,
          headers: res.headers,
          status: res.statusCode ?? 0,
        });
      });
    });
    req.on("error", reject);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForAuthorizationUrl(): Promise<URL> {
  for (let i = 0; i < 100; i += 1) {
    if (h.execFileMock.mock.calls.length > 0) {
      break;
    }
    await sleep(10);
  }

  if (h.execFileMock.mock.calls.length === 0) {
    throw new Error("Browser launcher was not called.");
  }

  const call = h.execFileMock.mock.calls[0];
  const args = Array.isArray(call?.[1]) ? call[1] : [];
  const authorizationUrl = args[0];
  if (typeof authorizationUrl !== "string") {
    throw new Error("Authorization URL was not passed to browser launcher.");
  }
  return new URL(authorizationUrl);
}
