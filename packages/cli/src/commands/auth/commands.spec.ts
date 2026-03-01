import { err, errAsync, ok, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  loginWithOidcMock: vi.fn(),
  clearTokenSetMock: vi.fn(),
  fetchMeMock: vi.fn(),
  getRuntimeConfigMock: vi.fn(),
  readTokenSetMock: vi.fn(),
  revokeRefreshTokenMock: vi.fn(),
  writeTokenSetMock: vi.fn(),
}));

vi.mock("../../lib/api-client", () => ({
  fetchMe: h.fetchMeMock,
}));

vi.mock("../../lib/config", () => ({
  getRuntimeConfig: h.getRuntimeConfigMock,
}));

vi.mock("../../lib/oidc", () => ({
  loginWithOidc: h.loginWithOidcMock,
  revokeRefreshToken: h.revokeRefreshTokenMock,
}));

vi.mock("../../lib/token-store", () => ({
  clearTokenSet: h.clearTokenSetMock,
  readTokenSet: h.readTokenSetMock,
  writeTokenSet: h.writeTokenSetMock,
}));

import { runAuthLogin } from "./login";
import { runAuthLogout } from "./logout";
import { runAuthWhoami } from "./whoami";

describe("commands/auth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    h.getRuntimeConfigMock.mockReset();
    h.getRuntimeConfigMock.mockReturnValue(
      ok({
        oidc: {
          audience: "https://api.o3o.app",
          clientId: "cli-client-id",
          issuer: "https://example.auth0.com",
          redirectPort: 38080,
        },
        apiBaseUrl: "http://localhost:3000",
      }),
    );
    h.loginWithOidcMock.mockReset();
    h.writeTokenSetMock.mockReset();
    h.readTokenSetMock.mockReset();
    h.revokeRefreshTokenMock.mockReset();
    h.clearTokenSetMock.mockReset();
    h.fetchMeMock.mockReset();
    h.writeTokenSetMock.mockReturnValue(okAsync(undefined));
    h.clearTokenSetMock.mockReturnValue(okAsync(undefined));
    h.readTokenSetMock.mockReturnValue(okAsync(null));
    h.revokeRefreshTokenMock.mockReturnValue(okAsync(undefined));
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("runAuthLogin stores token and prints success", async () => {
    const token = {
      access_token: "access-token",
      expires_at: 1_735_689_600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    };
    h.loginWithOidcMock.mockReturnValueOnce(okAsync(token));

    const result = await runAuthLogin("auto");

    expect(result.isOk()).toBe(true);
    expect(h.loginWithOidcMock).toHaveBeenCalledWith(
      {
        audience: "https://api.o3o.app",
        clientId: "cli-client-id",
        issuer: "https://example.auth0.com",
        redirectPort: 38080,
      },
      "auto",
    );
    expect(h.writeTokenSetMock).toHaveBeenCalledWith(token);
    expect(console.log).toHaveBeenCalledWith("Login successful.");
  });

  it("runAuthLogout revokes refresh token when available", async () => {
    h.readTokenSetMock.mockReturnValueOnce(
      okAsync({
        access_token: "access-token",
        refresh_token: "refresh-token",
      }),
    );

    const result = await runAuthLogout();

    expect(result.isOk()).toBe(true);
    expect(h.revokeRefreshTokenMock).toHaveBeenCalledWith(
      {
        audience: "https://api.o3o.app",
        clientId: "cli-client-id",
        issuer: "https://example.auth0.com",
        redirectPort: 38080,
      },
      "refresh-token",
    );
    expect(h.clearTokenSetMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("Logged out.");
  });

  it("runAuthLogout skips revoke when refresh token is absent", async () => {
    h.readTokenSetMock.mockReturnValueOnce(
      okAsync({
        access_token: "access-token",
      }),
    );

    const result = await runAuthLogout();

    expect(result.isOk()).toBe(true);
    expect(h.revokeRefreshTokenMock).not.toHaveBeenCalled();
    expect(h.clearTokenSetMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("Logged out.");
  });

  it("runAuthLogout still clears local tokens when revoke fails", async () => {
    h.readTokenSetMock.mockReturnValueOnce(
      okAsync({
        access_token: "access-token",
        refresh_token: "refresh-token",
      }),
    );
    h.revokeRefreshTokenMock.mockReturnValueOnce(
      errAsync(new Error("boom") as never),
    );

    const result = await runAuthLogout();

    expect(result.isOk()).toBe(true);
    expect(h.revokeRefreshTokenMock).toHaveBeenCalledTimes(1);
    expect(h.clearTokenSetMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("Logged out.");
  });

  it("runAuthLogout still clears local tokens when runtime config is invalid", async () => {
    h.readTokenSetMock.mockReturnValueOnce(
      okAsync({
        access_token: "access-token",
        refresh_token: "refresh-token",
      }),
    );
    h.getRuntimeConfigMock.mockReturnValueOnce(err(new Error("boom") as never));

    const result = await runAuthLogout();

    expect(result.isOk()).toBe(true);
    expect(h.revokeRefreshTokenMock).not.toHaveBeenCalled();
    expect(h.clearTokenSetMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("Logged out.");
  });

  it("runAuthWhoami prints formatted JSON", async () => {
    h.fetchMeMock.mockReturnValueOnce(
      okAsync({
        issuer: "https://example.auth0.com",
        scopes: ["transactions:read"],
        subject: "auth0|123",
        userId: "user-1",
      }),
    );

    const result = await runAuthWhoami();

    expect(result.isOk()).toBe(true);
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(
        {
          issuer: "https://example.auth0.com",
          scopes: ["transactions:read"],
          subject: "auth0|123",
          userId: "user-1",
        },
        null,
        2,
      ),
    );
  });
});
