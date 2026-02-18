import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import { createCliPrincipalResolver } from "./cli-principal";

const h = vi.hoisted(() => {
  const createVerifierMock = vi.fn(() => Symbol("verifier"));
  const verifyTokenMock = vi.fn();
  return { createVerifierMock, verifyTokenMock };
});

vi.mock("./oidc-bearer", () => ({
  createOidcAccessTokenVerifier: h.createVerifierMock,
  verifyOidcAccessToken: h.verifyTokenMock,
  parseScopes: (scope: unknown) =>
    typeof scope === "string" ? scope.split(" ").filter(Boolean) : [],
}));

describe("hono-auth/cli-principal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns existing mapped user without calling /userinfo", async () => {
    const findUserIdByIdentity = vi.fn(() => okAsync("u-1"));
    const checkIdentityProvisioningRateLimit = vi.fn(() => okAsync(undefined));
    h.verifyTokenMock.mockReturnValueOnce(
      okAsync({
        iss: "https://example.auth0.com/",
        scope: "transactions:read",
        sub: "auth0|123",
      }),
    );
    const fetchMock = vi.fn();
    const resolve = createCliPrincipalResolver({
      audience: "https://api.o3o.app",
      checkIdentityProvisioningRateLimit,
      fetchImpl: fetchMock as unknown as typeof fetch,
      findUserIdByIdentity,
      issuer: "https://example.auth0.com",
      resolveUserIdByIdentity: () => okAsync("u-new"),
    });

    const res = await resolve({ accessToken: "token" });

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.issuer).toBe("https://example.auth0.com");
      expect(res.value.userId).toBe("u-1");
      expect(res.value.scopes).toEqual(["transactions:read"]);
    }
    expect(findUserIdByIdentity).toHaveBeenCalledWith({
      issuer: "https://example.auth0.com",
      subject: "auth0|123",
    });
    expect(checkIdentityProvisioningRateLimit).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches /userinfo and links identity when mapping does not exist", async () => {
    const checkIdentityProvisioningRateLimit = vi.fn(() => okAsync(undefined));
    h.verifyTokenMock.mockReturnValueOnce(
      okAsync({
        iss: "https://example.auth0.com",
        scope: "transactions:read transactions:write",
        sub: "auth0|123",
      }),
    );
    const fetchMock = vi.fn().mockResolvedValueOnce({
      json: async () => ({
        name: "Ada",
        email: "ada@example.com",
        email_verified: true,
        picture: "https://example.com/ada.png",
        sub: "auth0|123",
      }),
      ok: true,
    });
    const resolveUserIdByIdentity = vi.fn(() => okAsync("u-2"));

    const resolve = createCliPrincipalResolver({
      audience: "https://api.o3o.app",
      checkIdentityProvisioningRateLimit,
      fetchImpl: fetchMock as unknown as typeof fetch,
      findUserIdByIdentity: () => okAsync(null),
      issuer: "https://example.auth0.com",
      resolveUserIdByIdentity,
    });

    const res = await resolve({ accessToken: "token" });

    expect(res.isOk()).toBe(true);
    expect(checkIdentityProvisioningRateLimit).toHaveBeenCalledWith({
      issuer: "https://example.auth0.com",
      subject: "auth0|123",
    });
    expect(resolveUserIdByIdentity).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
      emailVerified: true,
      image: "https://example.com/ada.png",
      issuer: "https://example.auth0.com",
      subject: "auth0|123",
    });
  });

  it("stops before /userinfo when rate-limit checker fails", async () => {
    const checkerError = newRichError({
      code: "CLI_IDENTITY_RATE_LIMITED",
      details: {
        action: "CheckCliIdentityProvisioningRateLimit",
        reason: "Rate limit exceeded.",
      },
      i18n: { key: "errors.application.rate_limit" },
      isOperational: true,
      kind: "RateLimit",
      layer: "Application",
    });
    const checkIdentityProvisioningRateLimit = vi.fn(() =>
      errAsync(checkerError),
    );
    h.verifyTokenMock.mockReturnValueOnce(
      okAsync({
        iss: "https://example.auth0.com",
        scope: "transactions:read transactions:write",
        sub: "auth0|123",
      }),
    );
    const fetchMock = vi.fn();
    const resolve = createCliPrincipalResolver({
      audience: "https://api.o3o.app",
      checkIdentityProvisioningRateLimit,
      fetchImpl: fetchMock as unknown as typeof fetch,
      findUserIdByIdentity: () => okAsync(null),
      issuer: "https://example.auth0.com",
      resolveUserIdByIdentity: vi.fn(() => okAsync("u-2")),
    });

    const res = await resolve({ accessToken: "token" });

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;
    expect(res.error.kind).toBe("RateLimit");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
