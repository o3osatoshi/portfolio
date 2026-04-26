import { createServer } from "node:http";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cliErrorCodes } from "../../common/error-catalog";
import { oidcLogin } from "./oidc.service";
import {
  config,
  expectHeader,
  getAvailablePort,
  jsonErrorResponse,
  jsonResponse,
  requestLocal,
  waitForAuthorizationUrlFromCalls,
} from "./oidc.spec-helpers";

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

describe("services/auth/oidc login", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    h.execFileMock.mockClear();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
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

    const resultPromise = oidcLogin(config, "device");
    await vi.advanceTimersByTimeAsync(1000);

    const result = await resultPromise;
    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value.access_token).toBe("device-access-token");
    expect(result.value.refresh_token).toBe("device-refresh-token");
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

    const resultPromise = oidcLogin(config, "device", { onInfo });
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

    const resultPromise = oidcLogin(config, "auto");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await resultPromise;

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value.access_token).toBe("device-access-token");
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

    const resultPromise = oidcLogin(config, "device");
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

    const result = await oidcLogin(config, "device");
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.action).toBe("AuthenticateWithOidc");
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

    const result = await oidcLogin(config, "device");
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.action).toBe("AuthenticateWithOidc");
    expect(result.error.details?.reason).toMatch(
      /Device authorization failed\. HTTP 400/,
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

    const resultPromise = oidcLogin(config, "device");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await resultPromise;
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.action).toBe("AuthenticateWithOidc");
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

    const resultPromise = oidcLogin(config, "device");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await resultPromise;
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.action).toBe("AuthenticateWithOidc");
    expect(result.error.details?.reason).toMatch(
      /Device login failed: access_denied/,
    );
  });

  it("renders minimal success callback page with secure headers", async () => {
    const redirectPort = await getAvailablePort();
    const pkceConfig: typeof config = { ...config, redirectPort };

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

    const resultPromise = oidcLogin(pkceConfig, "pkce");
    const authorizationUrl = await waitForAuthorizationUrlFromCalls(
      h.execFileMock.mock.calls,
    );
    const state = authorizationUrl.searchParams.get("state");
    expect(state).toBeTruthy();

    const callbackResponse = await requestLocal(
      `http://127.0.0.1:${redirectPort}/callback?code=${encodeURIComponent(
        "code-secret-value-for-test",
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
    const pkceConfig: typeof config = { ...config, redirectPort };

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        authorization_endpoint: "https://example.auth0.com/authorize",
        token_endpoint: "https://example.auth0.com/oauth/token",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = oidcLogin(pkceConfig, "pkce");
    await waitForAuthorizationUrlFromCalls(h.execFileMock.mock.calls);
    const callbackResponse = await requestLocal(
      `http://127.0.0.1:${redirectPort}/callback?code=${encodeURIComponent(
        "state-mismatch-code-value",
      )}&state=wrong-state`,
    );

    expect(callbackResponse.status).toBe(200);
    expect(callbackResponse.body).toContain("Sign-in failed");
    expect(callbackResponse.body).toContain("Authorization was not completed.");
    expect(callbackResponse.body).toContain(
      "Return to your terminal and run o3o auth login again.",
    );
    expectHeader(callbackResponse.headers["cache-control"], "no-store");
    expectHeader(callbackResponse.headers["x-content-type-options"], "nosniff");

    const result = await resultPromise;
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.action).toBe("AuthenticateWithOidc");
    expect(result.error.details?.reason).toMatch(
      /OAuth callback validation failed/,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("renders failed callback page for oauth error query", async () => {
    const redirectPort = await getAvailablePort();
    const pkceConfig: typeof config = { ...config, redirectPort };

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        authorization_endpoint: "https://example.auth0.com/authorize",
        token_endpoint: "https://example.auth0.com/oauth/token",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const resultPromise = oidcLogin(pkceConfig, "pkce");
    const authorizationUrl = await waitForAuthorizationUrlFromCalls(
      h.execFileMock.mock.calls,
    );
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

    const resultPromise = oidcLogin(config, "device");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await resultPromise;
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_LOGIN_FAILED);
    expect(result.error.details?.reason).toMatch(
      /Device login failed with status 502: gateway timeout/,
    );
  });
});
