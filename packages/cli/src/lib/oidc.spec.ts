import { createServer } from "node:http";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

    const token = await refreshToken(config, "old-refresh-token");

    expect(token.access_token).toBe("new-access-token");
    expect(token.refresh_token).toBe("new-refresh-token");
    expect(token.expires_at).toBeTypeOf("number");
  });

  it("throws when refresh token endpoint rejects request", async () => {
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

    await expect(refreshToken(config, "bad-refresh-token")).rejects.toThrow(
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

    const token = await resultPromise;

    expect(token.access_token).toBe("device-access-token");
    expect(token.refresh_token).toBe("device-refresh-token");
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
    const token = await resultPromise;

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
    const assertion = expect(resultPromise).resolves.toMatchObject({
      access_token: "device-access-token",
    });
    await vi.advanceTimersByTimeAsync(9000);
    await assertion;
  });

  it("throws when issuer does not support device endpoint", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        authorization_endpoint: "https://example.auth0.com/authorize",
        token_endpoint: "https://example.auth0.com/oauth/token",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(loginWithOidc(config, "device")).rejects.toThrow(
      /does not expose a device authorization endpoint/i,
    );
  });

  it("throws when device authorization endpoint returns non-2xx", async () => {
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

    await expect(loginWithOidc(config, "device")).rejects.toThrow(
      /Device authorization failed \(400\)/,
    );
  });

  it("throws on expired device token", async () => {
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
    const assertion =
      expect(resultPromise).rejects.toThrow(/Device login expired/);
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });

  it("throws on unknown device token error", async () => {
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
    const assertion = expect(resultPromise).rejects.toThrow(
      /Device login failed: access_denied/,
    );
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });

  it("skips refresh token revocation when discovery has no endpoint", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        authorization_endpoint: "https://example.auth0.com/authorize",
        token_endpoint: "https://example.auth0.com/oauth/token",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      revokeRefreshToken(config, "refresh-token"),
    ).resolves.toBeUndefined();
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

    await expect(
      revokeRefreshToken(config, "refresh-token"),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws when revocation endpoint rejects request", async () => {
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

    await expect(revokeRefreshToken(config, "refresh-token")).rejects.toThrow(
      /Revocation request failed \(500\)/,
    );
  });
});

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
