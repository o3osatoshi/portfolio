import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  clearTokenSetMock: vi.fn(),
  getRuntimeConfigMock: vi.fn(),
  readTokenSetMock: vi.fn(),
  refreshTokenMock: vi.fn(),
  writeTokenSetMock: vi.fn(),
}));

vi.mock("./config", () => ({
  getRuntimeConfig: h.getRuntimeConfigMock,
}));

vi.mock("./oidc", () => ({
  refreshToken: h.refreshTokenMock,
}));

vi.mock("./token-store", () => ({
  clearTokenSet: h.clearTokenSetMock,
  readTokenSet: h.readTokenSetMock,
  writeTokenSet: h.writeTokenSetMock,
}));

describe("lib/api-client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    h.getRuntimeConfigMock.mockReturnValue({
      oidc: {
        audience: "https://api.o3o.app",
        clientId: "cli-client-id",
        issuer: "https://example.auth0.com",
        redirectPort: 38080,
      },
      apiBaseUrl: "http://localhost:3000",
    });
    h.readTokenSetMock.mockResolvedValue({
      access_token: "access-token",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: "refresh-token",
      scope: "openid profile email transactions:read transactions:write",
      token_type: "Bearer",
    });
    h.writeTokenSetMock.mockReset();
    h.clearTokenSetMock.mockReset();
    h.refreshTokenMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("includes API error code and reason when request returns 401", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "OIDC_ACCESS_TOKEN_AUDIENCE_MISMATCH",
          details: {
            reason: "Access token audience does not match this API.",
          },
          message: "Access token verification failed.",
        }),
        {
          headers: { "content-type": "application/json" },
          status: 401,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { fetchMe } = await import("./api-client");
    await expect(fetchMe()).rejects.toThrow(
      "Unauthorized. Please run `o3o auth login`. (code=OIDC_ACCESS_TOKEN_AUDIENCE_MISMATCH, reason=Access token audience does not match this API.)",
    );
    expect(h.clearTokenSetMock).toHaveBeenCalledTimes(1);
  });

  it("does not leak debug stack traces for non-401 API errors", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "CLI_SCOPE_FORBIDDEN",
          details: {
            reason: "Required scope is missing: transactions:read",
          },
          message:
            "AuthorizeCliScope failed: Required scope is missing: transactions:read",
          stack: "PresentationForbiddenError: ...huge stack trace...",
        }),
        {
          headers: { "content-type": "application/json" },
          status: 403,
          statusText: "Forbidden",
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { fetchMe } = await import("./api-client");
    await expect(fetchMe()).rejects.toThrow(
      "API request failed (403): Required scope is missing: transactions:read (code=CLI_SCOPE_FORBIDDEN)",
    );
    expect(h.clearTokenSetMock).not.toHaveBeenCalled();
  });
});
