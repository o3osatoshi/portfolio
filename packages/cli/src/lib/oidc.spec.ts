import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loginWithOidc, refreshToken } from "./oidc";
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
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
  });
}
