import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cliErrorCodes } from "../../common/error-catalog";
import { refreshTokens } from "./oidc.service";
import { config, jsonResponse } from "./oidc.spec-helpers";

describe("services/auth/oidc refresh", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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

    const tokenResult = await refreshTokens(config, "old-refresh-token");

    expect(tokenResult.isOk()).toBe(true);
    if (tokenResult.isErr()) throw new Error("Expected ok result");
    expect(tokenResult.value.access_token).toBe("new-access-token");
    expect(tokenResult.value.refresh_token).toBe("new-refresh-token");
    expect(tokenResult.value.expires_at).toBeTypeOf("number");
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

    const result = await refreshTokens(config, "bad-refresh-token");
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_REFRESH_FAILED);
    expect(result.error.details?.action).toBe("RefreshOidcTokens");
    expect(result.error.details?.reason).toMatch(
      /Refresh token request failed/,
    );
  });

  it("returns validation reason when refresh token response payload is invalid", async () => {
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
          expires_in: 3600,
          refresh_token: "new-refresh-token",
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const result = await refreshTokens(config, "old-refresh-token");
    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_AUTH_REFRESH_FAILED);
    expect(result.error.details?.action).toBe("RefreshOidcTokens");
    expect(result.error.details?.reason).toMatch(/Invalid OIDC token response/);
  });
});
