import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cliErrorCodes } from "../../common/error-catalog";
import { revokeRefreshToken } from "./oidc.service";
import { config, jsonResponse } from "./oidc.spec-helpers";

describe("services/auth/oidc revoke", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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
      /Revocation request failed\. \(500\)/,
    );
  });
});
