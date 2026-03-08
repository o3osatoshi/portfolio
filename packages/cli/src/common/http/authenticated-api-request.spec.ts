import { errAsync, ok, okAsync } from "neverthrow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cliErrorCodes } from "../error-catalog";

const h = vi.hoisted(() => ({
  clearTokenSetMock: vi.fn(),
  readTokenSetMock: vi.fn(),
  refreshTokenMock: vi.fn(),
  resolveRuntimeEnvMock: vi.fn(),
  writeTokenSetMock: vi.fn(),
}));

vi.mock("../runtime-env", () => ({
  resolveRuntimeEnv: h.resolveRuntimeEnvMock,
}));

vi.mock("../../services/auth/oidc.service", () => ({
  refreshToken: h.refreshTokenMock,
}));

vi.mock("../../services/auth/token-store.service", () => ({
  clearTokenSet: h.clearTokenSetMock,
  readTokenSet: h.readTokenSetMock,
  writeTokenSet: h.writeTokenSetMock,
}));

describe("common/http/authenticated-api-request", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    h.resolveRuntimeEnvMock.mockReset();
    h.resolveRuntimeEnvMock.mockReturnValue(
      ok({
        oidcConfig: {
          audience: "https://api.o3o.app",
          clientId: "cli-client-id",
          issuer: "https://example.auth0.com",
          redirectPort: 38080,
        },
        apiBaseUrl: "http://localhost:3000",
      }),
    );
    h.readTokenSetMock.mockReset();
    h.readTokenSetMock.mockReturnValue(
      okAsync({
        access_token: "access-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: "refresh-token",
        scope: "openid profile email transactions:read transactions:write",
        token_type: "Bearer",
      }),
    );
    h.writeTokenSetMock.mockReset().mockReturnValue(okAsync(undefined));
    h.clearTokenSetMock.mockReset().mockReturnValue(okAsync(undefined));
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

    const { requestAuthenticatedApi } = await import(
      "./authenticated-api-request"
    );
    const result = await requestAuthenticatedApi("/api/cli/v1/me", {
      method: "GET",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe("OIDC_ACCESS_TOKEN_AUDIENCE_MISMATCH");
    expect(result.error.details?.reason).toBe(
      "Access token audience does not match this API.",
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

    const { requestAuthenticatedApi } = await import(
      "./authenticated-api-request"
    );
    const result = await requestAuthenticatedApi("/api/cli/v1/me", {
      method: "GET",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe("CLI_SCOPE_FORBIDDEN");
    expect(result.error.details?.reason).toBe(
      "Required scope is missing: transactions:read",
    );
    expect(h.clearTokenSetMock).not.toHaveBeenCalled();
  });

  it("handles successful empty response bodies", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { requestAuthenticatedApi } = await import(
      "./authenticated-api-request"
    );
    const result = await requestAuthenticatedApi(
      "/api/cli/v1/transactions/tx-1",
      {
        body: JSON.stringify({ amount: "10" }),
        method: "PATCH",
      },
    );

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toBeUndefined();
  });

  it("resolves request URL when API base URL is origin root", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("{}", {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { requestAuthenticatedApi } = await import(
      "./authenticated-api-request"
    );
    const result = await requestAuthenticatedApi("/api/cli/v1/me", {
      method: "GET",
    });

    expect(result.isOk()).toBe(true);
    const [calledUrl] = fetchMock.mock.calls[0] ?? [];
    expect(calledUrl).toBe("http://localhost:3000/api/cli/v1/me");
  });

  it("resolves request URL when API base URL includes /api path", async () => {
    h.resolveRuntimeEnvMock.mockReturnValueOnce(
      ok({
        oidcConfig: {
          audience: "https://api.o3o.app",
          clientId: "cli-client-id",
          issuer: "https://example.auth0.com",
          redirectPort: 38080,
        },
        apiBaseUrl: "http://127.0.0.1:5001/portfolio-bd22d/us-central1/api",
      }),
    );

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("{}", {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { requestAuthenticatedApi } = await import(
      "./authenticated-api-request"
    );
    const result = await requestAuthenticatedApi("/api/cli/v1/me", {
      method: "GET",
    });

    expect(result.isOk()).toBe(true);
    const [calledUrl] = fetchMock.mock.calls[0] ?? [];
    expect(calledUrl).toBe(
      "http://127.0.0.1:5001/portfolio-bd22d/us-central1/api/cli/v1/me",
    );
  });

  it("refreshes expired token and persists merged token state", async () => {
    h.readTokenSetMock.mockReturnValueOnce(
      okAsync({
        access_token: "old-access-token",
        expires_at: Math.floor(Date.now() / 1000) - 1,
        refresh_token: "refresh-token",
        scope: "openid profile",
        token_type: "Bearer",
      }),
    );
    h.refreshTokenMock.mockReturnValueOnce(
      okAsync({
        access_token: "new-access-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        scope: "openid profile",
        token_type: "Bearer",
      }),
    );

    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response("{}", {
          headers: { "content-type": "application/json" },
          status: 200,
        }),
      ),
    );

    const { requestAuthenticatedApi } = await import(
      "./authenticated-api-request"
    );
    const result = await requestAuthenticatedApi("/api/cli/v1/me", {
      method: "GET",
    });

    expect(result.isOk()).toBe(true);
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

  it("returns unauthorized error when session is expired and refresh token is absent", async () => {
    h.readTokenSetMock.mockReturnValueOnce(
      okAsync({
        access_token: "access-token",
        expires_at: Math.floor(Date.now() / 1000) - 1,
      }),
    );
    vi.stubGlobal("fetch", vi.fn<typeof fetch>());

    const { requestAuthenticatedApi } = await import(
      "./authenticated-api-request"
    );
    const result = await requestAuthenticatedApi("/api/cli/v1/me", {
      method: "GET",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_API_UNAUTHORIZED);
    expect(result.error.details?.reason).toBe(
      "Session expired. Run `o3o auth login` again.",
    );
  });

  it("returns unauthorized error when user is not logged in", async () => {
    h.readTokenSetMock.mockReturnValueOnce(okAsync(null));
    vi.stubGlobal("fetch", vi.fn<typeof fetch>());

    const { requestAuthenticatedApi } = await import(
      "./authenticated-api-request"
    );
    const result = await requestAuthenticatedApi("/api/cli/v1/me", {
      method: "GET",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_API_UNAUTHORIZED);
    expect(result.error.details?.reason).toBe(
      "Not logged in. Run `o3o auth login`.",
    );
  });

  it("clears token state and returns unauthorized when refresh fails", async () => {
    h.readTokenSetMock.mockReturnValueOnce(
      okAsync({
        access_token: "expired-access-token",
        expires_at: Math.floor(Date.now() / 1000) - 10,
        refresh_token: "refresh-token",
      }),
    );
    h.refreshTokenMock.mockReturnValueOnce(
      errAsync(new Error("boom") as never),
    );

    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const { requestAuthenticatedApi } = await import(
      "./authenticated-api-request"
    );
    const result = await requestAuthenticatedApi("/api/cli/v1/me", {
      method: "GET",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_API_UNAUTHORIZED);
    expect(result.error.details?.reason).toBe(
      "Session expired. Run `o3o auth login` again.",
    );
    expect(h.clearTokenSetMock).toHaveBeenCalledTimes(1);
    expect(h.writeTokenSetMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
