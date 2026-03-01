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
    h.getRuntimeConfigMock.mockReset();
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

  it("handles successful empty response bodies for update requests", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { updateTransaction } = await import("./api-client");
    await expect(
      updateTransaction("tx-1", {
        amount: "10",
      }),
    ).resolves.toBeUndefined();

    expect(h.getRuntimeConfigMock).toHaveBeenCalledTimes(1);
  });

  it("fetches current principal in normal flow", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          issuer: "https://example.auth0.com",
          scopes: ["transactions:read", "transactions:write"],
          subject: "auth0|123",
          userId: "user-1",
        }),
        {
          headers: { "content-type": "application/json" },
          status: 200,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { fetchMe } = await import("./api-client");
    await expect(fetchMe()).resolves.toEqual({
      issuer: "https://example.auth0.com",
      scopes: ["transactions:read", "transactions:write"],
      subject: "auth0|123",
      userId: "user-1",
    });
  });

  it("creates transaction and returns parsed response", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "tx-1",
          amount: "1",
          createdAt: "2026-01-01T00:00:00.000Z",
          currency: "USD",
          datetime: "2026-01-01T00:00:00.000Z",
          price: "100",
          type: "BUY",
          updatedAt: "2026-01-01T00:00:00.000Z",
          userId: "user-1",
        }),
        {
          headers: { "content-type": "application/json" },
          status: 200,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { createTransaction } = await import("./api-client");
    await expect(
      createTransaction({
        amount: "1",
        currency: "USD",
        datetime: "2026-01-01T00:00:00.000Z",
        price: "100",
        type: "BUY",
      }),
    ).resolves.toEqual({
      id: "tx-1",
      amount: "1",
      createdAt: "2026-01-01T00:00:00.000Z",
      currency: "USD",
      datetime: "2026-01-01T00:00:00.000Z",
      price: "100",
      type: "BUY",
      updatedAt: "2026-01-01T00:00:00.000Z",
      userId: "user-1",
    });
  });

  it("refreshes expired token and persists merged token state", async () => {
    h.readTokenSetMock.mockResolvedValueOnce({
      access_token: "old-access-token",
      expires_at: Math.floor(Date.now() / 1000) - 1,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    });
    h.refreshTokenMock.mockResolvedValueOnce({
      access_token: "new-access-token",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      scope: "openid profile",
      token_type: "Bearer",
    });

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          issuer: "https://example.auth0.com",
          scopes: ["transactions:read"],
          subject: "auth0|123",
          userId: "user-1",
        }),
        {
          headers: { "content-type": "application/json" },
          status: 200,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { fetchMe } = await import("./api-client");
    await fetchMe();

    expect(h.refreshTokenMock).toHaveBeenCalledWith(
      {
        audience: "https://api.o3o.app",
        clientId: "cli-client-id",
        issuer: "https://example.auth0.com",
        redirectPort: 38080,
      },
      "refresh-token",
    );
    expect(h.writeTokenSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        access_token: "new-access-token",
        refresh_token: "refresh-token",
      }),
    );
  });

  it("throws explicit error when session is expired and refresh token is absent", async () => {
    h.readTokenSetMock.mockResolvedValueOnce({
      access_token: "access-token",
      expires_at: Math.floor(Date.now() / 1000) - 1,
    });
    vi.stubGlobal("fetch", vi.fn<typeof fetch>());

    const { fetchMe } = await import("./api-client");
    await expect(fetchMe()).rejects.toThrow(
      "Session expired. Run `o3o auth login` again.",
    );
  });

  it("throws explicit error when user is not logged in", async () => {
    h.readTokenSetMock.mockResolvedValueOnce(null);
    vi.stubGlobal("fetch", vi.fn<typeof fetch>());

    const { fetchMe } = await import("./api-client");
    await expect(fetchMe()).rejects.toThrow(
      "Not logged in. Run `o3o auth login`.",
    );
  });
});
