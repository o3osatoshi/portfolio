import type { UserId } from "@repo/domain";
import { okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAccessTokenPrinResolver } from "./access-token-principal";

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

function asUserId(value: string): UserId {
  return value as UserId;
}

describe("hono-auth/access-token-principal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns existing mapped user without calling /userinfo", async () => {
    const findUserIdByExternalIdentity = vi.fn(() => okAsync(asUserId("u-1")));
    h.verifyTokenMock.mockReturnValueOnce(
      okAsync({
        iss: "https://example.auth0.com/",
        scope: "transactions:read",
        sub: "auth0|123",
      }),
    );
    const fetchMock = vi.fn();
    const resolve = createAccessTokenPrinResolver({
      audience: "https://api.o3o.app",
      fetchImpl: fetchMock as unknown as typeof fetch,
      findUserIdByKey: findUserIdByExternalIdentity,
      issuer: "https://example.auth0.com",
      linkExternalIdentityToUserByEmail: () => okAsync(asUserId("u-new")),
    });

    const res = await resolve({ accessToken: "token" });

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.issuer).toBe("https://example.auth0.com");
      expect(res.value.userId).toBe("u-1");
      expect(res.value.scopes).toEqual(["transactions:read"]);
    }
    expect(findUserIdByExternalIdentity).toHaveBeenCalledWith({
      issuer: "https://example.auth0.com",
      subject: "auth0|123",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches /userinfo and links identity when mapping does not exist", async () => {
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
    const linkExternalIdentityToUserByEmail = vi.fn(() =>
      okAsync(asUserId("u-2")),
    );

    const resolve = createAccessTokenPrinResolver({
      audience: "https://api.o3o.app",
      fetchImpl: fetchMock as unknown as typeof fetch,
      findUserIdByKey: () => okAsync(null),
      issuer: "https://example.auth0.com",
      linkExternalIdentityToUserByEmail: linkExternalIdentityToUserByEmail,
    });

    const res = await resolve({ accessToken: "token" });

    expect(res.isOk()).toBe(true);
    expect(linkExternalIdentityToUserByEmail).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
      emailVerified: true,
      image: "https://example.com/ada.png",
      issuer: "https://example.auth0.com",
      subject: "auth0|123",
    });
  });
});
